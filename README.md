# Kinal_Medic - Sistema de Gestión de Enfermería
>**Nota**: Este proyecto ha sido desarrollado por el equipo de desarrollo Programming Team utilizando como base técnica y educativa la arquitectura de microservicios y las mejores prácticas de desarrollo web proporcionada por el Catedrático Braulio Echeverría (PEM) del curso IN6AV, Kinal Guatemala 2026.

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
* **Disparador de Alertas:**  Sistema de notificaciones automáticas vía correo electrónico a padres de familia o encargados tras una atención de emergencia.
* **Registro de Suministros:** Trazabilidad completa de qué insumo fue utilizado, por quién y en qué fecha.

## Tecnologías utilizadas
- Componente Tecnología 
- Tiempo de ejecución Node.js y .Net
- Lenguaje JavaScript / C#
- Bases de Datos MongoDB / SQL Server
- Documentación	Postman

## Endpoints API (user-student-service)
Base URL: `http://localhost:3001/api/students`


### Medicamentos (`/medicine`)

| Método | Ruta | Descripción |Acceso|
|--------|------|-------------|------|
| `POST` | `/login` | Iniciar sesión en el sistema | Global |
| `POST` | `/register` | Registro inicial de alumno | Global |
| `POST` | `/create` | Registro administrativo de alumnos | Admin |
| `GET`| `/me`| Obtener mi perfil de usuario actual | User |
| `GET`| `/all`| Listar todos los alumnos registrados | Admin |
| `GET`| `/carnet/{carnet}`| Buscar alumno específico por carnet | Admin |


## Endpoints API (medical-records-service)
Base URL: `http://localhost:3002/api/records`

### Disponibilidad del Personal (`/availability`)
| Método | Ruta | Descripción |Acceso|
|--------|------|-------------|------|
| `POST` | `/add` | Crear nuevo historial clínico | Admin |
| `GET` | `/{carnet}` | Consultar historial clínico por carnet | Admin |


## Endpoints API (inventory-service)
Base URL: `http://localhost:3003/inv`

### Inventory Service (`/inventory`)
| Método | Ruta | Descripción |Acceso|
|--------|------|-------------|------|
| `GET` | `/medicine` | Visualizar todo el inventario | User |
| `GET` | `/medicine/{id}` | Obtener detalles por ID específico| User |
| `POST` | `/medicine` | Registrar un nuevo medicamento | Admin |
| `PUT` | `/medicine/{id}` | Actualizar información de medicamento | Admin |

## Endpoints API (availability-service)
Base URL: `http://localhost:3004/api/availability`

### Availability Service (`/availability`)
| Método | Ruta | Descripción |Acceso|
|--------|------|-------------|------|
| `GET` | `/all-teachers` | Ver el estado de todo el person | Global |
| `POST` | `/scan-qr` | Actualizar ubicación | Admin |

## Endpoints API (Notification Service)
Base URL: `http://localhost:3005/api/notifications`

### Notification Service (`/notifications`)
| Método | Ruta | Descripción |Acceso|
|--------|------|-------------|------|
| `POST` | `/request-help` | Envía una alerta de emergencia al médico | User |

### Modelos de Request

---

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

--- 

## Inventory-Service
Base URL: `http://localhost:3003/inv`

#### Crear Medicamento (`edicine`)
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


## Availability-Service
Base URL: `http://localhost:3005/api/notifications`

#### Notification Service (`/notifications`)
```json
{
    "doctorEmail": "dlucas-2024332@kinal.edu.gt",
    "studentName": "Dany Lucas",
    "studentCarnet": "2024332",
    "description": "He experimentado un mareo fuerte mientras estaba en el taller de informática."
}
```
---

## 📁 Estructura del Proyecto
```
availability-service/
├── src/
│   ├── AuthService.Api/              # Capa de presentación
│   │   ├── bin/             
│   │   ├── Controllers/              # Controladores REST
│   │   ├── obj/                      
│   │   ├── Properties/               # Configuraciones y extensiones
│   │   └── Program.cs                # Punto de entrada
│   │
│   ├── AuthService.Application/      
│   │   ├── bin/                      
│   │   ├── DTOs/                     
|   |   ├── Hubs/               
│   │   ├── obj/              
│   │   └── Services/                 # Implementación de servicios
│   │
│   ├── AuthService.Domain/           # Capa de dominio
│   │   ├── bin/   
│   │   ├── Constants/                # Constantes del dominio
│   │   ├── Entities/                 # Entidades del dominio
│   │   ├── Enums/                    # Enumeraciones
│   │   ├── Interfaces/               # Interfaces de repositorios
│   │   └── obj/                 
│   │
│   └── AuthService.Persistence/      # Capa de persistencia
│       ├── bin/   
│       ├── Data/                     # DbContext y configuraciones
│       ├── Migrations/               # Migraciones de EF Core
│       ├── obj/   
│       └── Repositories/             # Implementación de repositorios
│
├── AuthService.sln                   # Solución de Visual Studio
├── Dockerfile                        # Configuración de contenedor
└── global.json                       # Versión de .NET
```
---


