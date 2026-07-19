import mongoose from 'mongoose';
import dns from "dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

export const connectDB = async () => {
    const uri =
        process.env.MONGO_URI || 'mongodb://localhost:27017/notifications_db';
    try {
        await mongoose.connect(uri);
        console.log('[notification-service] MongoDB conectado:', uri);
    } catch (err) {
        console.error('[notification-service] Error MongoDB:', err.message);
        process.exit(1);
    }
};
