import { createUser, getUserByEmail, getPublicUsers, updateUser, deleteUser } from "../../store";
import { PublicUser, UserRole } from "../models/user.model";

interface RegisterInput {
  email: string;
  password: string;
  confirmPassword?: string;
  fullName?: string;
  role?: UserRole;
}

export class UserService {
  static async register(data: RegisterInput): Promise<PublicUser> {
    if (!data.email?.trim()) throw new Error("Email is required");
    if (data.password.length < 8) throw new Error("Password must be at least 8 characters");
    if (data.confirmPassword !== undefined && data.password !== data.confirmPassword)
      throw new Error("Passwords must match");

    const existing = await getUserByEmail(data.email);
    if (existing) throw new Error("An account with this email already exists");

    return createUser(data);
  }

  static async login(email: string, password: string): Promise<PublicUser> {
    const user = await getUserByEmail(email);
    if (!user || user.password !== password) {
      throw new Error("Invalid email or password");
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
    if (!updated) throw new Error("User not found");
    return updated;
  }

  static async removeAccount(userId: string): Promise<boolean> {
    return deleteUser(userId);
  }
}
