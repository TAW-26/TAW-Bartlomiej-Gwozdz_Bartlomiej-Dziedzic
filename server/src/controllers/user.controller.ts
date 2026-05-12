import { authorize, createAccessToken } from "../middlewares/auth.middleware";
import { UserService } from "../modules/services/user.service";
import { EventService } from "../modules/services/event.service";
import { EventView, PublicUser, UserRole } from "../types";

export class UserController {
  static async register(req: {
    body: { email: string; password: string; confirmPassword?: string; fullName?: string };
  }): Promise<PublicUser> {
    return UserService.register(req.body);
  }

  static async login(req: {
    body: { email: string; password: string };
  }): Promise<{ user: PublicUser; token: string }> {
    const user = await UserService.login(req.body.email, req.body.password);
    const token = createAccessToken({ id: user.id, role: user.role, email: user.email });
    return { user, token };
  }

  static async listAll(req: { userId: string }): Promise<PublicUser[]> {
    await authorize(req.userId, ["admin"]);
    return UserService.getAll();
  }

  static async listOwnEvents(req: { userId: string }): Promise<EventView[]> {
    return EventService.listParticipantEvents(req.userId);
  }

  static async updateRole(req: {
    userId: string;
    targetId: string;
    role: UserRole;
  }): Promise<PublicUser> {
    await authorize(req.userId, ["admin"]);
    return UserService.updateRole(req.targetId, req.role);
  }

  static async remove(req: { userId: string; targetId: string }): Promise<void> {
    await authorize(req.userId, ["admin"]);
    if (req.userId === req.targetId) {
      throw new Error("Administrator cannot delete own account");
    }
    const deleted = await UserService.removeAccount(req.targetId);
    if (!deleted) throw new Error("User not found");
  }
}
