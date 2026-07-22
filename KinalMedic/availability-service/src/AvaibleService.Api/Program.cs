using AvaibleService.Api.Hubs;
using AvaibleService.Application.Services;
using AvaibleService.Persistence.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") 
                ?? builder.Configuration["JWT_SECRET"] 
                ?? "SecretKeyForKinalMedicForKinalMedicKinalKinal";

var issuer = builder.Configuration["Issuer"] ?? "KinalMedic";
var audience = builder.Configuration["Audience"] ?? "KinalMedic";

Console.WriteLine($"JWT Secret length: {jwtSecret.Length} characters");

if (string.IsNullOrWhiteSpace(jwtSecret) || jwtSecret.Length < 32)
{
    Console.WriteLine("⚠️ ADVERTENCIA: JWT_SECRET es débil o no está configurado correctamente");
}

var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));

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
                Console.WriteLine("*** ÉXITO: El profesor ha sido autenticado ***");
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
    Console.WriteLine("[Availability] Índices y limpieza de duplicados OK");
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