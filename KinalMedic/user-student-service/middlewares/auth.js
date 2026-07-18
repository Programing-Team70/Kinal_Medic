import jwt from 'jsonwebtoken';
import { isStaff, isPrincipal, ROLES } from '../src/utils/roles.js';

export const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Acceso denegado. Formato de token inválido (se espera Bearer Token).',
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'El token ha expirado. Por favor, inicia sesión de nuevo.',
            });
        }

        res.status(403).json({ message: 'Token no válido o malformado.' });
    }
};

export const isAdmin = (req, res, next) => {
    if (!req.user || !isStaff(req.user.role)) {
        return res.status(403).json({
            message:
                'Acceso restringido: se requieren permisos de personal médico o administrador principal.',
            debugRole: req.user?.role,
        });
    }
    next();
};

export const isPrincipalAdmin = (req, res, next) => {
    if (!req.user || !isPrincipal(req.user.role)) {
        return res.status(403).json({
            message: 'Acceso restringido: solo el Administrador Principal puede realizar esta acción.',
            debugRole: req.user?.role,
        });
    }
    next();
};

export { ROLES };
