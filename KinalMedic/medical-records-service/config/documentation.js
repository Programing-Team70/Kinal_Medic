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
                    },
                },
                MedicalRecordInput: {
                    type: "object",
                    required: ["carnet", "description"],
                    properties: {
                        carnet: { type: "string", example: "2024332" },
                        description: { type: "string", example: "Paciente presenta cuadro de gripe común." },
                        medication: { type: "string", example: "Paracetamol 500mg cada 8 horas." },
                        vitals: { $ref: '#/components/schemas/Vitals' },
                    },
                },
                MedicalRecordResponse: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "65f1a..." },
                        carnet: { type: "string" },
                        description: { type: "string" },
                        medication: { type: "string" },
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