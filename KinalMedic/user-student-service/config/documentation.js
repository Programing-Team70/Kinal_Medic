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
                    required: ["name", "password", "carnet", "carrera"],
                    properties: {
                        name: { type: "string", example: "Juan Pérez" },
                        email: { type: "string", example: "juan@kinal.edu.gt" },
                        password: { type: "string", example: "password123" },
                        carnet: { type: "string", example: "2024001" },
                        carrera: { type: "string", example: "Informática" },
                    },
                },
                StudentUpdate: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        carrera: { type: "string" },
                        emergencyContact: { type: "string" },
                        allergies: { type: "string" },
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