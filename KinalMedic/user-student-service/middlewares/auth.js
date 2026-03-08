import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ message: "El acceso fue negado por el rol." });

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified; 
        next();
    } catch (err) {
        res.status(400).json({ message: "Token inválido, verifique correctamente su token." });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Acceso denegado: Se requiere rol de Administrador" });
    }
    next();
};

