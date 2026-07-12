# Kinal_Medic - Sistema de Gestión de Enfermería

**Nota**: Este proyecto ha sido desarrollado por el equipo de desarrollo Programming Team utilizando como base técnica y educativa la arquitectura de microservicios y las mejores prácticas de desarrollo web proporcionada por el Catedrático Braulio Echeverría (PEM) del curso IN6AV, Kinal Guatemala 2026.

**Retraso en la entrega:** Durante el desarrollo del proyecto se presentaron inconvenientes que generaron un retraso en la planificación original. Como consecuencia, los Sprints 3 y 4 no fueron entregados en sus fechas establecidas, sino que se integraron y entregaron en conjunto con los Sprints 5 y 6 en la última entrega. Esto impactó el cronograma previsto, pero permitió consolidar de manera completa el trabajo de dichas etapas.[Ver Nota de Notificación de Atrasos](NOTIFICACION.md)

## Descripción:
Este repositorio contiene el núcleo central de **Kinal_Medic**, una plataforma integral diseñada para la digitalización y optimización del área de enfermería institucional. El sistema funciona como un ecosistema unificado que conecta a estudiantes, encargados de salud y administración, permitiendo desde el monitoreo de disponibilidad del personal médico hasta la gestión de historiales clínicos y control de inventario de medicamentos.

---

## Funcionalidades Principales
### 1. Gestión de Identidad y Acceso
* **Registro de Alumnos:** Gestión de datos sensibles, incluyendo contactos de emergencia, tipos de sangre y alergias para diagnósticos precisos.
* **Autenticación Segura:** Acceso controlado mediante hashing de contraseñas y validación de tokens JWT.
* **Ficha Médica Digital:** Perfil detallado del estudiante con su historial de atención y condiciones crónicas.

### 2. Control de Disponibilidad
* **Monitoreo en Tiempo Real:** Sistema para visualizar la ubicación y estado del encargado (En enfermería, En ronda, En clase).
* **Panel de Control:** Interfaz simplificada para que el docente/médico actualice su disponibilidad con un solo clic.
* **Optimización de Atención:** Reduce la incertidumbre del estudiante al saber exactamente cuándo y dónde encontrar asistencia médica.

### 3. Registro Clínico y Seguimiento
* **Historial de Consultas:** Almacenamiento digital de diagnósticos, síntomas y tratamientos previos.
* **Emisión de Recetas:** Registro de medicamentos suministrados durante la visita para mantener un control terapéutico.
* **Analítica de Salud:** Capacidad de visualizar tendencias de enfermedades o incidentes frecuentes dentro de la institución.

### 4. Gestión de Inventario y Notificaciones
* **Control de Stock:** Registro automatizado de medicamentos con alertas de stock bajo para evitar el desabastecimiento.
* **Disparador de Alertas:** Sistema de notificaciones automáticas vía correo electrónico a padres de familia o encargados tras una atención de emergencia.
* **Registro de Suministros:** Trazabilidad completa de qué insumo fue utilizado, por quién y en qué fecha.

---

## Tecnologías Utilizadas

| Componente | Tecnología |
|---|---|
| Tiempo de ejecución | Node.js / .NET 8 |
| Lenguaje | JavaScript / C# |
| Bases de Datos | MongoDB / SQL Server |
| Frontend | React + Vite |
| Documentación | Postman / Swagger |

---

## Ramas del Proyecto (Jira / Sprints)

| Rama | Servicio |
|---|---|
| `KM_DOCKER-001` | Dockerización |
| `KM-001` | medic-admin |
| `KM-002` | user-student-service |
| `KM-003` | medical-records-service |
| `KM-004` | availability-service |
| `KM-005` | inventory-service |
| `KM-006` | notification-service |

---

## Endpoints API (user-student-service)
Base URL: `http://localhost:3001/api/students`

