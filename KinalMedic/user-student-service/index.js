import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './config/db.js';
import studentRoutes from './src/routes/student.routes.js';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/students', studentRoutes); 

const startServer = async () => {
    try {
        await connectDB();
        
        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            console.log(`Servicio de Estudiantes corriendo en puerto ${PORT}`);
        });
    } catch (error) {
        console.error("No se pudo iniciar el servidor porque la BD falló:", error);
        process.exit(1); 
    }
};

startServer();