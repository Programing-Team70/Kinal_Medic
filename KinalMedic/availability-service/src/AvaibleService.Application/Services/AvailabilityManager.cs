using AvaibleService.Domain.Entities;
using AvailabilityService.Domain.Enums;
using AvaibleService.Persistence.Repositories;
using AvaibleService.Api.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace AvaibleService.Application.Services;

public class AvailabilityManager
{
    private readonly AvailabilityRepository _repository;
    private readonly IHubContext<AvailabilityHub> _hubContext; // Para Tiempo Real

    public AvailabilityManager(AvailabilityRepository repository, IHubContext<AvailabilityHub> hubContext)
    {
        _repository = repository;
        _hubContext = hubContext;
    }

    public async Task ProcessQrUpdate(string teacherId, string name, TeacherStatus newStatus, string description)
    {
        var availability = new TeacherAvailability
        {
            TeacherId = teacherId,
            TeacherName = name,
            CurrentStatus = newStatus,
            LocationDescription = description,
            LastUpdate = DateTime.UtcNow
        };

        await _repository.UpdateStatusAsync(availability);

        await _hubContext.Clients.All.SendAsync("TeacherMoved", availability);
    }
}