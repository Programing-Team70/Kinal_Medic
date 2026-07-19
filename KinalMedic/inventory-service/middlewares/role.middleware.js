const STAFF_ROLES = ['ADMIN_ROLE', 'ADMIN_PRINCIPAL'];

export const verifyAdminRole = (req, res, next) => {
    if (!req.user) {
        return res.status(500).json({
            success: false,
            message: 'Usuario no encontrado.',
        });
    }

    if (!STAFF_ROLES.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message:
                'Acceso denegado: se requiere rol de médico (ADMIN_ROLE) o Administrador Principal.',
        });
    }

    next();
};
