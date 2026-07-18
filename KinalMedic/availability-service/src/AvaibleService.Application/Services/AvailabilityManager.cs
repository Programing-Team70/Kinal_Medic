using AvaibleService.Domain.Entities;
using AvailabilityService.Domain.Enums;
using AvaibleService.Persistence.Repositories;
using AvaibleService.Api.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace AvaibleService.Application.Services;

public class AvailabilityManager
{
    private readonly AvailabilityRepository _repository;
    private readonly IHubContext<AvailabilityHub> _hubContext;

    public AvailabilityManager(AvailabilityRepository repository, IHubContext<AvailabilityHub> hubContext)
    {
        _repository = repository;
        _hubContext = hubContext;
    }

    /// <summary>
    /// Actualiza ubicación/estado del médico autenticado (upsert por teacherId).
    /// </summary>
    public async Task ProcessQrUpdate(
        string teacherId,
        string name,
        TeacherStatus newStatus,
        string description,
        bool? isActive = null,
        string? email = null)
    {
        var existing = await _repository.GetByTeacherIdAsync(teacherId);

        var availability = new TeacherAvailability
        {
            TeacherId = teacherId,
            TeacherName = name,
            Email = email ?? existing?.Email,
            CurrentStatus = newStatus,
            LocationDescription = description,
            LastUpdate = DateTime.UtcNow,
            // Si no se envía isActive, mantener el actual o true al actualizar ubicación
            IsActive = isActive ?? existing?.IsActive ?? true
        };

        if (existing != null)
        {
            availability.Id = existing.Id;
        }

        await _repository.UpdateStatusAsync(availability);

        // Releer para devolver estado consistente
        var saved = await _repository.GetByTeacherIdAsync(teacherId) ?? availability;
        await _hubContext.Clients.All.SendAsync("TeacherMoved", saved);
    }

    /// <summary>
    /// Registra al médico en la lista de disponibilidad (automático al abrir el panel).
    /// </summary>
    public async Task<TeacherAvailability> RegisterSelfAsync(string teacherId, string name, string? email)
    {
        var entity = new TeacherAvailability
        {
            TeacherId = teacherId,
            TeacherName = name,
            Email = email,
            CurrentStatus = TeacherStatus.Patio, // valor por defecto del enum (0)
            LocationDescription = "Aún no reporta ubicación",
            IsActive = false,
            LastUpdate = DateTime.UtcNow
        };

        var result = await _repository.UpsertSelfAsync(entity);
        await _hubContext.Clients.All.SendAsync("TeacherMoved", result);
        return result;
    }

    public async Task<TeacherAvailability?> ToggleActiveAsync(string teacherId, bool isActive)
    {
        var result = await _repository.SetActiveAsync(teacherId, isActive);
        if (result != null)
        {
            await _hubContext.Clients.All.SendAsync("TeacherMoved", result);
        }
        return result;
    }

    /// <summary>
    /// Quita al médico de la vista de disponibilidad (al eliminar usuario o bajar a STUDENT).
    /// </summary>
    public async Task<long> RemoveTeacherAsync(string teacherId)
    {
        var deleted = await _repository.DeleteByTeacherIdAsync(teacherId);
        if (deleted > 0)
        {
            await _hubContext.Clients.All.SendAsync("TeacherRemoved", new { teacherId });
        }
        return deleted;
    }
}
