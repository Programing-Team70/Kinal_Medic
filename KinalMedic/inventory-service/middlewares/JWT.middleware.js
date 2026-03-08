import jwt from "jsonwebtoken";

export const validateJWT = (req, res, next) => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        console.error("Error: JWT_SECRET no está definido en el entorno.");
        return res.status(500).json({
            success: false,
            message: "Error de configuración del servidor."
        });
    }

    const token =
        req.header("x-token") ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Token no proporcionado.",
            error: "MISSING_TOKEN"
        });
    }

    try {
        const decoded = jwt.verify(token, secret);

        req.user = {
            id: decoded.id || decoded.uid || decoded.sub,
            role: decoded.role || "student"
        };
        
        next();
    } catch (error) {
        console.error("JWT validation error:", error.message);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expirado.",
                error: "TOKEN_EXPIRED"
            });
        }

        return res.status(401).json({
            success: false,
            message: "Token Invalido.",
            error: "INVALID_TOKEN"
        });
    }
};

export const verifyAdminRole = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Acceso denegado: se requiere rol de administrador."
        });
    }
    next();
};