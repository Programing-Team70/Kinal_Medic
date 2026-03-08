import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Correctamente conectado a MongoDB");
    } catch (err) {
        console.error("Error de conexión por esto:", err);
        process.exit(1);
    }
};

export default connectDB;