### Autenticación y Alumnos (`/api/students`)

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| `POST` | `/login` | Iniciar sesión en el sistema | Global |
| `POST` | `/register` | Registro inicial de alumno | Global |
| `POST` | `/create` | Registro administrativo de alumnos | Admin |
| `GET` | `/me` | Obtener mi perfil de usuario actual | User |
| `GET` | `/all` | Listar todos los alumnos registrados | Admin |
| `GET` | `/carnet/{carnet}` | Buscar alumno específico por carnet | Admin |
| `PUT` | `/update/{id}` | Actualizar datos de un usuario | Admin |
| `DELETE` | `/delete/{id}` | Eliminar un usuario del sistema | Admin |

---

## Endpoints API (medical-records-service)
Base URL: `http://localhost:3002/api/records`

### Registros Clínicos (`/api/records`)

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| `POST` | `/add` | Crear nuevo historial clínico | Admin |
| `GET` | `/{carnet}` | Consultar historial clínico por carnet | Admin |
| `PUT` | `/update/{id}` | Actualizar un registro médico existente | Admin |
| `DELETE` | `/delete/{id}` | Eliminar un registro médico | Admin |

---

## Endpoints API (inventory-service)
Base URL: `http://localhost:3003/inv`

### Medicamentos (`/inv/medicine`)

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| `GET` | `/medicine` | Visualizar todo el inventario | Admin |
| `GET` | `/medicine/{id}` | Obtener detalles por ID específico | Admin |
| `POST` | `/medicine` | Registrar un nuevo medicamento | Admin |
| `PUT` | `/medicine/{id}` | Actualizar información de medicamento | Admin |
| `PATCH` | `/medicine/{id}` | Desactivar un medicamento del inventario | Admin |

---

## Endpoints API (availability-service)
Base URL: `http://localhost:3004/api/availability`

### Disponibilidad del Personal (`/api/availability`)

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| `GET` | `/all-teachers` | Ver el estado de todo el personal | Global |
| `POST` | `/scan-qr` | Actualizar ubicación mediante QR | Admin |

---

### Modelos de Request

## User-Student-Service
Base URL: `http://localhost:3001/api/students`

#### Inicio de Sesión (`/login`)
```json
{
  "email": "admin@kinal.edu.gt",
  "password": "adminKinal123"
}
```

### Registro de Alumno (`/register`)
```json
{
  "name": "Juan Pérez",
  "email": "juan.perez@kinal.edu.gt",
  "password": "passwordSeguro123",
  "carnet": "2026335",
  "carrera": "Informática"
}
```

#### Creación Administrativa (`/create`)
> **Nota:** Requiere Token de Administrador.

```json
{
  "name": "Juan Lopez",
  "email": "ljuan@kinal.edu.gt",
  "password": "temporalPassword456",
  "carnet": "2026150",
  "carrera": "Enfermería",
  "role": "student"
}
```

#### Actualizar Usuario (`/update/{id}`)
> **Nota:** Requiere Token de Administrador.

```json
{
  "name": "Juan Lopez Actualizado",
  "email": "ljuan.updated@kinal.edu.gt",
  "carrera": "Informática"
}
```

---

## Medical-Records-Service
Base URL: `http://localhost:3002/api/records`

#### Agregar Historial Clínico (`/add`)
> **Nota:** Requiere Token de Administrador.
```json
{
  "carnet": "2023010",
  "description": "Paciente presenta gripe fuerte",
  "medication": "Paracetamol 500mg cada 8 horas",
  "vitals": "Presión 120/80, Temperatura 38.5"
}
```

#### Actualizar Registro Médico (`/update/{id}`)
> **Nota:** Requiere Token de Administrador.
```json
{
  "description": "Paciente presenta mejoría",
  "medication": "Ibuprofeno 400mg cada 12 horas",
  "vitals": "Presión 118/78, Temperatura 37.1"
}
```

---

## Inventory-Service
Base URL: `http://localhost:3003/inv`

