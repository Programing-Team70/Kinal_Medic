using AvaibleService.Api.Hubs;
using AvaibleService.Application.Services;
using AvaibleService.Persistence.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? "ClaveSuperSecreta123";
var keyBytes = Encoding.UTF8.GetBytes(jwtSecret);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenHandlers.Clear();
        options.TokenHandlers.Add(new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler());

        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuerSigningKey = true,

            IssuerSigningKeyResolver = (token, securityToken, kid, parameters) => {
                return new[] { new SymmetricSecurityKey(keyBytes) };
            },

            ValidateIssuer = false,
            ValidateAudience = false,
            RequireExpirationTime = true,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents {
            OnAuthenticationFailed = context => {
                Console.WriteLine($"*** ERROR AUTH: {context.Exception.Message} ***");
                return Task.CompletedTask;
            },
            OnTokenValidated = context => {
                Console.WriteLine("*** ÉXITO: El profesor ha sido autenticado ***");
                return Task.CompletedTask;
            },
            OnMessageReceived = context => {
                Console.WriteLine($"*** TOKEN RECIBIDO: {context.Token?.Substring(0, 20)}... ***");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddSignalR();
builder.Services.AddSingleton<AvailabilityRepository>();
builder.Services.AddScoped<AvailabilityManager>();
builder.Services.AddControllers();

var app = builder.Build();

if (app.Environment.IsDevelopment()) {
    Microsoft.IdentityModel.Logging.IdentityModelEventSource.ShowPII = true;
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<AvailabilityHub>("/status-hub");

app.Run();