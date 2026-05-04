import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "inventory-service API",
            version: "1.0.0",
            description: "Servicio para la gestión de inventario de medicamentos.",
            contact: {
                name: "Contact Programming Team",
                email: "programingteam70@gmail.com",
            },
        },
        servers: [
            {
                url: "http://localhost:3003",
                description: "Servidor de Inventario",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                Medicine: {
                    type: "object",
                    required: ["name", "genericName", "description", "category", "dosageForm", "stock", "expirationDate"],
                    properties: {
                        name: { type: "string", example: "Paracetamol" },
                        genericName: { type: "string", example: "Acetaminofén" },
                        description: { type: "string", example: "Analgésico y antipirético." },
                        category: { 
                            type: "string", 
                            enum: ["analgesico", "antibiotico", "anti inflammatorio", "antipirético", "otro"],
                            example: "analgesico" 
                        },
                        dosageForm: { 
                            type: "string", 
                            enum: ["tableta", "capsula", "jarabe", "inyección", "crema", "gotas"],
                            example: "tableta" 
                        },
                        stock: { type: "integer", minimum: 0, example: 100 },
                        expirationDate: { type: "string", format: "date", example: "2026-12-31" },
                        isActive: { type: "boolean", default: true }
                    },
                },
            },
        },
    },
    apis: [path.join(__dirname, "../src/routes/*.js")],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
export { swaggerDocs, swaggerUi };