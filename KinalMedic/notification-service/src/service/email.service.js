import transporter from '../../config/nodemailer.js';

export const sendMedicalAlert = async (doctorEmail, studentName, studentCarnet, description) => {
    const mailOptions = {
        from: `"KINAL MEDIC" <${process.env.EMAIL_USER}>`,
        to: doctorEmail, 
        subject: `URGENTE: Solicitud de asistencia - Alumno ${studentName}`,
        html: `
            <div style="font-family: sans-serif; border: 2px solid #e74c3c; padding: 20px; border-radius: 10px;">
                <h2 style="color: #e74c3c; text-align: center;">SOLICITUD DE AYUDA MÉDICA</h2>
                <p>Solicita su atención médica inmediata en la consultoría.</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 5px solid #e74c3c;">
                    <p><strong>Estudiante:</strong> ${studentName}</p>
                    <p><strong>Carnet:</strong> ${studentCarnet}</p>
                    <p><strong>Descripción de la urgencia:</strong></p>
                    <p style="font-style: italic; color: #333;">"${description}"</p>
                </div>
                <p style="margin-top: 20px; font-size: 0.9em; color: #555;">
                    Por favor tomar en cuenta esta solicitud atendiendo la solicitud lo más pronto posible.
                </p>
                <footer style="margin-top: 20px; font-size: 0.8em; color: #7f8c8d; border-top: 1px solid #eee; pt: 10px;">
                    © 2026 Kinal Medic - Sistema de Alerta Instantánea
                </footer>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
};