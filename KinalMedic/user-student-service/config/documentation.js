import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "user-student-service API",
            version: "1.0.0",
            description: "Documentación sobre la gestión de inicio de sesión y perfiles de los estudiantes como el del ADMIN.",
            contact: {
                name: "Academic Programming Team",
                email: "programingteam70@gmail.com",
            },
        },
        servers: [
            {
                url: "http://localhost:3001",
                description: "Servidor Local",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Pega tu token aquí obtenido en el login de el Admin predeterminado"
                },
            },
            schemas: {
                LoginInput: {
                    type: "object",
                    properties: {
                        email: { type: "string", example: "admin@kinal.edu.gt" },
                        password: { type: "string", example: "adminKinal123" },
                    },
                },
                StudentRegister: {
                    type: "object",
                    required: [
                        "name",
                        "email",
                        "password",
                        "carnet",
                        "educationLevel",
                        "seccion",
                        "hasAllergies",
                        "guardianEmail",
                    ],
                    properties: {
                        name: { type: "string", example: "Juan Pérez" },
                        email: { type: "string", example: "juan@kinal.edu.gt" },
                        password: { type: "string", example: "password123" },
                        carnet: { type: "string", example: "2024001" },
                        educationLevel: {
                            type: "string",
                            enum: ["BASICO", "DIVERSIFICADO"],
                            example: "DIVERSIFICADO",
                            description: "Nivel educativo. Si es BASICO no se envía carrera.",
                        },
                        carrera: {
                            type: "string",
                            example: "Informática",
                            description: "Obligatoria solo si educationLevel es DIVERSIFICADO",
                        },
                        seccion: { type: "string", example: "A" },
                        hasAllergies: {
                            type: "boolean",
                            example: true,
                            description: "Indica si el estudiante es alérgico",
                        },
                        allergies: {
                            type: "string",
                            example: "Penicilina, mariscos",
                            description: "Obligatorio si hasAllergies es true",
                        },
                        guardianEmail: {
                            type: "string",
                            example: "encargado@gmail.com",
                            description: "Correo del encargado / tutor",
                        },
                        role: {
                            type: "string",
                            enum: ["STUDENT_ROLE", "ADMIN_ROLE"],
                            example: "STUDENT_ROLE",
                            description:
                              "POST /create: ADMIN_PRINCIPAL puede crear STUDENT_ROLE y ADMIN_ROLE (médico). El médico solo crea STUDENT_ROLE. ADMIN_PRINCIPAL no se crea por API (seed único).",
                        },
                        phone: {
                            type: "string",
                            example: "55551234",
                            description: "Obligatorio si role es ADMIN_ROLE (médico)",
                        },
                    },
                },
                StudentUpdate: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        educationLevel: {
                            type: "string",
                            enum: ["BASICO", "DIVERSIFICADO"],
                        },
                        carrera: { type: "string" },
                        seccion: { type: "string" },
                        hasAllergies: { type: "boolean" },
                        allergies: { type: "string" },
                        guardianEmail: { type: "string" },
                        emergencyContact: { type: "string" },
                        phone: { type: "string" },
                    },
                },
            },
        },
        tags: [
            { name: "Auth", description: "Operaciones de inicio de sesión" },
            { name: "Students", description: "Gestión de perfiles de estudiantes" },
            { name: "Admin", description: "Operaciones exclusivas para el administrador" },
        ],
    },
    
    apis: [path.join(__dirname, "../src/routes/*.js")],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
export { swaggerDocs, swaggerUi };