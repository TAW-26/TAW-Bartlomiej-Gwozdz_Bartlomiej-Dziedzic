"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const businessLogic_1 = require("./businessLogic");
const app = (0, express_1.default)();
const PORT = 3000;
app.use(express_1.default.json());
// Endpoint testowy
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
});
// GET /api/events - lista wydarzen z opcjonalnym filtrowaniem
app.get("/api/events", (req, res) => {
    try {
        const events = (0, businessLogic_1.browseEvents)({
            q: typeof req.query.q === "string" ? req.query.q : undefined,
            city: typeof req.query.city === "string" ? req.query.city : undefined,
            category: typeof req.query.category === "string" ? req.query.category : undefined,
            from: typeof req.query.from === "string" ? req.query.from : undefined,
            to: typeof req.query.to === "string" ? req.query.to : undefined,
            status: req.query.status === "open" || req.query.status === "closed"
                ? req.query.status
                : undefined,
        });
        res.json(events);
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Failed to list events",
        });
    }
});
// GET /api/events/:id - szczegoly pojedynczego wydarzenia
app.get("/api/events/:id", (req, res) => {
    try {
        const details = (0, businessLogic_1.getEventDetails)(req.params.id);
        res.json(details);
    }
    catch (error) {
        res.status(404).json({
            error: error instanceof Error ? error.message : "Event not found",
        });
    }
});
// POST /api/events - tworzenie wydarzenia
app.post("/api/events", (req, res) => {
    try {
        const { organizerId, ...eventInput } = req.body;
        if (!organizerId || typeof organizerId !== "string") {
            return res
                .status(400)
                .json({ error: "organizerId is required in request body" });
        }
        const created = (0, businessLogic_1.createOrganizerEvent)(organizerId, eventInput);
        return res.status(201).json(created);
    }
    catch (error) {
        return res.status(400).json({
            error: error instanceof Error ? error.message : "Failed to create event",
        });
    }
});
// PUT /api/events/:id - edycja wydarzenia
app.put("/api/events/:id", (req, res) => {
    try {
        const { actorId, ...patch } = req.body;
        if (!actorId || typeof actorId !== "string") {
            return res
                .status(400)
                .json({ error: "actorId is required in request body" });
        }
        const updated = (0, businessLogic_1.editOrganizerEvent)(actorId, req.params.id, patch);
        return res.json(updated);
    }
    catch (error) {
        return res.status(400).json({
            error: error instanceof Error ? error.message : "Failed to update event",
        });
    }
});
// DELETE /api/events/:id - usuniecie wydarzenia
app.delete("/api/events/:id", (req, res) => {
    try {
        const actorId = req.query.actorId;
        if (!actorId || typeof actorId !== "string") {
            return res.status(400).json({ error: "actorId query param is required" });
        }
        (0, businessLogic_1.removeEvent)(actorId, req.params.id);
        return res.status(204).send();
    }
    catch (error) {
        return res.status(400).json({
            error: error instanceof Error ? error.message : "Failed to delete event",
        });
    }
});
// GET /api/events/:id/participants - lista uczestnikow (tylko dla organizatora/admina)
app.get("/api/events/:id/participants", (req, res) => {
    try {
        const actorId = req.query.actorId;
        if (!actorId || typeof actorId !== "string") {
            return res
                .status(400)
                .json({ error: "actorId query param is required" });
        }
        const participants = (0, businessLogic_1.listParticipantsForEvent)(actorId, req.params.id);
        return res.json(participants);
    }
    catch (error) {
        return res.status(403).json({
            error: error instanceof Error ? error.message : "Access denied",
        });
    }
});
// POST /api/events/:id/join - dolaczenie do wydarzenia
app.post("/api/events/:id/join", (req, res) => {
    try {
        const userId = req.body.userId;
        if (!userId || typeof userId !== "string") {
            return res.status(400).json({ error: "userId is required in request body" });
        }
        const result = (0, businessLogic_1.confirmParticipation)(req.params.id, userId);
        return res.status(201).json(result);
    }
    catch (error) {
        return res.status(400).json({
            error: error instanceof Error ? error.message : "Failed to join event",
        });
    }
});
// POST /api/events/:id/leave - rezygnacja z wydarzenia
app.post("/api/events/:id/leave", (req, res) => {
    try {
        const userId = req.body.userId;
        if (!userId || typeof userId !== "string") {
            return res.status(400).json({ error: "userId is required in request body" });
        }
        const result = (0, businessLogic_1.cancelParticipation)(req.params.id, userId);
        return res.json(result);
    }
    catch (error) {
        return res.status(400).json({
            error: error instanceof Error ? error.message : "Failed to leave event",
        });
    }
});
// ========== USER ENDPOINTS ==========
// POST /api/users/register - rejestracja nowego uzytkownika
app.post("/api/users/register", (req, res) => {
    try {
        const user = (0, businessLogic_1.registerUser)({
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
            fullName: req.body.fullName,
        });
        return res.status(201).json(user);
    }
    catch (error) {
        return res.status(400).json({
            error: error instanceof Error ? error.message : "Failed to register user",
        });
    }
});
// POST /api/users/login - logowanie uzytkownika
app.post("/api/users/login", (req, res) => {
    try {
        const user = (0, businessLogic_1.loginUser)({
            email: req.body.email,
            password: req.body.password,
        });
        return res.json(user);
    }
    catch (error) {
        return res.status(401).json({
            error: error instanceof Error ? error.message : "Invalid credentials",
        });
    }
});
// GET /api/users - lista wszystkich uzytkownikow (tylko admin)
app.get("/api/users", (req, res) => {
    try {
        const adminId = req.query.adminId;
        if (!adminId || typeof adminId !== "string") {
            return res.status(400).json({ error: "adminId query param is required" });
        }
        const users = (0, businessLogic_1.listUsersForAdmin)(adminId);
        return res.json(users);
    }
    catch (error) {
        return res.status(403).json({
            error: error instanceof Error ? error.message : "Access denied",
        });
    }
});
// PUT /api/users/:id/role - zmiana roli uzytkownika (tylko admin)
app.put("/api/users/:id/role", (req, res) => {
    try {
        const adminId = req.body.adminId;
        const newRole = req.body.role;
        if (!adminId || typeof adminId !== "string") {
            return res
                .status(400)
                .json({ error: "adminId is required in request body" });
        }
        if (!newRole || typeof newRole !== "string") {
            return res
                .status(400)
                .json({ error: "role is required in request body" });
        }
        const updated = (0, businessLogic_1.changeUserRole)(adminId, req.params.id, newRole);
        return res.json(updated);
    }
    catch (error) {
        return res.status(403).json({
            error: error instanceof Error ? error.message : "Failed to update role",
        });
    }
});
// DELETE /api/users/:id - usuniecie uzytkownika (tylko admin)
app.delete("/api/users/:id", (req, res) => {
    try {
        const adminId = req.query.adminId;
        if (!adminId || typeof adminId !== "string") {
            return res.status(400).json({ error: "adminId query param is required" });
        }
        (0, businessLogic_1.removeUserByAdmin)(adminId, req.params.id);
        return res.status(204).send();
    }
    catch (error) {
        return res.status(403).json({
            error: error instanceof Error ? error.message : "Failed to delete user",
        });
    }
});
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});
__exportStar(require("./types"), exports);
__exportStar(require("./store"), exports);
__exportStar(require("./businessLogic"), exports);
