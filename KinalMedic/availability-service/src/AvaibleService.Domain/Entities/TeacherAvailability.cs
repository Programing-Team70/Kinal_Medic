using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using AvailabilityService.Domain.Enums;

namespace AvaibleService.Domain.Entities;

public class TeacherAvailability
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    [BsonElement("id")]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    /// <summary>ID del usuario en user-student-service (claim JWT "id").</summary>
    [BsonElement("teacherId")]
    public string TeacherId { get; set; } = null!;

    [BsonElement("teacherName")]
    public string TeacherName { get; set; } = null!;

    [BsonElement("email")]
    public string? Email { get; set; }

    /// <summary>
    /// true = en turno / visible como disponible para atender.
    /// false = fuera de servicio (el alumno ve "No disponible").
    /// </summary>
    [BsonElement("isActive")]
    public bool IsActive { get; set; } = false;

    [BsonElement("currentStatus")]
    public TeacherStatus CurrentStatus { get; set; }

    [BsonElement("locationDescription")]
    public string LocationDescription { get; set; } = "Sin ubicación";

    [BsonElement("lastUpdate")]
    public DateTime LastUpdate { get; set; } = DateTime.UtcNow;
}
