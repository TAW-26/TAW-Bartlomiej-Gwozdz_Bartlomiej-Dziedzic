import { createUser, getUserByEmail, getPublicUsers, updateUser, deleteUser } from "../../store";
import { User, PublicUser, UserRole } from "../models/user.model";

export class UserService {
    static register(data: any): PublicUser {
        const existing = getUserByEmail(data.email);
        if (existing) throw new Error("Email jest już zajęty");

        return createUser(data);
    }

    static login(email: string, password: string): PublicUser {
        const user = getUserByEmail(email);
        if (!user || user.password !== password) {
            throw new Error("Błędny email lub hasło");
        }
        return user;
    }

    static getAll(): PublicUser[] {
        return getPublicUsers();
    }

    static updateRole(userId: string, role: UserRole): PublicUser {
        const updated = updateUser(userId, { role });
        if (!updated) throw new Error("Użytkownik nie istnieje");
        return updated;
    }

    static removeAccount(userId: string): boolean {
        return deleteUser(userId);
    }
}