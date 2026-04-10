import {
  createUser,
  getUserByEmail,
  getPublicUsers,
  updateUser,
  deleteUser,
} from "../../store";
import { User, PublicUser, UserRole } from "../models/user.model";

export class UserService {
  static async register(data: any): Promise<PublicUser> {
    const existing = await getUserByEmail(data.email);
    if (existing) throw new Error("Email jest już zajęty");

    return createUser(data);
  }

  static async login(email: string, password: string): Promise<PublicUser> {
    const user = await getUserByEmail(email);
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

  static async getAll(): Promise<PublicUser[]> {
    return getPublicUsers();
  }

  static async updateRole(userId: string, role: UserRole): Promise<PublicUser> {
    const updated = await updateUser(userId, { role });
    if (!updated) throw new Error("Użytkownik nie istnieje");
    return updated;
  }

  static async removeAccount(userId: string): Promise<boolean> {
    return deleteUser(userId);
  }
}
