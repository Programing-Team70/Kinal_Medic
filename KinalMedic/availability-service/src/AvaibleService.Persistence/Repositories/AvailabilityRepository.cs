using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AvaibleService.Domain.Entities;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace AvaibleService.Persistence.Repositories;

public class AvailabilityRepository
{
    private readonly IMongoCollection<TeacherAvailability> _collection;
    private bool _initialized;

    public AvailabilityRepository(IConfiguration config)
    {
        var client = new MongoClient(config.GetConnectionString("MongoDb"));
        var database = client.GetDatabase("KinalMedic");
        _collection = database.GetCollection<TeacherAvailability>("TeacherStatuses");
    }

    /// <summary>
    /// 
    /// </summary>
    public async Task InitializeAsync()
    {
        if (_initialized) return;

        try
        {
            // 1) Limpiar duplicados antes de crear el índice único
            await CleanupDuplicatesAsync();

            // 2) Un solo documento por médico (teacherId del JWT / Mongo user id)
            var indexKeys = Builders<TeacherAvailability>.IndexKeys.Ascending(x => x.TeacherId);
            var indexOptions = new CreateIndexOptions
            {
                Unique = true,
                Name = "ux_teacherId",
                Background = true,
            };

            try
            {
                await _collection.Indexes.CreateOneAsync(
                    new CreateIndexModel<TeacherAvailability>(indexKeys, indexOptions));
            }
            catch (MongoCommandException ex) when (ex.CodeName == "IndexOptionsConflict" || ex.Code == 85 || ex.Code == 86)
            {
                // Índice ya existe con otra definición: recrear
                try { await _collection.Indexes.DropOneAsync("ux_teacherId"); } catch { /* ignore */ }
                await _collection.Indexes.CreateOneAsync(
                    new CreateIndexModel<TeacherAvailability>(indexKeys, indexOptions));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AvailabilityRepository] InitializeAsync: {ex.Message}");
        }

        _initialized = true;
    }

    /// <summary>
    /// Si un médico tiene varios documentos, deja solo el mejor (activo + más reciente).
    /// </summary>
    public async Task CleanupDuplicatesAsync()
    {
        var all = await _collection.Find(_ => true).ToListAsync();
        var groups = all
            .Where(x => !string.IsNullOrWhiteSpace(x.TeacherId))
            .GroupBy(x => x.TeacherId.Trim(), StringComparer.OrdinalIgnoreCase)
            .Where(g => g.Count() > 1);

        foreach (var group in groups)
        {
            var ordered = group
                .OrderByDescending(x => x.IsActive)
                .ThenByDescending(x => x.LastUpdate)
                .ToList();

            var keep = ordered[0];
            var removeIds = ordered.Skip(1).Select(x => x.Id).Where(id => !string.IsNullOrEmpty(id)).ToList();

            if (removeIds.Count == 0) continue;

            var deleteFilter = Builders<TeacherAvailability>.Filter.In(x => x.Id, removeIds);
            var result = await _collection.DeleteManyAsync(deleteFilter);
            Console.WriteLine(
                $"[AvailabilityRepository] Duplicados de teacherId={keep.TeacherId}: " +
                $"se conservó 1, se eliminaron {result.DeletedCount}");
        }

        // También colapsar por email si hay basura sin teacherId consistente
        var byEmail = all
            .Where(x => !string.IsNullOrWhiteSpace(x.Email))
            .GroupBy(x => x.Email!.Trim().ToLowerInvariant())
            .Where(g => g.Select(x => x.TeacherId).Distinct(StringComparer.OrdinalIgnoreCase).Count() == 1
                        && g.Count() > 1);

        // (ya cubierto por teacherId). Por si acaso hay mismo email con mismo teacherId residual:
        // no-op extra.
    }

    public async Task<TeacherAvailability?> GetByTeacherIdAsync(string teacherId)
    {
        if (string.IsNullOrWhiteSpace(teacherId)) return null;
        var id = teacherId.Trim();
        return await _collection
            .Find(x => x.TeacherId == id)
            .SortByDescending(x => x.LastUpdate)
            .FirstOrDefaultAsync();
    }

