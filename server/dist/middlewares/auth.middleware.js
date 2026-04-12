"use strict";
const jwt = require("jsonwebtoken");
const { getUserById } = require("../store");

// Klucz w env(.env)
const JWT_SECRET = process.env.JWT_SECRET || "none";

/**
 * Główny middleware do autentykacji JWT.
 * Wyciąga token z nagłówka Authorization, weryfikuje go i dołącza usera do req.
 */
exports.authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        // Format "Bearer <token>"
        const token = authHeader.split(' ')[1];

        jwt.verify(token, JWT_SECRET, (err, userPayload) => {
            if (err) {
                return res.status(403).json({ error: "Token jest nieważny lub wygasł" });
            }

            // Dołączamy dane z tokena do obiektu request
            req.user = userPayload;
            next();
        });
    } else {
        res.status(401).json({ error: "Brak tokena autoryzacyjnego" });
    }
};

/**
 * Middleware sprawdzający uprawnienia
 */
exports.authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Użytkownik niezalogowany" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Brak uprawnień do wykonania tej akcji" });
        }

        next();
    };
};

/**
 * Middleware sprawdzający czy użytkownik jest właścicielem zasobu lub adminem
 */
exports.isOwnerOrAdmin = async (req, res, next) => {
    const user = req.user;
    const resourceOrganizerId = req.params.organizerId || req.body.organizerId;

    if (!user) return res.status(401).json({ error: "Brak autoryzacji" });

    if (user.role === "admin") {
        return next();
    }

    if (user.id === resourceOrganizerId) {
        return next();
    }

    return res.status(403).json({ error: "Brak uprawnień - nie jesteś właścicielem" });
};