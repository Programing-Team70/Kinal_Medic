# medic-client

Cliente móvil **React Native (Expo SDK 55)** de **Kinal Medic**.

Porta la funcionalidad de `medic-admin` (React web) usando la arquitectura de `client-user` (React Native).

## Stack

- Expo **SDK 54** / React 19.1 / React Native 0.81 (compatible con Expo Go de la tienda)
- React Navigation 7 (tabs + stack)
- Zustand + AsyncStorage (sesión)
- Axios (microservicios)
- react-hook-form

> **Nota:** Se usa SDK 54 (no 55) porque Expo Go en App Store / Play Store suele soportar hasta 54. Así el QR funciona en el teléfono.

## Arranque

```bash
cd medic-client
pnpm install
pnpm start
```

1. Levanta los backends (`docker-compose up -d` en `KinalMedic/`).
2. Abre **Expo Go** en el teléfono (misma Wi‑Fi que la PC).
3. Escanea el QR. En emulador Android: `pnpm android`.

## Conexión al backend (importante para login)

En un **teléfono físico**, `localhost` apunta al teléfono, no a tu PC.

**La app auto-detecta la IP del PC vía Expo Go** (prioridad 1).  
Si falla, usa `EXPO_PUBLIC_API_HOST` del `.env`.

1. En la PC: `ipconfig` → **IPv4 de la Wi‑Fi** (ej. `192.168.24.46`).
2. Edita `medic-client/.env` si la IP cambió:

```env
EXPO_PUBLIC_API_HOST=http://192.168.24.46
```

3. **Reinicia Expo** por completo (`Ctrl+C` y `pnpm start`) y vuelve a escanear el QR.

En la pantalla de login verás el **Host API** actual (caja de depuración abajo).

Credenciales seed:
- `admin@kinal.edu.gt` / `adminKinal123` (ADMIN_PRINCIPAL)

Backends: `docker compose up -d` en `KinalMedic/`.

| Variable | Uso |
|----------|-----|
| `EXPO_PUBLIC_API_HOST` | Base `http://IP` (puertos 3001–3005 se agregan solos) |
| `EXPO_PUBLIC_AUTH_URL` | Override completo del servicio de usuarios |
| `EXPO_PUBLIC_MEDICAL_RECORDS_URL` | Override registros médicos |
| `EXPO_PUBLIC_INVENTORY_API_URL` | Override inventario |
| `EXPO_PUBLIC_AVAILABILITY_URL` | Override disponibilidad |
| `EXPO_PUBLIC_NOTIFICATION_URL` | Override notificaciones |

**Notas:**

- Emulador Android: si no hay `.env`, se usa `http://10.0.2.2`
- Firewall de Windows: permite Node/Docker en la red privada

## Roles (alineado con medic-admin web)

| Rol | Quién | Pantallas / permisos |
|-----|--------|----------------------|
| `ADMIN_PRINCIPAL` | Super-admin único (seed) | Todo: usuarios (crear médicos), inventario, registro, notificaciones (bandeja), estado (solo lectura), perfil. **Sin** estado de profesor propio. |
| `ADMIN_ROLE` | Médico | Registro, inventario, notificaciones (responder), estado (solo el suyo), usuarios (solo alumnos + su perfil) |
| `STUDENT_ROLE` | Alumno | **Notificaciones** (solicitud + respuestas), **Emergencia** (aparte), estado profesor (lectura), perfil |

## Estructura

```
src/
  features/
    auth/           # login / registro
    medical/        # historial clínico
    inventory/      # medicamentos
    availability/   # estado del profesor
    notification/   # solicitudes + EmergencyScreen
    users/          # gestión por rol
    profile/ home/
  navigation/       # AppNavigator, AuthStack, MainTabs
  shared/           # api, components, constants, store
```
