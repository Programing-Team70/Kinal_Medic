import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import studentRoutes from './src/routes/student.routes.js';
import { swaggerDocs, swaggerUi } from './config/documentation.js';

const app = express();

app.use(express.json());
app.use(cors());

const swaggerOptionsUI = {
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
        persistAuthorization: true,
    },
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerOptionsUI));

app.use('/api/students', studentRoutes); 

const startServer = async () => {
    try {
        await connectDB();
        
        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            console.log(`Servicio de Estudiantes corriendo en puerto ${PORT}`);
            console.log(`Swagger: http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error("No se pudo iniciar el servidor porque la BD falló:", error);
        process.exit(1); 
    }
};

startServer();