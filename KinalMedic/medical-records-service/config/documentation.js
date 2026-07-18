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
            title: "medical-records-service API",
            version: "1.0.0",
            description: "Servicio para la gestión de historiales médicos y signos vitales de los estudiantes.",
            contact: {
                name: "Academic Programming Team",
                email: "programingteam70@gmail.com",
            },
        },
        servers: [
            {
                url: "http://localhost:3002",
                description: "Servidor de Registros Médicos",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Ingresa el token de verificación del Admin"
                },
            },
            schemas: {
                Vitals: {
                    type: "object",
                    properties: {
                        temperature: { type: "string", example: "37°C" },
                        bloodPressure: { type: "string", example: "120/80" },
                        weight: { type: "string", example: "70kg" },
                        height: { type: "string", example: "1.70m" },
                    },
                },
                StudentSnapshot: {
                    type: "object",
                    properties: {
                        name: { type: "string", example: "Juan Pérez" },
                        email: { type: "string", example: "juan@kinal.edu.gt" },
                        educationLevel: { type: "string", example: "DIVERSIFICADO" },
                        carrera: { type: "string", example: "Informática" },
                        seccion: { type: "string", example: "A" },
                        hasAllergies: { type: "boolean", example: true },
                        allergies: { type: "string", example: "Penicilina" },
                        guardianEmail: { type: "string", example: "padre@gmail.com" },
                    },
                },
                MedicalRecordInput: {
                    type: "object",
                    required: ["carnet", "description"],
                    properties: {
                        carnet: { type: "string", example: "2024332" },
                        description: {
                            type: "string",
                            example: "Motivo de llegada: dolor de cabeza y fiebre.",
                        },
                        medication: {
                            type: "string",
                            example: "Paracetamol",
                            description: "Nombre legible del medicamento (inventario)",
                        },
                        medicationId: {
                            type: "string",
                            example: "65f1a...",
                            description: "ID del medicamento en inventory-service",
                        },
                        medicationName: { type: "string", example: "Paracetamol" },
                        student: { $ref: '#/components/schemas/StudentSnapshot' },
                        vitals: { $ref: '#/components/schemas/Vitals' },
                    },
                },
                MedicalRecordResponse: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "65f1a..." },
                        carnet: { type: "string" },
                        student: { $ref: '#/components/schemas/StudentSnapshot' },
                        description: { type: "string" },
                        medication: { type: "string" },
                        medicationId: { type: "string" },
                        medicationName: { type: "string" },
                        vitals: { $ref: '#/components/schemas/Vitals' },
                        date: { type: "string", format: "date-time" },
                    },
                },
            },
        },
    },
    apis: [path.join(__dirname, "../src/routes/*.js")],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
export { swaggerDocs, swaggerUi };