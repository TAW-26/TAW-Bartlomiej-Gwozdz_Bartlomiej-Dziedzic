import { authorize } from "../middlewares/auth.middleware";
import { logModerationAction, deleteEvent } from "../store";
import { UserService } from "../modules/services/user.service";

export class ModerationController {
  static async moderateRemoveEvent(req: {
    userId: string;
    eventId: string;
    reason?: string;
  }): Promise<{ moderationId: string }> {
    await authorize(req.userId, ["admin"]);

    const log = await logModerationAction({
      adminId: req.userId,
      eventId: req.eventId,
      reason: req.reason,
      action: "remove_event",
    });

    await deleteEvent(req.eventId);
    return { moderationId: log.id };
  }

  static async listAllUsers(req: { userId: string }) {
    await authorize(req.userId, ["admin"]);
    return UserService.getAll();
  }
}
