'use strict';

import mongoose from 'mongoose';

export const dbConnection = async () => {
    try {
        mongoose.connection.on('error', () => {
        console.log('MongoDB | no se pudo conectar a mongoDB');
        mongoose.disconnect();
        });
        mongoose.connection.on('connecting', () => {
            console.log('MongoDB | intentando conectar a mongoDB');
        });
        mongoose.connection.on('connected', () => {
            console.log('MongoDB | conectado a mongoDB');
        });
        mongoose.connection.on('open', () => {
            console.log('MongoDB | conectado a la base de datos Heaven Flavor');
        });
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB | reconectado a mongoDB');
        });
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB | desconectado de mongoDB');
        });
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10,
        });
    } catch (error) {
    console.error(`Error al conectar la db: ${error}`);
    process.exit(1);
    }};

const gracefulShutdown = async (signal) => {
    console.log(`MongoDB | Recibiendo ${signal}. Cerrando la conexion a la base de datos...`);
    try {
        await mongoose.connection.close();
        console.log('MongoDB | Se ha cerrado correctamente la coneccion a la base de datos.');
        process.exit(0);
    } catch (error) {
        console.error('MongoDB | Error: No se ha podido cerrar la coneccion a la base de datos: ', error.message);
        process.exit(1);
    }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));