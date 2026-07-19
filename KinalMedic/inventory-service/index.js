import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { dbConnection } from "./config/db.js";
import medicineRoutes from "./src/routes/medicine.routes.js";
import { swaggerDocs, swaggerUi } from './config/documentation.js';



const app = express();
dbConnection();

app.use(cors({ origin: "*" }));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/inv/medicine", medicineRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Inventory Service funcionando correctamente." });
});

app.use((req, res, next) => {
    res.status(404).json({
    message: `Ruta ${req.originalUrl} no encontrada.`,
    });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).json({
    message: err.message || "Error interno del servidor.",
    });
});

process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION", err);
    process.exit(1);
});

process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION", err);
    process.exit(1);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto: ${PORT}`);
    console.log(`Swagger disponible en: http://localhost:${PORT}/api-docs/`);
});