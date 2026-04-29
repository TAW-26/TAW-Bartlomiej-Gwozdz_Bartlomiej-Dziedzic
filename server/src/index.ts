import fs from "fs";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import path from "path";
import {
  browseEvents,
  createOrganizerEvent,
  editOrganizerEvent,
  getEventDetails,
  removeEvent,
  registerUser,
  loginUser,
  listUsersForAdmin,
  changeUserRole,
  removeUserByAdmin,
  listParticipantsForEvent,
  confirmParticipation,
  cancelParticipation,
  listOrganizerEvents,
  removeParticipantFromEvent,
  listParticipantEvents,
  moderateEventRemoval,
} from "./businessLogic";
import {
  authenticateJWT,
  AuthenticatedRequest,
  createAccessToken,
  requireRoles,
} from "./middlewares/auth.middleware";
import { ensureAdminSeed } from "./store";

const app = express();
const PORT = 3000;

interface LocalSecrets {
  mongodbUser?: string;
  mongodbPassword?: string;
  mongodbCluster?: string;
  mongodbAppName?: string;
  mongodbUri?: string;
  jwtSecret?: string;
}

const loadLocalSecrets = (): void => {
  const secretsFilePath = path.resolve(__dirname, "../secrets.json");

  if (!fs.existsSync(secretsFilePath)) {
    return;
  }

  try {
    const fileContents = fs.readFileSync(secretsFilePath, "utf8");
    const parsed = JSON.parse(fileContents) as LocalSecrets;

    if (parsed.mongodbUri && process.env.MONGODB_URI === undefined) {
      process.env.MONGODB_URI = parsed.mongodbUri;
    }

    if (parsed.mongodbUser && process.env.MONGODB_USER === undefined) {
      process.env.MONGODB_USER = parsed.mongodbUser;
    }

    if (parsed.mongodbPassword && process.env.MONGODB_PASSWORD === undefined) {
      process.env.MONGODB_PASSWORD = parsed.mongodbPassword;
    }

    if (parsed.mongodbCluster && process.env.MONGODB_CLUSTER === undefined) {
      process.env.MONGODB_CLUSTER = parsed.mongodbCluster;
    }

    if (parsed.mongodbAppName && process.env.MONGODB_APP_NAME === undefined) {
      process.env.MONGODB_APP_NAME = parsed.mongodbAppName;
    }

    if (parsed.jwtSecret && process.env.JWT_SECRET === undefined) {
      process.env.JWT_SECRET = parsed.jwtSecret;
    }
  } catch {
    console.warn("Cannot parse server/secrets.json. Falling back to env vars.");
  }
};

const buildMongoUri = (): string | undefined => {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  const user = process.env.MONGODB_USER;
  const password = process.env.MONGODB_PASSWORD;
  const cluster = process.env.MONGODB_CLUSTER ?? "cluster0.inw1xa4.mongodb.net";
  const appName = process.env.MONGODB_APP_NAME ?? "Cluster0";

  if (!user || !password) {
    return undefined;
  }

  return `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(
    password,
  )}@${cluster}/?appName=${encodeURIComponent(appName)}`;
};

loadLocalSecrets();

app.use(express.json());

// Endpoint testowy
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// GET /api/events - lista wydarzen z opcjonalnym filtrowaniem
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
    res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to list events",
    });
  }
});

// GET /api/events/:id - szczegoly pojedynczego wydarzenia
app.get("/api/events/:id", async (req: Request, res: Response) => {
  try {
    const details = await getEventDetails(req.params.id);
    res.json(details);
  } catch (error) {
    res.status(404).json({
      error: error instanceof Error ? error.message : "Event not found",
    });
  }
});

// POST /api/events - tworzenie wydarzenia
app.post(
  "/api/events",
  authenticateJWT,
  requireRoles(["organizer", "admin"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventInput = req.body as Record<string, unknown>;
      const created = await createOrganizerEvent(
        req.user!.id,
        eventInput as any,
      );
      return res.status(201).json(created);
    } catch (error) {
      return res.status(400).json({
        error:
          error instanceof Error ? error.message : "Failed to create event",
      });
    }
  },
);