    /// <summary>Actualiza estado/ubicación de forma atómica (1 doc por teacherId).</summary>
    public async Task UpdateStatusAsync(TeacherAvailability availability)
    {
        var teacherId = availability.TeacherId.Trim();
        var filter = Builders<TeacherAvailability>.Filter.Eq(x => x.TeacherId, teacherId);

        var update = Builders<TeacherAvailability>.Update
            .Set(x => x.TeacherName, availability.TeacherName)
            .Set(x => x.Email, availability.Email)
            .Set(x => x.IsActive, availability.IsActive)
            .Set(x => x.CurrentStatus, availability.CurrentStatus)
            .Set(x => x.LocationDescription, availability.LocationDescription)
            .Set(x => x.LastUpdate, availability.LastUpdate)
            .SetOnInsert(x => x.TeacherId, teacherId);

        await _collection.UpdateOneAsync(filter, update, new UpdateOptions { IsUpsert = true });
    }

    /// <summary>
    /// Registra o sincroniza al médico sin crear duplicados (upsert atómico).
    /// </summary>
    public async Task<TeacherAvailability> UpsertSelfAsync(TeacherAvailability availability)
    {
        var teacherId = availability.TeacherId.Trim();
        var filter = Builders<TeacherAvailability>.Filter.Eq(x => x.TeacherId, teacherId);

        // Si ya existe: solo nombre/email. Si no: inserta con isActive=false.
        var update = Builders<TeacherAvailability>.Update
            .Set(x => x.TeacherName, availability.TeacherName)
            .Set(x => x.Email, availability.Email)
            .SetOnInsert(x => x.TeacherId, teacherId)
            .SetOnInsert(x => x.IsActive, false)
            .SetOnInsert(x => x.CurrentStatus, availability.CurrentStatus)
            .SetOnInsert(x => x.LocationDescription,
                string.IsNullOrWhiteSpace(availability.LocationDescription)
                    ? "Aún no reporta ubicación"
                    : availability.LocationDescription)
            .SetOnInsert(x => x.LastUpdate, DateTime.UtcNow);

        var options = new FindOneAndUpdateOptions<TeacherAvailability>
        {
            IsUpsert = true,
            ReturnDocument = ReturnDocument.After,
        };

        try
        {
            var result = await _collection.FindOneAndUpdateAsync(filter, update, options);
            return result!;
        }
        catch (MongoWriteException ex) when (ex.WriteError?.Category == ServerErrorCategory.DuplicateKey)
        {
            // Carrera rara: otro hilo insertó al mismo tiempo → leer el existente
            var existing = await GetByTeacherIdAsync(teacherId);
            if (existing != null)
            {
                var nameUpdate = Builders<TeacherAvailability>.Update
                    .Set(x => x.TeacherName, availability.TeacherName)
                    .Set(x => x.Email, availability.Email);
                await _collection.UpdateOneAsync(filter, nameUpdate);
                return (await GetByTeacherIdAsync(teacherId))!;
            }
            throw;
        }
    }

    public async Task<TeacherAvailability?> SetActiveAsync(string teacherId, bool isActive)
    {
        var id = teacherId.Trim();
        var filter = Builders<TeacherAvailability>.Filter.Eq(x => x.TeacherId, id);
        var update = Builders<TeacherAvailability>.Update
            .Set(x => x.IsActive, isActive)
            .Set(x => x.LastUpdate, DateTime.UtcNow);

        var options = new FindOneAndUpdateOptions<TeacherAvailability>
        {
            ReturnDocument = ReturnDocument.After,
        };

        return await _collection.FindOneAndUpdateAsync(filter, update, options);
    }

    /// <summary>
    /// Lista médicos sin duplicados (uno por teacherId).
    /// </summary>
    public async Task<List<TeacherAvailability>> GetAllAsync()
    {
        var all = await _collection.Find(_ => true).ToListAsync();

        // Seguridad: deduplicar en memoria por si quedó basura previa al índice
        var unique = all
            .Where(x => !string.IsNullOrWhiteSpace(x.TeacherId))
            .GroupBy(x => x.TeacherId.Trim(), StringComparer.OrdinalIgnoreCase)
            .Select(g => g
                .OrderByDescending(x => x.IsActive)
                .ThenByDescending(x => x.LastUpdate)
                .First())
            .OrderByDescending(x => x.IsActive)
            .ThenBy(x => x.TeacherName)
            .ToList();

        return unique;
    }

    /// <summary>
    /// Elimina todos los estados de disponibilidad de un médico (por teacherId de users).
    /// </summary>
    public async Task<long> DeleteByTeacherIdAsync(string teacherId)
    {
        if (string.IsNullOrWhiteSpace(teacherId)) return 0;
        var id = teacherId.Trim();
        var filter = Builders<TeacherAvailability>.Filter.Eq(x => x.TeacherId, id);
        var result = await _collection.DeleteManyAsync(filter);
        return result.DeletedCount;
    }
}
