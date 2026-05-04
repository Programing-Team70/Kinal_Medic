'use strict'

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { dbConnection } from './db.js';
import { corsOptions } from './configuration.js';
import { helmetOptions } from './helmets.js';
import { requestLimit } from './rateLimit.js';
import medicineRoutes from '../src/routes/medicine.routes.js';
import { swaggerDocs, swaggerUi } from './documentation.js';

const BASE_PATH = '/KinalMedic/inventory';

const middlewares = (app) => {
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    app.use(express.json({ limit: '10mb' }));
    app.use(cors(corsOptions));
    app.use(morgan('dev'));
    app.use(helmet(helmetOptions));
    app.use(requestLimit);
};

const routes = (app) => {
    app.use(`${BASE_PATH}/medicines`, medicineRoutes);
    app.get(`${BASE_PATH}/health`, (req, res) => {
        res.status(200).json({
            status: 'healthy',
            service: 'Kinal Medic: Inventory Service.'
        })
    })

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Ruta no existente.'
        })
    })

    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: `Ruta ${req.originalUrl} no encontrada en este servidor.`
        })
    })
}

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT || 3003;
    app.set('trust proxy', 1);
    try {
        middlewares(app);
        await dbConnection();
        routes(app);
        app.listen(PORT, () => {
            console.log(`Kinal Medic - Inventory Service se esta ejecutando en el puerto: ${PORT}`);
            console.log(`Health http://localhost:${PORT}${BASE_PATH}/health`);
            console.log(`Swagger: http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error(`Error al iniciar el servidor: ${error.mensaje}`);
        process.exit(1);
    }
}