import Student from '../models/student.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    try {
        const { carnet, email, password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'La contraseña es obligatoria.' });
        }

        let user;

        if (email) {
            user = await Student.findOne({
                email: String(email).trim().toLowerCase(),
            });
        } else if (carnet) {
            user = await Student.findOne({
                carnet: String(carnet).trim(),
            });
        } else {
            return res
                .status(400)
                .json({ message: 'Se requiere carnet o correo.' });
        }

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const validPassword = await bcrypt.compare(
            String(password),
            user.password
        );
        if (!validPassword) {
            return res
                .status(401)
                .json({ message: 'Credenciales incorrectas.' });
        }

        const secret = process.env.TOKEN_SECRET;
        if (!secret) {
            console.error('[auth] TOKEN_SECRET no definido');
            return res.status(500).json({
                message: 'Error de configuración del servidor (TOKEN_SECRET).',
            });
        }

        const token = jwt.sign(
            {
                id: userId,
                role: user.role,
                name: user.name,
                email: user.email || undefined,
            },
            secret,
            {
                expiresIn: '8h',
                header: {
                    alg: 'HS256',
                    typ: 'JWT',
                    kid: 'KinalMedic-SigningKey-2026'   // ← Esto es lo que faltaba
                }
            }
        );

        res.json({
            message: 'Sesión iniciada correctamente.',
            token,
            role: user.role,
            userDetails: {
                id: userId,
                name: user.name,
                email: user.email,
                role: user.role,
                carnet: user.carnet,
                educationLevel: user.educationLevel,
                carrera: user.carrera,
                seccion: user.seccion,
                hasAllergies: user.hasAllergies,
                allergies: user.allergies,
                guardianEmail: user.guardianEmail,
                phone: user.phone,
            },
        });
    } catch (err) {
        console.error('[auth/login]', err);
        res.status(500).json({
            message: 'Error en el servidor',
            error: err.message,
        });
    }
};
