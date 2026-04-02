"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const store_1 = require("../../store");
class UserService {
    static register(data) {
        const existing = (0, store_1.getUserByEmail)(data.email);
        if (existing)
            throw new Error("Email jest już zajęty");
        return (0, store_1.createUser)(data);
    }
    static login(email, password) {
        const user = (0, store_1.getUserByEmail)(email);
        if (!user || user.password !== password) {
            throw new Error("Błędny email lub hasło");
        }
        return user;
    }
    static getAll() {
        return (0, store_1.getPublicUsers)();
    }
    static updateRole(userId, role) {
        const updated = (0, store_1.updateUser)(userId, { role });
        if (!updated)
            throw new Error("Użytkownik nie istnieje");
        return updated;
    }
    static removeAccount(userId) {
        return (0, store_1.deleteUser)(userId);
    }
}
exports.UserService = UserService;
