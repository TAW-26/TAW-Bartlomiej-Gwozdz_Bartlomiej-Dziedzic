import { getUserById } from "../store";
import { UserRole } from "../types";

export const authorize = (actorId: string, allowedRoles: UserRole[]) => {
    const user = getUserById(actorId);
    if (!user) throw new Error("Użytkownik nie istnieje");

    if (!allowedRoles.includes(user.role)) {
        throw new Error("Brak uprawnień do wykonania tej akcji");
    }
    return user;
};

// Middleware sprawdzajacy czy uzytkownik jest włascicielem zasobu lub adminem
export const isOwnerOrAdmin = (actorId: string, resourceOrganizerId: string) => {
    const user = getUserById(actorId);
    if (user?.role === "admin") return true;
    if (actorId === resourceOrganizerId) return true;
    throw new Error("brak uprawnień");
};