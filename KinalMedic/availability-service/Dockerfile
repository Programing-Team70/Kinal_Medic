FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY ["src/AvaibleService.Api/AvaibleService.Api.csproj", "AvaibleService.Api/"]
COPY ["src/AvaibleService.Application/AvaibleService.Application.csproj", "AvaibleService.Application/"]
COPY ["src/AvaibleService.Persistence/AvaibleService.Persistence.csproj", "AvaibleService.Persistence/"]
COPY ["src/AvaibleService.Domain/AvaibleService.Domain.csproj", "AvaibleService.Domain/"]

RUN dotnet restore "AvaibleService.Api/AvaibleService.Api.csproj"

COPY src/ . 

WORKDIR "/app/AvaibleService.Api"
RUN dotnet build "AvaibleService.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "AvaibleService.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=publish /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "AvaibleService.Api.dll"]