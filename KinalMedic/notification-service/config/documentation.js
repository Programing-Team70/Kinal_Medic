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
            version: "1.0.0",
            description: "Servicio encargado del envío de alertas médicas por correo electrónico a través de Nodemailer.",
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
                    required: ["doctorEmail", "studentName", "studentCarnet", "description"],
                    properties: {
                        doctorEmail: { 
                            type: "string", 
                            format: "email", 
                            example: "dlucas-2024332@kinal.edu.gt",
                            description: "Correo electrónico del médico que recibirá la alerta"
                        },
                        studentName: { 
                            type: "string", 
                            example: "Dany Lucas",
                            description: "Nombre completo del estudiante que solicita ayuda"
                        },
                        studentCarnet: { 
                            type: "string", 
                            example: "2024001",
                            description: "Número de carnet del estudiante"
                        },
                        description: { 
                            type: "string", 
                            example: "Fuerte dolor abdominal y náuseas",
                            description: "Descripción breve de la urgencia médica"
                        },
                    },
                },
                NotificationResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        message: { type: "string", example: "Alerta médica enviada al doctor correctamente!" }
                    }
                }
            },
        },
        tags: [
            { name: "Notifications", description: "Envío de alertas de emergencia" },
        ],
    },
    apis: [path.join(__dirname, "../src/routes/*.js")],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
export { swaggerDocs, swaggerUi };