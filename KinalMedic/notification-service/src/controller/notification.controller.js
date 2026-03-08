import * as emailService from '../service/email.service.js';

export const requestMedicalHelp = async (req, res) => {
    try {
        const { doctorEmail, studentName, studentCarnet, description } = req.body;
        
        await emailService.sendMedicalAlert(doctorEmail, studentName, studentCarnet, description);
        
        res.status(200).json({ 
            success: true, 
            message: 'Alerta médica enviada al doctor correctamente!' 
        });
    } catch (error) {
        console.error('Error al enviar alerta:', error);
        res.status(500).json({ 
            success: false, 
            message: 'No se pudo enviar la alerta médica' 
        });
    }
};