#### Crear Medicamento (`/medicine`)
> **Nota:** Requiere Token de Administrador.
```json
{
  "name": "Paracetamol",
  "genericName": "Acetaminophen",
  "description": "Medicamento para aliviar fiebre y dolor",
  "manufacturer": "Bayer",
  "category": "antipyretic",
  "dosageForm": "tablet",
  "stock": 120,
  "expirationDate": "2027-05-10"
}
```

---

## Availability-Service
Base URL: `http://localhost:3004/api/availability`

#### Cambiar Estado / Escaneo QR (`/scan-qr`)
```json
{
  "status": 5,
  "description": "En Parqueo"
}
```

---

## 📁 Estructura del Proyecto

```
medic-admin/
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── app/
│   │   ├── layouts/
│   │   │   └── DashboardPage.jsx         # Layout principal del dashboard
│   │   ├── router/
│   │   │   ├── AppRouter.jsx             # Enrutamiento principal
│   │   │   ├── ProtecterRoute.jsx        # Rutas protegidas por autenticación
│   │   │   └── RoleGuard.jsx             # Control de acceso por rol
│   │   ├── App.jsx                       # Componente raíz
│   │   └── main.jsx                      # Punto de entrada React
│   │
│   ├── assets/
│   │   └── img/                          # Recursos gráficos e imágenes
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/               # LoginForm, RegisterForm, ConfirmModal, Spinner
│   │   │   ├── pages/
│   │   │   │   └── AuthPage.jsx
│   │   │   └── store/
│   │   │       ├── authStore.js
│   │   │       └── uiStore.js
│   │   │
│   │   ├── availability/
│   │   │   ├── components/
│   │   │   │   └── state.medical.jsx
│   │   │   ├── pages/
│   │   │   │   └── AvailabilityPage.jsx
│   │   │   └── store/
│   │   │       └── availabilityStore.js
│   │   │
│   │   ├── inventory/
│   │   │   ├── components/
│   │   │   │   └── inventory.medical.jsx
│   │   │   ├── pages/
│   │   │   │   └── InventoryPage.jsx
│   │   │   └── store/
│   │   │       └── useMedicineStore.js
│   │   │
│   │   ├── medical/
│   │   │   ├── components/
│   │   │   │   └── register.medic.jsx
│   │   │   ├── pages/
│   │   │   │   └── MedicalRecordsPage.jsx
│   │   │   └── store/
│   │   │       └── medicalRecordStore.js
│   │   │
│   │   ├── notification/
│   │   │   ├── components/
│   │   │   │   └── notification.medical.jsx
│   │   │   └── store/
│   │   │       └── notificationStore.js
│   │   │
│   │   └── users/
│   │       ├── components/
│   │       │   ├── CreateUserModal.jsx
│   │       │   └── Users.jsx
│   │       └── store/
│   │           ├── adminStore.js
│   │           └── useUserManagementStore.js
│   │
│   ├── shared/
│   │   ├── api/
│   │   │   ├── admin.js
│   │   │   ├── api.js
│   │   │   ├── auth.js
│   │   │   └── index.js
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── DashboardContainer.jsx
│   │   │       ├── Navbar.jsx
│   │   │       └── Sidebar.jsx
│   │   │   └── ui/
│   │   │       └── AvatarUser.jsx
│   │   └── utils/
│   │       ├── axios.js
│   │       ├── formatter.js
│   │       └── toast.js
│   │
│   └── styles/
│       └── index.css
│
├── .env                                  # Variables de entorno
├── eslint.config.js                      # Configuración de ESLint
├── index.html                            # HTML base
├── package.json                          # Dependencias y scripts
└── vite.config.js                        # Configuración de Vite
```

---

