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
                ?? "SecretKeyForKinalMedicForKinalMedi";
var keyBytes = Encoding.UTF8.GetBytes(jwtSecret);

builder.Services.AddCors(options =>
{
    options.AddPolicy("KinalAllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "https://kinalmedic.web.app")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenHandlers.Clear();
        options.TokenHandlers.Add(new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler());

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKeyResolver = (token, securityToken, kid, parameters) =>
            {
                return new[] { new SymmetricSecurityKey(keyBytes) };
            },
            ValidateIssuer = false,
            ValidateAudience = false,
            RequireExpirationTime = true,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
            SignatureValidator = delegate (string token, TokenValidationParameters parameters)
            {
                var jwtHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                jwtHandler.ValidateToken(token, parameters, out SecurityToken validatedToken);
                return validatedToken;
            }
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"*** ERROR AUTH: {context.Exception.Message} ***");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine("*** ÉXITO: El profesor ha sido autenticado ***");
                return Task.CompletedTask;
            },
            OnMessageReceived = context =>
            {
                Console.WriteLine($"*** TOKEN RECIBIDO: {context.Token?.Substring(0, Math.Min(20, context.Token?.Length ?? 0))}... ***");
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