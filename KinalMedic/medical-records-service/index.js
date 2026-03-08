import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import recordRoutes from './src/routes/record.routes.js';
import connectDB from './config/db.js';

const app = express();

connectDB();

app.use(express.json());
app.use(cors());

app.use('/api/records', recordRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Servicio Médico escuchando en el puerto ${PORT}`);
});