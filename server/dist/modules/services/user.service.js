"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const store_1 = require("../../store");
class UserService {
    static async register(data) {
        const existing = await (0, store_1.getUserByEmail)(data.email);
        if (existing)
            throw new Error("Email jest już zajęty");
        return (0, store_1.createUser)(data);
    }
    static async login(email, password) {
        const user = await (0, store_1.getUserByEmail)(email);
        if (!user || user.password !== password) {
            throw new Error("Błędny email lub hasło");
        }
        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            createdAt: user.createdAt,
        };
    }
    static async getAll() {
        return (0, store_1.getPublicUsers)();
    }
    static async updateRole(userId, role) {
        const updated = await (0, store_1.updateUser)(userId, { role });
        if (!updated)
            throw new Error("Użytkownik nie istnieje");
        return updated;
    }
    static async removeAccount(userId) {
        return (0, store_1.deleteUser)(userId);
    }
}
exports.UserService = UserService;
