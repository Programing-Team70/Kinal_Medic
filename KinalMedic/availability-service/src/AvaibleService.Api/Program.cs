using AvaibleService.Api.Hubs;
using AvaibleService.Application.Services;
using AvaibleService.Persistence.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

// ==================== JWT CONFIG ====================
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") 
                ?? builder.Configuration["JWT_SECRET"] 
                ?? "SecretKeyForKinalMedicForKinalMedicKinalKinal";

Console.WriteLine($"JWT Secret length: {jwtSecret.Length} characters");

var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
{
    KeyId = "KinalMedic-SigningKey-2026"   // ← ESTO ES LO MÁS IMPORTANTE
};

builder.Services.AddCors(options =>
{
    options.AddPolicy("KinalAllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173", 
            "http://localhost:5174", 
            "http://127.0.0.1:5173", 
            "http://127.0.0.1:5174", 
            "https://kinalmedic.web.app")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ==================== AUTHENTICATION ====================
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,
            ValidateIssuer = false,
            ValidateAudience = false,
            RequireExpirationTime = true,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    context.Token = authHeader.Substring("Bearer ".Length).Trim();
                }

                var tokenPreview = context.Token?.Substring(0, Math.Min(30, context.Token?.Length ?? 0)) ?? "null";
                Console.WriteLine($"*** TOKEN RECIBIDO: {tokenPreview}... ***");
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"*** ERROR AUTH: {context.Exception.Message} ***");
                if (context.Exception.InnerException != null)
                    Console.WriteLine($"   Inner: {context.Exception.InnerException.Message}");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine("*** ÉXITO: Token validado correctamente ***");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddSignalR();
builder.Services.AddSingleton<AvailabilityRepository>();
builder.Services.AddScoped<AvailabilityManager>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddSwaggerGen();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

try
{
    var repo = app.Services.GetRequiredService<AvailabilityRepository>();
    await repo.InitializeAsync();
    Console.WriteLine("[Availability] Inicialización OK");
}
catch (Exception ex)
{
    Console.WriteLine($"[Availability] Init warning: {ex.Message}");
}

if (app.Environment.IsDevelopment())
{
    Microsoft.IdentityModel.Logging.IdentityModelEventSource.ShowPII = true;
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("KinalAllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<AvailabilityHub>("/status-hub");

app.Run();