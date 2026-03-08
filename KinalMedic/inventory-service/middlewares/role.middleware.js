export const verifyAdminRole = (req, res, next) => {

    if (!req.user) {
        return res.status(500).json({
            success: false,
            message: "Usuario no encontrado."
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Acceso denegado: se requiere rol de administrador."
        });
    }

    next();
};