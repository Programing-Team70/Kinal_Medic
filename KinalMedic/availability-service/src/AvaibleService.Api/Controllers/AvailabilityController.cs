using Microsoft.AspNetCore.Mvc;
using AvaibleService.Application.Services;
using AvailabilityService.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using AvaibleService.Persistence.Repositories;
using AvaibleService.Domain.Entities;

[ApiController]
[Route("api/availability")]
public class AvailabilityController : ControllerBase
{
    private readonly AvailabilityManager _manager;
    private readonly AvailabilityRepository _repository;

    public AvailabilityController(AvailabilityManager manager, AvailabilityRepository repository)
    {
        _manager = manager;
        _repository = repository;
    }

    [HttpPost("scan-qr")]
    [Authorize]
    public async Task<IActionResult> UpdateAvailability([FromBody] AvailabilityRequest request)
    {
        // Extraemos el ID generado por defecto por MongoDB que Node puso en el token
        var mongoId = User.FindFirst("id")?.Value;

        if (string.IsNullOrEmpty(mongoId))
            return Unauthorized("No se encontró el ID del profesor en el token.");

        var availability = new TeacherAvailability
        {
            TeacherId = mongoId, // Aquí se guarda el string de 24 caracteres
            CurrentStatus = (TeacherStatus)request.Status,
            LocationDescription = request.Description,
            LastUpdate = DateTime.UtcNow
        };

        // El Repositorio hará el Upsert automáticamente
        await _repository.UpdateStatusAsync(availability);
        return Ok(new { message = "Estado actualizado", teacherId = mongoId });
    }

    [HttpGet("all-teachers")]
    public async Task<IActionResult> GetAllStatus()
    {
        try
        {
            var statuses = await _repository.GetAllAsync();
            return Ok(statuses);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al obtener estados", error = ex.Message });
        }
    }
}

public record QrRequest(string TeacherId, string TeacherName, TeacherStatus Status, string Description);