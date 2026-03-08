import mongoose from 'mongoose';
import { createAdmin } from '../src/utils/initialSetup.js';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Correctamente conectado a MongoDB");
        await createAdmin();
    } catch (err) {
        console.error("Error de conexión por esto:", err);
        process.exit(1);
    }
};

export default connectDB;