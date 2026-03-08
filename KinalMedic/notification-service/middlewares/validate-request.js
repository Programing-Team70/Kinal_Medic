export const validateNotification = (req, res, next) => {
    const { doctorEmail, studentName, studentCarnet, description } = req.body;
    
    if (!doctorEmail || !studentName || !studentCarnet || !description) {
        return res.status(400).json({ 
            message: 'doctorEmail, studentName, studentCarnet and description are required' 
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(doctorEmail)) {
        return res.status(400).json({ message: 'El formato del correo es invalido' });
    }

    next();
};