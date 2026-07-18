using System.Text.Json.Serialization;

namespace AvaibleService.Domain.Dtos;

public class AvailabilityRequest
{
    [JsonPropertyName("status")]
    public int Status { get; set; }

    [JsonPropertyName("teacherName")]
    public string? TeacherName { get; set; }

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    /// <summary>Opcional: al actualizar también se puede forzar activo/inactivo.</summary>
    [JsonPropertyName("isActive")]
    public bool? IsActive { get; set; }
}

public class RegisterSelfRequest
{
    [JsonPropertyName("teacherName")]
    public string? TeacherName { get; set; }

    [JsonPropertyName("email")]
    public string? Email { get; set; }
}

public class ToggleActiveRequest
{
    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; }
}
