import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import notificationRoutes from './src/routes/notification.routes.js';
import { swaggerDocs, swaggerUi } from './config/documentation.js';
import { connectDB } from './config/db.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 3000;

await connectDB();

app.listen(PORT, () => {
    console.log(`Notification Service (ESM) running on port ${PORT}`);
    console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});
