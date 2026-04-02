import express, { Request, Response } from "express";
import {
  browseEvents,
  createOrganizerEvent,
  editOrganizerEvent,
  getEventDetails,
  removeEvent,
} from "./businessLogic";

const app = express();
const PORT = 3000;

app.use(express.json());

// Endpoint testowy
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// GET /api/events - lista wydarzen z opcjonalnym filtrowaniem
app.get("/api/events", (req: Request, res: Response) => {
  try {
    const events = browseEvents({
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
app.get("/api/events/:id", (req: Request, res: Response) => {
  try {
    const details = getEventDetails(req.params.id);
    res.json(details);
  } catch (error) {
    res.status(404).json({
      error: error instanceof Error ? error.message : "Event not found",
    });
  }
});

// POST /api/events - tworzenie wydarzenia
app.post("/api/events", (req: Request, res: Response) => {
  try {
    const { organizerId, ...eventInput } = req.body as {
      organizerId?: string;
      [key: string]: unknown;
    };

    if (!organizerId || typeof organizerId !== "string") {
      return res
        .status(400)
        .json({ error: "organizerId is required in request body" });
    }

    const created = createOrganizerEvent(organizerId, eventInput as any);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to create event",
    });
  }
});

// PUT /api/events/:id - edycja wydarzenia
app.put("/api/events/:id", (req: Request, res: Response) => {
  try {
    const { actorId, ...patch } = req.body as {
      actorId?: string;
      [key: string]: unknown;
    };

    if (!actorId || typeof actorId !== "string") {
      return res
        .status(400)
        .json({ error: "actorId is required in request body" });
    }

    const updated = editOrganizerEvent(actorId, req.params.id, patch as any);
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to update event",
    });
  }
});

// DELETE /api/events/:id - usuniecie wydarzenia
app.delete("/api/events/:id", (req: Request, res: Response) => {
  try {
    const actorId = req.query.actorId;

    if (!actorId || typeof actorId !== "string") {
      return res.status(400).json({ error: "actorId query param is required" });
    }

    removeEvent(actorId, req.params.id);
    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to delete event",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export * from "./types";
export * from "./store";
export * from "./businessLogic";
