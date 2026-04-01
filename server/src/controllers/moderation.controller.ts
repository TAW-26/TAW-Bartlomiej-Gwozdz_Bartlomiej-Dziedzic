import { authorize } from "../middlewares/auth.middleware";
import { logModerationAction, deleteEvent } from "../store";
import {UserService} from "../modules/services/user.service";

export class ModerationController {
    // UC13: Usuwanie przez administratora z logowaniem powodu
    static async moderateRemoveEvent(req: { userId: string; eventId: string; reason: string }) {
        authorize(req.userId, ["admin"]);

        logModerationAction({
            adminId: req.userId,
            eventId: req.eventId,
            reason: req.reason,
            action: "remove_event"
        });

        return deleteEvent(req.eventId);
    }

    // UC12: Zarządzanie użytkownikami przez Admina
    static async listAllUsers(req: { userId: string }) {
        authorize(req.userId, ["admin"]);
        return UserService.getAll();
    }
}