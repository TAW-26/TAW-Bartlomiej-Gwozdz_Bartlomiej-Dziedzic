"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOwnerOrAdmin = exports.authorize = void 0;
const store_1 = require("../store");
const authorize = async (actorId, allowedRoles) => {
    const user = await (0, store_1.getUserById)(actorId);
    if (!user)
        throw new Error("Użytkownik nie istnieje");
    if (!allowedRoles.includes(user.role)) {
        throw new Error("Brak uprawnień do wykonania tej akcji");
    }
    return user;
};
exports.authorize = authorize;
// Middleware sprawdzajacy czy uzytkownik jest włascicielem zasobu lub adminem
const isOwnerOrAdmin = async (actorId, resourceOrganizerId) => {
    const user = await (0, store_1.getUserById)(actorId);
    if (user?.role === "admin")
        return true;
    if (actorId === resourceOrganizerId)
        return true;
    throw new Error("brak uprawnień");
};
exports.isOwnerOrAdmin = isOwnerOrAdmin;
