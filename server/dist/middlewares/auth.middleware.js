"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOwnerOrAdmin = exports.authorize = exports.requireRoles = exports.authenticateJWT = exports.createAccessToken = void 0;
const store_1 = require("../store");
const jwt = require("jsonwebtoken");
const getJwtSecret = () => process.env.JWT_SECRET ?? "dev-jwt-secret";
const createAccessToken = (user) => jwt.sign({ ...user }, getJwtSecret(), { expiresIn: "8h" });
exports.createAccessToken = createAccessToken;
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res
            .status(401)
            .json({ error: "Brak lub niepoprawny naglowek Authorization" });
        return;
    }
    const token = authHeader.slice("Bearer ".length).trim();
    if (!token) {
        res.status(401).json({ error: "Brak tokena" });
        return;
    }
    try {
        req.user = jwt.verify(token, getJwtSecret());
        next();
    }
    catch {
        res.status(401).json({ error: "Token jest niewazny lub wygasl" });
    }
};
exports.authenticateJWT = authenticateJWT;
const requireRoles = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: "Uzytkownik niezalogowany" });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: "Brak uprawnien" });
            return;
        }
        next();
    };
};
exports.requireRoles = requireRoles;
// Legacy helpers kept for compatibility with controller classes.
const authorize = async (actorId, allowedRoles) => {
    const user = await (0, store_1.getUserById)(actorId);
    if (!user)
        throw new Error("Uzytkownik nie istnieje");
    if (!allowedRoles.includes(user.role)) {
        throw new Error("Brak uprawnien do wykonania tej akcji");
    }
    return user;
};
exports.authorize = authorize;
const isOwnerOrAdmin = async (actorId, resourceOrganizerId) => {
    const user = await (0, store_1.getUserById)(actorId);
    if (user?.role === "admin")
        return true;
    if (actorId === resourceOrganizerId)
        return true;
    throw new Error("Brak uprawnien");
};
exports.isOwnerOrAdmin = isOwnerOrAdmin;
