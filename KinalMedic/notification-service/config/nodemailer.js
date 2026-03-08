import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify().then(() => {
    console.log('Servidor de correos listo para enviar');
}).catch((error) => {
    console.error('Error en configuración de correo:', error);
});

export default transporter;