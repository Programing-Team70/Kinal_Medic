using System;
using AvaibleService.Domain.Entities;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
namespace AvaibleService.Persistence.Repositories;

public class AvailabilityRepository
{
    private readonly IMongoCollection<TeacherAvailability> _collection;

    public AvailabilityRepository(IConfiguration config)
    {
        var client = new MongoClient(config.GetConnectionString("MongoDb"));
        var database = client.GetDatabase("KinalAvailabilityDB");
        _collection = database.GetCollection<TeacherAvailability>("TeacherStatuses");
    }

    public async Task<TeacherAvailability?> GetByTeacherIdAsync(string teacherId) =>
        await _collection.Find(x => x.TeacherId == teacherId).FirstOrDefaultAsync();

    public async Task UpdateStatusAsync(TeacherAvailability availability)
    {
        var filter = Builders<TeacherAvailability>.Filter.Eq(x => x.TeacherId, availability.TeacherId);
        await _collection.ReplaceOneAsync(filter, availability, new ReplaceOptions { IsUpsert = true });
    }

    public async Task<List<TeacherAvailability>> GetAllAsync()
    {
        return await _collection.Find(_ => true).ToListAsync();
    }
}