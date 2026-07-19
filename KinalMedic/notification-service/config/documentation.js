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
            title: "notification-service API",
            version: "2.0.0",
            description:
                "Alertas médicas por correo: solicitud leve/moderada y emergencia total (médicos + encargado).",
            contact: {
                name: "Academic Programming Team",
                email: "programingteam70@gmail.com",
            },
        },
        servers: [
            {
                url: "http://localhost:3005",
                description: "Servidor de Notificaciones",
            },
        ],
        components: {
            schemas: {
                NotificationInput: {
                    type: "object",
                    required: ["studentName", "studentCarnet", "description"],
                    properties: {
                        doctorEmails: {
                            type: "array",
                            items: { type: "string", format: "email" },
                            example: ["admin@kinal.edu.gt"],
                            description: "Correos de médicos seleccionados",
                        },
                        doctorEmail: {
                            type: "string",
                            format: "email",
                            description: "Compatibilidad: un solo médico",
                        },
                        customEmail: {
                            type: "string",
                            format: "email",
                            example: "otro.medico@kinal.edu.gt",
                            description: "Correo adicional opcional",
                        },
                        studentName: { type: "string", example: "Juan Pérez" },
                        studentCarnet: { type: "string", example: "2024001" },
                        studentEmail: { type: "string", example: "juan@kinal.edu.gt" },
                        guardianEmail: { type: "string", example: "padre@gmail.com" },
                        educationLevel: { type: "string", example: "DIVERSIFICADO" },
                        carrera: { type: "string", example: "Informática" },
                        seccion: { type: "string", example: "A" },
                        hasAllergies: { type: "boolean", example: true },
                        allergies: { type: "string", example: "Penicilina" },
                        description: {
                            type: "string",
                            example: "Dolor de cabeza y mareos desde la mañana",
                        },
                        urgency: {
                            type: "string",
                            enum: ["LEVE", "MODERADA"],
                            example: "MODERADA",
                        },
                    },
                },
                EmergencyInput: {
                    type: "object",
                    required: ["studentName", "studentCarnet"],
                    properties: {
                        doctorEmails: {
                            type: "array",
                            items: { type: "string" },
                            description: "Correos de todo el personal médico",
                        },
                        customEmail: { type: "string", format: "email" },
                        guardianEmail: {
                            type: "string",
                            format: "email",
                            description: "Correo del encargado (se notifica siempre)",
                        },
                        studentName: { type: "string" },
                        studentCarnet: { type: "string" },
                        studentEmail: { type: "string" },
                        hasAllergies: { type: "boolean" },
                        allergies: { type: "string" },
                        seccion: { type: "string" },
                        note: {
                            type: "string",
                            description: "Nota opcional del alumno",
                        },
                    },
                },
                NotificationResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        message: { type: "string" },
                        recipients: {
                            type: "array",
                            items: { type: "string" },
                        },
                    },
                },
            },
        },
        tags: [
            { name: "Notifications", description: "Envío de alertas médicas" },
        ],
    },
    apis: [path.join(__dirname, "../src/routes/*.js")],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
export { swaggerDocs, swaggerUi };
