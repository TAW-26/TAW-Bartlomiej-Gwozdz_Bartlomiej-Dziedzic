import express, { Response } from "express";
import { EventController } from "./controllers/event.controller";
import { ModerationController } from "./controllers/moderation.controller";
import { UserController } from "./controllers/user.controller";
import { AuthenticatedRequest, authenticateJWT, requireRoles } from "./middlewares/auth.middleware";
import { UserRole } from "./types";

const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// ========== EVENT ENDPOINTS ==========

app.get("/api/events", async (req, res: Response) => {
  try {
    const events = await EventController.listEvents({
      query: {
        q: typeof req.query.q === "string" ? req.query.q : undefined,
        city: typeof req.query.city === "string" ? req.query.city : undefined,
        category: typeof req.query.category === "string" ? req.query.category : undefined,
        from: typeof req.query.from === "string" ? req.query.from : undefined,
        to: typeof req.query.to === "string" ? req.query.to : undefined,
        status:
          req.query.status === "open" || req.query.status === "closed"
            ? req.query.status
            : undefined,
      },
    });
    res.json(events);
  } catch (error) {
    res.status(400).json({
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
      const events = await EventController.listOrganizerEvents({
        userId: req.user!.id,
      });
      return res.json(events);
    } catch (error) {
      return res.status(403).json({
        error: error instanceof Error ? error.message : "Access denied",
      });
    }
  },
);

app.get("/api/events/:id", async (req, res: Response) => {
  try {
    const details = await EventController.getDetails({
      eventId: req.params.id,
    });
    res.json(details);
  } catch (error) {
    res.status(404).json({
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
      const created = await EventController.create({
        userId: req.user!.id,
        body: req.body as Parameters<typeof EventController.create>[0]["body"],
      });
      return res.status(201).json(created);
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to create event",
      });
    }
  },
);

app.put("/api/events/:id", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await EventController.update({
      userId: req.user!.id,
      eventId: req.params.id,
      body: req.body as Parameters<typeof EventController.update>[0]["body"],
    });
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to update event",
    });
  }
});

app.delete("/api/events/:id", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await EventController.delete({
      userId: req.user!.id,
      eventId: req.params.id,
    });
    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to delete event",
    });
  }
});

app.get(
  "/api/events/:id/participants",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const participants = await EventController.listParticipants({
        userId: req.user!.id,
        eventId: req.params.id,
      });
      return res.json(participants);
    } catch (error) {
      return res.status(403).json({
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
      const result = await EventController.join({
        eventId: req.params.id,
        userId: req.user!.id,
      });
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({
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
      const result = await EventController.leave({
        eventId: req.params.id,
        userId: req.user!.id,
      });
      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to leave event",
      });
    }
  },
);

app.delete(
  "/api/events/:id/participants/:userId",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await EventController.removeParticipant({
        userId: req.user!.id,
        eventId: req.params.id,
        participantId: req.params.userId,
      });
      return res.json(result);
    } catch (error) {
      return res.status(403).json({
        error: error instanceof Error ? error.message : "Access denied",
      });
    }
  },
);

// ========== USER ENDPOINTS ==========

app.post("/api/users/register", async (req, res: Response) => {
  try {
    const user = await UserController.register({
      body: req.body as Parameters<typeof UserController.register>[0]["body"],
    });
    return res.status(201).json(user);
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to register user",
    });
  }
});

app.post("/api/users/login", async (req, res: Response) => {
  try {
    const result = await UserController.login({
      body: req.body as Parameters<typeof UserController.login>[0]["body"],
    });
    return res.json(result);
  } catch (error) {
    return res.status(401).json({
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
      const users = await UserController.listAll({ userId: req.user!.id });
      return res.json(users);
    } catch (error) {
      return res.status(403).json({
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
      const events = await UserController.listOwnEvents({
        userId: req.user!.id,
      });
      return res.json(events);
    } catch (error) {
      return res.status(403).json({
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
      const { role: newRole } = req.body as { role?: unknown };
      if (!newRole || typeof newRole !== "string") {
        return res.status(400).json({ error: "role is required in request body" });
      }
      const updated = await UserController.updateRole({
        userId: req.user!.id,
        targetId: req.params.id,
        role: newRole as UserRole,
      });
      return res.json(updated);
    } catch (error) {
      return res.status(403).json({
        error: error instanceof Error ? error.message : "Failed to update role",
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
      await UserController.remove({
        userId: req.user!.id,
        targetId: req.params.id,
      });
      return res.status(204).send();
    } catch (error) {
      return res.status(403).json({
        error: error instanceof Error ? error.message : "Failed to delete user",
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
      const { eventId, reason } = req.body as { eventId?: unknown; reason?: unknown };
      if (!eventId || typeof eventId !== "string") {
        return res.status(400).json({ error: "eventId is required in request body" });
      }
      const result = await ModerationController.moderateRemoveEvent({
        userId: req.user!.id,
        eventId,
        reason: typeof reason === "string" ? reason : undefined,
      });
      return res.status(201).json(result);
    } catch (error) {
      return res.status(403).json({
        error: error instanceof Error ? error.message : "Failed to moderate event",
      });
    }
  },
);

export default app;
