"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationController = void 0;
const auth_middleware_1 = require("../middlewares/auth.middleware");
const store_1 = require("../store");
const user_service_1 = require("../modules/services/user.service");
class ModerationController {
    // UC13: Usuwanie przez administratora z logowaniem powodu
    static async moderateRemoveEvent(req) {
        (0, auth_middleware_1.authorize)(req.userId, ["admin"]);
        (0, store_1.logModerationAction)({
            adminId: req.userId,
            eventId: req.eventId,
            reason: req.reason,
            action: "remove_event"
        });
        return (0, store_1.deleteEvent)(req.eventId);
    }
    // UC12: Zarządzanie użytkownikami przez Admina
    static async listAllUsers(req) {
        (0, auth_middleware_1.authorize)(req.userId, ["admin"]);
        return user_service_1.UserService.getAll();
    }
}
exports.ModerationController = ModerationController;
