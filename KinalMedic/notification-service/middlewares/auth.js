import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Token requerido (Bearer).',
        });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.TOKEN_SECRET || process.env.JWT_SECRET;

    if (!secret) {
        return res.status(500).json({
            success: false,
            message: 'TOKEN_SECRET no configurado en el servicio de notificaciones.',
        });
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.user = {
            id: decoded.id || decoded.uid || decoded.sub,
            role: decoded.role,
            name: decoded.name || '',
            email: (decoded.email || '').toLowerCase(),
        };
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado. Inicia sesión de nuevo.',
            });
        }
        return res.status(403).json({
            success: false,
            message: 'Token inválido.',
        });
    }
};

export const isStaff = (role) =>
    role === 'ADMIN_ROLE' || role === 'ADMIN_PRINCIPAL';
