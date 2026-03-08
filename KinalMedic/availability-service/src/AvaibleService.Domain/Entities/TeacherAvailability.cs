using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using AvailabilityService.Domain.Enums;

namespace AvaibleService.Domain.Entities;

public class TeacherAvailability
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string TeacherId { get; set; } = null!;
    public string TeacherName { get; set; } = null!;

    [BsonRepresentation(BsonType.String)] // Guarda el nombre del enum en Mongo
    public TeacherStatus CurrentStatus { get; set; }
    
    public string LocationDescription { get; set; } = null!; // Ej: "Cerca de laboratorios"
    public DateTime LastUpdate { get; set; }
}