```
availability-service/
├── src/
│   ├── AvaibleService.Api/               # Capa de presentación
│   │   ├── Controllers/                  # Controladores REST
│   │   │   └── AvailabilityController.cs
│   │   ├── Properties/                   # Configuraciones de launch
│   │   │   └── launchSettings.json
│   │   ├── appsettings.json
│   │   ├── appsettings.Development.json
│   │   └── Program.cs                    # Punto de entrada
│   │
│   ├── AvaibleService.Application/       # Capa de aplicación
│   │   ├── Dto/
│   │   │   └── AvailabilityRequest.cs
│   │   ├── Hubs/
│   │   │   └── AvailabilityHub.cs        # Hub de SignalR
│   │   └── Services/
│   │       └── AvailabilityManager.cs    # Implementación de servicios
│   │
│   ├── AvaibleService.Domain/            # Capa de dominio
│   │   ├── Entities/
│   │   │   └── TeacherAvailability.cs    # Entidades del dominio
│   │   └── Enums/
│   │       └── TeacherStatus.cs          # Enumeraciones de estado
│   │
│   └── AvaibleService.Persistence/       # Capa de persistencia
│       └── Repositories/
│           └── AvailabilityRepository.cs # Implementación de repositorios
│
├── AvaibleService.sln                    # Solución de Visual Studio
├── Dockerfile                            # Configuración de contenedor
└── global.json                           # Versión de .NET
```

---

```
inventory-service/
├── config/
│   ├── app.js                            # Configuración principal del servidor
│   ├── configuration.js                  # Configuración general
│   ├── db.js                             # Conexión a MongoDB
│   ├── documentation.js                  # Configuración de Swagger
│   ├── helmets.js                        # Configuración de Helmet
│   └── rateLimits.js                     # Límite de peticiones
│
├── middlewares/
│   ├── JWT.middleware.js                 # Validación de tokens
│   └── role.middleware.js                # Validación de roles (Admin/User)
│
├── src/
│   ├── controller/
│   │   └── medicine.controller.js        # Lógica de las rutas
│   │
│   ├── models/
│   │   └── medicine.model.js             # Esquemas de Mongoose
│   │
│   ├── routes/
│   │   └── medicine.routes.js            # Definición de Endpoints
│   │
│   └── service/
│       └── medicine.service.js           # Lógica de negocio
│
├── .env                                  # Variables de entorno
├── .gitignore                            # Archivos ignorados por Git
├── Dockerfile                            # Configuración de contenedor
├── index.js                              # Punto de entrada
└── package.json                          # Dependencias y scripts
```

---

```
medical-records-service/
├── config/
│   ├── db.js                             # Conexión a MongoDB
│   └── documentation.js                  # Configuración de Swagger
│
├── middlewares/
│   └── auth.js                           # Validación de acceso
│
├── src/
│   ├── controller/
│   │   └── record.controller.js          # Lógica de las rutas
│   │
│   ├── models/
│   │   └── record.model.js               # Esquemas de Mongoose
│   │
│   └── routes/
│       └── record.routes.js              # Definición de Endpoints
│
├── .env                                  # Variables de entorno
├── .gitignore                            # Archivos ignorados por Git
├── Dockerfile                            # Configuración de contenedor
├── index.js                              # Punto de entrada
└── package.json                          # Dependencias y scripts
```

---

```
notification-service/
├── config/
│   ├── db.js                             # Conexión a MongoDB
│   ├── documentation.js                  # Configuración de Swagger
│   └── nodemailer.js                     # Configuración de envío de correos
│
├── middlewares/
│   └── validate-request.js               # Validación de peticiones
│
├── src/
│   ├── controller/
│   │   └── notification.controller.js    # Lógica de las rutas
│   │
│   ├── routes/
│   │   └── notification.routes.js        # Definición de Endpoints
│   │
│   └── service/
│       └── email.service.js              # Lógica de envío de correos
│
├── .env                                  # Variables de entorno
├── .gitignore                            # Archivos ignorados por Git
├── Dockerfile                            # Configuración de contenedor
├── index.js                              # Punto de entrada
└── package.json                          # Dependencias y scripts
```

