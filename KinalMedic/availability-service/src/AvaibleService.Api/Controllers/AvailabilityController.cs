using Microsoft.AspNetCore.Mvc;
using AvaibleService.Application.Services;
using AvailabilityService.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using AvaibleService.Persistence.Repositories;
using AvaibleService.Domain.Dtos;
using System;
using System.Linq;
using System.Threading.Tasks;

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

    private string? GetUserId() =>
        User.FindFirst("id")?.Value
        ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

    private string? GetUserName(string? fallback = null) =>
        User.FindFirst("name")?.Value
        ?? User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value
        ?? fallback;

    private string? GetUserEmail() =>
        User.FindFirst("email")?.Value
        ?? User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

    /// <summary>
    /// Médico operativo (ADMIN_ROLE). El ADMIN_PRINCIPAL no tiene estado de profesor.
    /// </summary>
    private bool IsMedic()
    {
        var role = User.FindFirst("role")?.Value
                   ?? User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        return string.Equals(role, "ADMIN_ROLE", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Principal o médico (p. ej. eliminar estado al borrar un médico).
    /// </summary>
    private bool IsPrincipalOrMedic()
    {
        var role = User.FindFirst("role")?.Value
                   ?? User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        return string.Equals(role, "ADMIN_ROLE", StringComparison.OrdinalIgnoreCase)
            || string.Equals(role, "ADMIN_PRINCIPAL", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Actualiza estado/ubicación del médico autenticado (solo su propio registro).
    /// </summary>
    [HttpPost("scan-qr")]
    [Authorize]
    public async Task<IActionResult> UpdateAvailability([FromBody] AvailabilityRequest request)
    {
        try
        {
            if (!IsMedic())
            {
                return StatusCode(403, new { message = "Solo el personal médico (ADMIN_ROLE) puede actualizar su estado de profesor. El Administrador Principal no tiene estado de profesor." });
            }

            var mongoId = GetUserId();
            if (string.IsNullOrEmpty(mongoId))
            {
                return Unauthorized(new { message = "Token sin identificador de usuario." });
            }

            var finalName = GetUserName(request.TeacherName) ?? "Profesor Médico";
            var location = string.IsNullOrWhiteSpace(request.Description)
                ? "Ubicación General"
                : request.Description;

            TeacherStatus parsedStatus = (TeacherStatus)request.Status;

            await _manager.ProcessQrUpdate(
                mongoId,
                finalName,
                parsedStatus,
                location,
                request.IsActive,
                GetUserEmail());

            return Ok(new
            {
                success = true,
                message = "Estado actualizado con éxito",
                teacherId = mongoId
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[KinalMedic Error]: {ex.Message}");
            return StatusCode(500, new
            {
                error = "Error interno en el servicio de disponibilidad",
                details = ex.Message
            });
        }
    }

    /// <summary>
    /// Auto-registro del médico al abrir el panel. Si ya existe, solo sincroniza nombre/email.
    /// </summary>
    [HttpPost("register-self")]
    [Authorize]
    public async Task<IActionResult> RegisterSelf([FromBody] RegisterSelfRequest? request)
    {
        try
        {
            if (!IsMedic())
            {
                return StatusCode(403, new { message = "Solo el personal médico (ADMIN_ROLE) se registra en disponibilidad. El Administrador Principal no tiene estado de profesor." });
            }

            var mongoId = GetUserId();
            if (string.IsNullOrEmpty(mongoId))
            {
                return Unauthorized(new { message = "Token sin identificador de usuario." });
            }

            var name = GetUserName(request?.TeacherName) ?? "Profesor Médico";
            var email = request?.Email ?? GetUserEmail();

            var record = await _manager.RegisterSelfAsync(mongoId, name, email);

            return Ok(new
            {
                success = true,
                message = "Médico registrado en disponibilidad",
                record
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al registrar médico", error = ex.Message });
        }
    }

    /// <summary>
    /// Activa o desactiva el turno del médico (visible para alumnos).
    /// </summary>
    [HttpPost("toggle-active")]
    [Authorize]
    public async Task<IActionResult> ToggleActive([FromBody] ToggleActiveRequest request)
    {
        try
        {
            if (!IsMedic())
            {
                return StatusCode(403, new { message = "Solo el personal médico (ADMIN_ROLE) puede activar/desactivar su estado." });
            }

            var mongoId = GetUserId();
            if (string.IsNullOrEmpty(mongoId))
            {
                return Unauthorized(new { message = "Token sin identificador de usuario." });
            }

            // Asegurar que exista el registro
            var existing = await _repository.GetByTeacherIdAsync(mongoId);
            if (existing == null)
            {
                var name = GetUserName() ?? "Profesor Médico";
                await _manager.RegisterSelfAsync(mongoId, name, GetUserEmail());
            }

            var updated = await _manager.ToggleActiveAsync(mongoId, request.IsActive);
            if (updated == null)
            {
                return NotFound(new { message = "No se encontró el registro del médico." });
            }

            return Ok(new
            {
                success = true,
                message = request.IsActive
                    ? "Ahora estás activo: los alumnos te verán disponible según tu ubicación."
                    : "Ahora estás inactivo: los alumnos te verán fuera de servicio.",
                record = updated
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al cambiar estado activo", error = ex.Message });
        }
    }

    /// <summary>
    /// Lista todos los médicos y su estado (público para alumnos y admin).
    /// </summary>
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

    /// <summary>
    /// Mi propio registro de disponibilidad.
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMine()
    {
        var mongoId = GetUserId();
        if (string.IsNullOrEmpty(mongoId))
            return Unauthorized();

        var record = await _repository.GetByTeacherIdAsync(mongoId);
        if (record == null)
            return NotFound(new { message = "Aún no tienes registro de disponibilidad." });

        return Ok(record);
    }

    /// <summary>
    /// Elimina el estado de profesor de un médico (cuando se borra el ADMIN o pasa a STUDENT).
    /// </summary>
    [HttpDelete("teacher/{teacherId}")]
    [Authorize]
    public async Task<IActionResult> RemoveTeacher(string teacherId)
    {
        try
        {
            if (!IsPrincipalOrMedic())
            {
                return StatusCode(403, new { message = "Solo el Administrador Principal o un médico autorizado pueden eliminar estados de médicos." });
            }

            if (string.IsNullOrWhiteSpace(teacherId))
            {
                return BadRequest(new { message = "teacherId es requerido." });
            }

            var deleted = await _manager.RemoveTeacherAsync(teacherId);
            return Ok(new
            {
                success = true,
                message = deleted > 0
                    ? "Estado de profesor eliminado de la disponibilidad."
                    : "No había registro de disponibilidad para este usuario.",
                deleted
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al eliminar disponibilidad", error = ex.Message });
        }
    }
}
