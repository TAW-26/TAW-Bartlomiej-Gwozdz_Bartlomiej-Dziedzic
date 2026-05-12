import express, { Request, Response } from "express";
import {
  browseEvents,
  cancelParticipation,
  changeUserRole,
  confirmParticipation,
  createOrganizerEvent,
  editOrganizerEvent,
  getEventDetails,
  listOrganizerEvents,
  listParticipantEvents,
  listParticipantsForEvent,
  listUsersForAdmin,
  loginUser,
  moderateEventRemoval,
  registerUser,
  removeEvent,
  removeParticipantFromEvent,
  removeUserByAdmin,
} from "./businessLogic";
import {
  AuthenticatedRequest,
  authenticateJWT,
  createAccessToken,
  requireRoles,
} from "./middlewares/auth.middleware";

const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.get("/api/events", async (req: Request, res: Response) => {
  try {
    const events = await browseEvents({
      q: typeof req.query.q === "string" ? req.query.q : undefined,
      city: typeof req.query.city === "string" ? req.query.city : undefined,
      category:
        typeof req.query.category === "string" ? req.query.category : undefined,
      from: typeof req.query.from === "string" ? req.query.from : undefined,
      to: typeof req.query.to === "string" ? req.query.to : undefined,
      status:
        req.query.status === "open" || req.query.status === "closed"
          ? req.query.status
          : undefined,
    });
    res.json(events);
  } catch (error) {
    res
      .status(400)
      .json({
        error: error instanceof Error ? error.message : "Failed to list events",
      });
  }
});

// Must be before /:id to avoid "organizer" being treated as an event id
app.get(
  "/api/events/organizer/my-events",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const events = await listOrganizerEvents(req.user!.id);
      return res.json(events);
    } catch (error) {
      return res
        .status(403)
        .json({
          error: error instanceof Error ? error.message : "Access denied",
        });
    }
  },
);

app.get("/api/events/:id", async (req: Request, res: Response) => {
  try {
    const details = await getEventDetails(req.params.id);
    res.json(details);
  } catch (error) {
    res
      .status(404)
      .json({
        error: error instanceof Error ? error.message : "Event not found",
      });
  }
});

app.post(
  "/api/events",
  authenticateJWT,
  requireRoles(["organizer", "admin"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const created = await createOrganizerEvent(
        req.user!.id,
        req.body as Parameters<typeof createOrganizerEvent>[1],
      );
      return res.status(201).json(created);
    } catch (error) {
      return res
        .status(400)
        .json({
          error:
            error instanceof Error ? error.message : "Failed to create event",
        });
    }
  },
);

app.put(
  "/api/events/:id",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const updated = await editOrganizerEvent(
        req.user!.id,
        req.params.id,
        req.body as Parameters<typeof editOrganizerEvent>[2],
      );
      return res.json(updated);
    } catch (error) {
      return res
        .status(400)
        .json({
          error:
            error instanceof Error ? error.message : "Failed to update event",
        });
    }
  },
);

app.delete(
  "/api/events/:id",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      await removeEvent(req.user!.id, req.params.id);
      return res.status(204).send();
    } catch (error) {
      return res
        .status(400)
        .json({
          error:
            error instanceof Error ? error.message : "Failed to delete event",
        });
    }
  },
);

app.get(
  "/api/events/:id/participants",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const participants = await listParticipantsForEvent(
        req.user!.id,
        req.params.id,
      );
      return res.json(participants);
    } catch (error) {
      return res
        .status(403)
        .json({
          error: error instanceof Error ? error.message : "Access denied",
        });
    }
  },
);

app.post(
  "/api/events/:id/join",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await confirmParticipation(req.params.id, req.user!.id);
      return res.status(201).json(result);
    } catch (error) {
      return res
        .status(400)
        .json({
          error: error instanceof Error ? error.message : "Failed to join event",
        });
    }
  },
);

app.post(
  "/api/events/:id/leave",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await cancelParticipation(req.params.id, req.user!.id);
      return res.json(result);
    } catch (error) {
      return res
        .status(400)
        .json({
          error:
            error instanceof Error ? error.message : "Failed to leave event",
        });
    }
  },
);

app.delete(
  "/api/events/:id/participants/:userId",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await removeParticipantFromEvent(
        req.user!.id,
        req.params.id,
        req.params.userId,
      );
      return res.json(result);
    } catch (error) {
      return res
        .status(403)
        .json({
          error: error instanceof Error ? error.message : "Access denied",
        });
    }
  },
);

// ========== USER ENDPOINTS ==========

app.post("/api/users/register", async (req: Request, res: Response) => {
  try {
    const user = await registerUser({
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      fullName: req.body.fullName,
    });
    return res.status(201).json(user);
  } catch (error) {
    return res
      .status(400)
      .json({
        error:
          error instanceof Error ? error.message : "Failed to register user",
      });
  }
});

app.post("/api/users/login", async (req: Request, res: Response) => {
  try {
    const user = await loginUser({
      email: req.body.email,
      password: req.body.password,
    });
    const token = createAccessToken({
      id: user.id,
      role: user.role,
      email: user.email,
    });
    return res.json({ user, token });
  } catch (error) {
    return res
      .status(401)
      .json({
        error: error instanceof Error ? error.message : "Invalid credentials",
      });
  }
});

app.get(
  "/api/users",
  authenticateJWT,
  requireRoles(["admin"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const users = await listUsersForAdmin(req.user!.id);
      return res.json(users);
    } catch (error) {
      return res
        .status(403)
        .json({
          error: error instanceof Error ? error.message : "Access denied",
        });
    }
  },
);

app.get(
  "/api/users/me/events",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const events = await listParticipantEvents(req.user!.id);
      return res.json(events);
    } catch (error) {
      return res
        .status(403)
        .json({
          error: error instanceof Error ? error.message : "Access denied",
        });
    }
  },
);

app.put(
  "/api/users/:id/role",
  authenticateJWT,
  requireRoles(["admin"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const newRole = req.body.role;
      if (!newRole || typeof newRole !== "string") {
        return res
          .status(400)
          .json({ error: "role is required in request body" });
      }
      const updated = await changeUserRole(
        req.user!.id,
        req.params.id,
        newRole as Parameters<typeof changeUserRole>[2],
      );
      return res.json(updated);
    } catch (error) {
      return res
        .status(403)
        .json({
          error:
            error instanceof Error ? error.message : "Failed to update role",
        });
    }
  },
);

app.delete(
  "/api/users/:id",
  authenticateJWT,
  requireRoles(["admin"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      await removeUserByAdmin(req.user!.id, req.params.id);
      return res.status(204).send();
    } catch (error) {
      return res
        .status(403)
        .json({
          error:
            error instanceof Error ? error.message : "Failed to delete user",
        });
    }
  },
);

// ========== MODERATION ENDPOINTS ==========

app.post(
  "/api/moderation/remove-event",
  authenticateJWT,
  requireRoles(["admin"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = req.body.eventId;
      const reason = req.body.reason;
      if (!eventId || typeof eventId !== "string") {
        return res
          .status(400)
          .json({ error: "eventId is required in request body" });
      }
      const result = await moderateEventRemoval(req.user!.id, eventId, reason);
      return res.status(201).json(result);
    } catch (error) {
      return res
        .status(403)
        .json({
          error:
            error instanceof Error ? error.message : "Failed to moderate event",
        });
    }
  },
);

export default app;
