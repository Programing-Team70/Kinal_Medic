import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import recordRoutes from './src/routes/record.routes.js';
import connectDB from './config/db.js';
import { swaggerDocs, swaggerUi } from './config/documentation.js';

const app = express();

connectDB();

app.use(express.json());
app.use(cors());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/records', recordRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Servicio Médico escuchando en el puerto ${PORT}`);
    console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});