// PUT /api/events/:id - edycja wydarzenia
app.put(
  "/api/events/:id",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const patch = req.body as Record<string, unknown>;

      const updated = await editOrganizerEvent(
        req.user!.id,
        req.params.id,
        patch as any,
      );
      return res.json(updated);
    } catch (error) {
      return res.status(400).json({
        error:
          error instanceof Error ? error.message : "Failed to update event",
      });
    }
  },
);

// DELETE /api/events/:id - usuniecie wydarzenia
app.delete(
  "/api/events/:id",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      await removeEvent(req.user!.id, req.params.id);
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({
        error:
          error instanceof Error ? error.message : "Failed to delete event",
      });
    }
  },
);

// GET /api/events/:id/participants - lista uczestnikow (tylko dla organizatora/admina)
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
      return res.status(403).json({
        error: error instanceof Error ? error.message : "Access denied",
      });
    }
  },
);

// POST /api/events/:id/join - dolaczenie do wydarzenia
app.post(
  "/api/events/:id/join",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await confirmParticipation(req.params.id, req.user!.id);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to join event",
      });
    }
  },
);

// POST /api/events/:id/leave - rezygnacja z wydarzenia
app.post(
  "/api/events/:id/leave",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await cancelParticipation(req.params.id, req.user!.id);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to leave event",
      });
    }
  },
);

// GET /api/events/organizer/my-events - lista wlasnych eventow organizatora
app.get(
  "/api/events/organizer/my-events",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const events = await listOrganizerEvents(req.user!.id);
      return res.json(events);
    } catch (error) {
      return res.status(403).json({
        error: error instanceof Error ? error.message : "Access denied",
      });
    }
  },
);

// DELETE /api/events/:id/participants/:userId - usuniecie uczestnika z wydarzenia
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
      return res.status(403).json({
        error: error instanceof Error ? error.message : "Access denied",
      });
    }
  },
);

// ========== USER ENDPOINTS ==========

// POST /api/users/register - rejestracja nowego uzytkownika
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
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to register user",
    });
  }
});

// POST /api/users/login - logowanie uzytkownika
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
    return res.status(401).json({
      error: error instanceof Error ? error.message : "Invalid credentials",
    });
  }
});

// GET /api/users - lista wszystkich uzytkownikow (tylko admin)
app.get(
  "/api/users",
  authenticateJWT,
  requireRoles(["admin"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const users = await listUsersForAdmin(req.user!.id);
      return res.json(users);
    } catch (error) {
      return res.status(403).json({
        error: error instanceof Error ? error.message : "Access denied",
      });
    }
  },
);

// GET /api/users/me/events - lista wydarzen, do ktorych dolaczyl zalogowany uzytkownik
app.get(
  "/api/users/me/events",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const events = await listParticipantEvents(req.user!.id);
      return res.json(events);
    } catch (error) {
      return res.status(403).json({
        error: error instanceof Error ? error.message : "Access denied",
      });
    }
  },
);

// PUT /api/users/:id/role - zmiana roli uzytkownika (tylko admin)
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
        newRole as any,
      );
      return res.json(updated);
    } catch (error) {
      return res.status(403).json({
        error: error instanceof Error ? error.message : "Failed to update role",
      });
    }
  },
);

// DELETE /api/users/:id - usuniecie uzytkownika (tylko admin)
app.delete(
  "/api/users/:id",
  authenticateJWT,
  requireRoles(["admin"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      await removeUserByAdmin(req.user!.id, req.params.id);
      return res.status(204).send();
    } catch (error) {
      return res.status(403).json({
        error: error instanceof Error ? error.message : "Failed to delete user",
      });
    }
  },
);

// ========== MODERATION ENDPOINTS ==========

// POST /api/moderation/remove-event - moderacja usuniecia wydarzenia przez admina
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
      return res.status(403).json({
        error:
          error instanceof Error ? error.message : "Failed to moderate event",
      });
    }
  },
);

const startServer = async (): Promise<void> => {
  const mongoUri = buildMongoUri();

  if (!mongoUri) {
    console.warn("no configurtion of MongoDB.");
  } else {
    try {
      await mongoose.connect(mongoUri);
      console.log("Connected to MongoDB");
      await ensureAdminSeed();
    } catch (error) {
      console.error(
        "error connecting to mongoDB",
        error instanceof Error ? error.message : error,
      );
    }
  }

  // Uruchamiamy serwer niezależnie od tego, czy baza danych działa, czy nie
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
};

void startServer();

export * from "./types";
export * from "./store";
export * from "./businessLogic";