```
inventory-service/
├── configs/
│   ├── app.js                          # Configuración principal del servidor
|   ├── configuration.js                # Configuración general
│   ├── db.js                           # Conexión a MongoDB
|   ├── helmets.js                      # Configuración de Helmet
|   └── rateLimit.js                    # Limitar las peticiones
│
├── middlewares/
│   ├── JWT.middleware.js               # Validación de tokens
|   └── role.middleware.js              # Validación de roles (Admin/User)
│
├── src/
│   ├── Controller/                     # Lógica de las rutas 
│   │   └── medicine.controller/        
│   │
│   ├── models/                         # Esquemas de Mongoose
│   │   └── medicine.model/             
│   │
│   ├── routes/                         # Definición de Endpoints
│   │   └── medicine.routes/           
│   │
│   └── service/                        
│       └── medicine.service/           # Lógica de negocio
│
├── .env                                # Variables de entorno
├── .gitignore                          # Archivos ignorados por Git
├── Dockerfile                          # Configuración de contenedor
├── index.js                            # Punto de entrada
├── package.json                        # Dependencias y scripts
└── pnpm-lock.yaml                      # Lock file de pnpm
```
---

```
medical-records-service/
├── configs/
│    └── db.js                          # Conexión a MongoDB
│
├── middlewares/
|   └── auth.js                         # Validación de acceso
│
├── node_modules/
│
├── src/
│   ├── Controller/                     
│   │   └── record.controller/          # Lógica de las rutas
│   │
│   ├── models/                         
│   │   └── record.model/               # Esquemas de Mongoose
│   │
│   └── routes/                         
│       └── record.model/               # Definición de Endpoints
├── .env                                # Variables de entorno
├── .gitignore                          # Archivos ignorados por Git
├── Dockerfile                          # Configuración de contenedor
├── index.js                            # Punto de entrada
├── package-lock.json                   # Dependencias y scripts
└── package.json                        # Dependencias y scripts
```
---

```
notification-service/
├── configs/
│    ├── db.js                          # Conexión a MongoDB
│    └── nodemailer.js                  # Configuración de envío de correos        
│
├── middlewares/
|   └── validate-request.js             
│
├── src/
│   ├── Controller/                     
│   │   └── notification.controller/        
│   │
│   ├── routes/                         
│   │   └── notification.routes/             
│   │
│   └── models/                         
│       └── email.service/              # Lógica de envío de correos
├── .env                                # Variables de entorno
├── .gitignore                          # Archivos ignorados por Git
├── Dockerfile                          # Archivos ignorados por Git
├── index.js                            # Punto de entrada
└── package.json                        # Dependencias y scripts
```
---

```
user-student-service/
├── configs/
│   └──  db.js                          # Conexión a MongoDB                        
│
├── middlewares/
|   └── auth.js                         # Validación de autenticación
│
├── node_modules/
│
├── src/
│   ├── Controller/
│   │   ├── auth.controller/                    
│   │   └── student.controller/        
│   │
│   ├── models/                         
│   │   └── student.model/             
│   │
│   ├── routes/                         
│   │   └── student.routes/
│   │
│   └── utils/                         
│       └── initialSetup/               # Configuración inicial del sistema
├── .env                                # Variables de entorno
├── .gitignore                          # Archivos ignorados por Git
├── Dockerfile                          # Configuración de contenedor
├── index.js                            # Punto de entrada
├── package-lock.js                     # Dependencias y scripts
└── package.json                        # Dependencias y scripts
```
---

### Requisitos Previos
- .NET 8.0 SDKs
- PostgreSQL 13+
- Cuenta de Gmail con App Password (para emails)
- Node.js 22+
- pnpm 10+ (Package Manager)
- 16 GB de ram

---

### Variables de Entorno 

Crear archivo `.env` en la raíz del proyecto:

```env
PORT=3000
MONGO_URI=mongodb://mongo:27017/notifications_db
TOKEN_SECRET=KinalMedicSuperSecretaParaJWT2024!!Segura
EMAIL_USER=programingteam70@gmail.com
EMAIL_PASS=fstc wpzh frpp fooi
```
---


### Instalación y Ejecución

1. **Clonar el repositorio**
```bash
git clone <url-repositorio>
```

2. **Correr Docker**
```bash
Ve a la carpeta de postgre_db, y abre una terminal
Ejecuta: docker-compose up -d
```

3. **Poner en marcha un contenedor específico**
```bash
Si necesitas levantar únicamente un servicio dentro del ecosistema Docker:
Ejecutar: docker-compose up -d --build nombre_del_servicio
```
4. **Instalación de dependencias**
```bash
Dependiendo del servicio, asegúrate de instalar las librerías necesarias
Ejecuta: pnpm install
```
5. **Ejecutar el servicio**
```bash
Para correr el servicio de forma manual, utiliza el comando según su dependencia:s
Para servicios Node.js: node index.js
Para servicios en desarrollo: pnpm run dev
```
## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulte el archivo [LICENSE](LICENSE) para más detalles.

## Autor

**Programming Team**  
Curso IN6AV - Kinal Guatemala 2026

## Próximas Actualizaciones
> Este archivo README.md se actualizará periódicamente a medida que el Programming Team avance en los hitos del proyecto. Las nuevas funcionalidades se documentarán conforme se integren a la rama principal.
