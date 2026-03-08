import Student from '../models/student.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    try {
        const { carnet, email, password } = req.body;
        let user;

        if (carnet) {
            user = await Student.findOne({ carnet }); 
        } else if (email) {
            user = await Student.findOne({ email }); 
        } else {
            return res.status(400).json({ message: "Se requiere carnet o el correo." });
        }

        if (!user) return res.status(404).json({ message: "Usuario no encontrado, verifique datos." });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ message: "Credenciales incorrectas!" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.TOKEN_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ message: "Sesión iniciada correctamente.", token, role: user.role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
