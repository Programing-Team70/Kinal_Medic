import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ message: "Acceso denegado. No hay token." });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        console.error("DEBUG - Error de verificación:", err.message);
        return res.status(400).json({ message: "Token inválido o expirado" });
    }
};