---

```
user-student-service/
├── config/
│   ├── db.js                             # Conexión a MongoDB
│   └── documentation.js                  # Configuración de Swagger
│
├── middlewares/
│   └── auth.js                           # Validación de autenticación
│
├── src/
│   ├── controller/
│   │   ├── auth.controller.js            # Lógica de autenticación
│   │   └── student.controller.js         # Lógica de gestión de alumnos
│   │
│   ├── models/
│   │   └── student.model.js              # Esquemas de Mongoose
│   │
│   ├── routes/
│   │   └── student.routes.js             # Definición de Endpoints
│   │
│   └── utils/
│       └── initialSetup.js               # Configuración inicial del sistema
│
├── .env                                  # Variables de entorno
├── .gitignore                            # Archivos ignorados por Git
├── Dockerfile                            # Configuración de contenedor
├── index.js                              # Punto de entrada
└── package.json                          # Dependencias y scripts
```

---

### Requisitos Previos
- .NET 8.0 SDK
- Node.js 22+
- pnpm 10+ (Package Manager)
- Cuenta de Gmail con App Password (para emails)
- 16 GB de RAM

---

### Variables de Entorno

#### inventory-service

Crear archivo `.env` en la raíz del servicio:

```env
PORT=3000
MONGO_URI=mongodb://mongo:27017/inventory_db

JWT_SECRET=KinalMedicSuperSecretaParaJWT2024!!Segura
JWT_EXPIRES_IN=1h
JWT_ISSUER=KinalMedic
JWT_AUDIENCE=KinalMedic

NODE_TLS_REJECT_UNAUTHORIZED=0
```

#### medical-records-service

Crear archivo `.env` en la raíz del servicio:

```env
PORT=3000
MONGO_URI=mongodb://mongo:27017/medical_db
TOKEN_SECRET=KinalMedicSuperSecretaParaJWT2024!!Segura
```

#### notification-service

Crear archivo `.env` en la raíz del servicio:

```env
PORT=3000
MONGO_URI=mongodb://mongo:27017/notifications_db
TOKEN_SECRET=KinalMedicSuperSecretaParaJWT2024!!Segura
EMAIL_USER=tu-correo@gmail.com
EMAIL_PASS=tu-clave-de-aplicacion-de-16-digitos
```

#### user-student-service

Crear archivo `.env` en la raíz del servicio:

```env
PORT=3000
MONGO_URI=mongodb://mongo:27017/students_db
TOKEN_SECRET=KinalMedicSuperSecretaParaJWT2024!!Segura
```

---

### Instalación y Ejecución

1. **Clonar el repositorio**
```bash
git clone https://github.com/Programing-Team70/Kinal_Medic.git
```

2. **Correr Docker**
```bash
# Dentro de la carpeta Kinal_Medic, ejecuta el siguiente comando
# para levantar todos los servicios del ecosistema:
docker-compose up -d
```

3. **Levantar un contenedor específico**
```bash
# Si necesitas levantar únicamente un servicio dentro del ecosistema Docker:
docker-compose up -d --build nombre_del_servicio
```

4. **Instalación de dependencias (desarrollo local)**
```bash
# Dependiendo del servicio, asegúrate de instalar las librerías necesarias:
pnpm install
```

5. **Ejecutar el servicio (desarrollo local)**
```bash
# Para servicios Node.js:
node index.js

# Para servicios en modo desarrollo:
pnpm run dev
```

---

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulte el archivo [LICENSE](LICENSE) para más detalles.

## Autor

**Programming Team**  
Curso IN6AV - Kinal Guatemala 2026

## Próximas Actualizaciones
> Este archivo README.md se actualizará periódicamente a medida que el Programming Team avance en los hitos del proyecto. Las nuevas funcionalidades se documentarán conforme se integren a la rama principal.
