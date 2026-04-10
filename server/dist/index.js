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
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const businessLogic_1 = require("./businessLogic");
const store_1 = require("./store");
const app = (0, express_1.default)();
const PORT = 3000;
const loadLocalSecrets = () => {
    const secretsFilePath = path_1.default.resolve(__dirname, "../secrets.json");
    if (!fs_1.default.existsSync(secretsFilePath)) {
        return;
    }
    try {
        const fileContents = fs_1.default.readFileSync(secretsFilePath, "utf8");
        const parsed = JSON.parse(fileContents);
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
    }
    catch {
        console.warn("Cannot parse server/secrets.json. Falling back to env vars.");
    }
};
const buildMongoUri = () => {
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
    return `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${cluster}/?appName=${encodeURIComponent(appName)}`;
};
loadLocalSecrets();
app.use(express_1.default.json());
// Endpoint testowy
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
});
// GET /api/events - lista wydarzen z opcjonalnym filtrowaniem
app.get("/api/events", async (req, res) => {
    try {
        const events = await (0, businessLogic_1.browseEvents)({
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
app.get("/api/events/:id", async (req, res) => {
    try {
        const details = await (0, businessLogic_1.getEventDetails)(req.params.id);
        res.json(details);
    }
    catch (error) {
        res.status(404).json({
            error: error instanceof Error ? error.message : "Event not found",
        });
    }
});
// POST /api/events - tworzenie wydarzenia
app.post("/api/events", async (req, res) => {
    try {
        const { organizerId, ...eventInput } = req.body;
        if (!organizerId || typeof organizerId !== "string") {
            return res
                .status(400)
                .json({ error: "organizerId is required in request body" });
        }
        const created = await (0, businessLogic_1.createOrganizerEvent)(organizerId, eventInput);
        return res.status(201).json(created);
    }
    catch (error) {
        return res.status(400).json({
            error: error instanceof Error ? error.message : "Failed to create event",
        });
    }
});
// PUT /api/events/:id - edycja wydarzenia
app.put("/api/events/:id", async (req, res) => {
    try {
        const { actorId, ...patch } = req.body;
        if (!actorId || typeof actorId !== "string") {
            return res
                .status(400)
                .json({ error: "actorId is required in request body" });
        }
        const updated = await (0, businessLogic_1.editOrganizerEvent)(actorId, req.params.id, patch);
        return res.json(updated);
    }
    catch (error) {
        return res.status(400).json({
            error: error instanceof Error ? error.message : "Failed to update event",
        });
    }
});
// DELETE /api/events/:id - usuniecie wydarzenia
app.delete("/api/events/:id", async (req, res) => {
    try {
        const actorId = req.query.actorId;
        if (!actorId || typeof actorId !== "string") {
            return res.status(400).json({ error: "actorId query param is required" });
        }
        await (0, businessLogic_1.removeEvent)(actorId, req.params.id);
        return res.status(204).send();
    }
    catch (error) {
        return res.status(400).json({
            error: error instanceof Error ? error.message : "Failed to delete event",
        });
    }
});
// GET /api/events/:id/participants - lista uczestnikow (tylko dla organizatora/admina)
app.get("/api/events/:id/participants", async (req, res) => {
    try {
        const actorId = req.query.actorId;
        if (!actorId || typeof actorId !== "string") {
            return res.status(400).json({ error: "actorId query param is required" });
        }
        const participants = await (0, businessLogic_1.listParticipantsForEvent)(actorId, req.params.id);
        return res.json(participants);
    }
    catch (error) {
        return res.status(403).json({
            error: error instanceof Error ? error.message : "Access denied",
        });
    }
});
// POST /api/events/:id/join - dolaczenie do wydarzenia
app.post("/api/events/:id/join", async (req, res) => {
    try {
        const userId = req.body.userId;
        if (!userId || typeof userId !== "string") {
            return res
                .status(400)
                .json({ error: "userId is required in request body" });
        }
        const result = await (0, businessLogic_1.confirmParticipation)(req.params.id, userId);
        return res.status(201).json(result);
    }
    catch (error) {
        return res.status(400).json({
            error: error instanceof Error ? error.message : "Failed to join event",
        });
    }
});
// POST /api/events/:id/leave - rezygnacja z wydarzenia
app.post("/api/events/:id/leave", async (req, res) => {
    try {
        const userId = req.body.userId;
        if (!userId || typeof userId !== "string") {
            return res
                .status(400)
                .json({ error: "userId is required in request body" });
        }
        const result = await (0, businessLogic_1.cancelParticipation)(req.params.id, userId);
        return res.json(result);
    }
    catch (error) {
        return res.status(400).json({
            error: error instanceof Error ? error.message : "Failed to leave event",
        });
    }
});
// GET /api/events/organizer/my-events - lista wlasnych eventow organizatora
app.get("/api/events/organizer/my-events", async (req, res) => {
    try {
        const actorId = req.query.actorId;
        if (!actorId || typeof actorId !== "string") {
            return res.status(400).json({ error: "actorId query param is required" });
        }
        const events = await (0, businessLogic_1.listOrganizerEvents)(actorId);
        return res.json(events);
    }
    catch (error) {
        return res.status(403).json({
            error: error instanceof Error ? error.message : "Access denied",
        });
    }
});
// DELETE /api/events/:id/participants/:userId - usuniecie uczestnika z wydarzenia
app.delete("/api/events/:id/participants/:userId", async (req, res) => {
    try {
        const actorId = req.query.actorId;
        if (!actorId || typeof actorId !== "string") {
            return res
                .status(400)
                .json({ error: "actorId query param is required" });
        }
        const result = await (0, businessLogic_1.removeParticipantFromEvent)(actorId, req.params.id, req.params.userId);
        return res.json(result);
    }
    catch (error) {
        return res.status(403).json({
            error: error instanceof Error ? error.message : "Access denied",
        });
    }
});
// ========== USER ENDPOINTS ==========
// POST /api/users/register - rejestracja nowego uzytkownika
app.post("/api/users/register", async (req, res) => {
    try {
        const user = await (0, businessLogic_1.registerUser)({
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
app.post("/api/users/login", async (req, res) => {
    try {
        const user = await (0, businessLogic_1.loginUser)({
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
app.get("/api/users", async (req, res) => {
    try {
        const adminId = req.query.adminId;
        if (!adminId || typeof adminId !== "string") {
            return res.status(400).json({ error: "adminId query param is required" });
        }
        const users = await (0, businessLogic_1.listUsersForAdmin)(adminId);
        return res.json(users);
    }
    catch (error) {
        return res.status(403).json({
            error: error instanceof Error ? error.message : "Access denied",
        });
    }
});
// PUT /api/users/:id/role - zmiana roli uzytkownika (tylko admin)
app.put("/api/users/:id/role", async (req, res) => {
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
        const updated = await (0, businessLogic_1.changeUserRole)(adminId, req.params.id, newRole);
        return res.json(updated);
    }
    catch (error) {
        return res.status(403).json({
            error: error instanceof Error ? error.message : "Failed to update role",
        });
    }
});
// DELETE /api/users/:id - usuniecie uzytkownika (tylko admin)
app.delete("/api/users/:id", async (req, res) => {
    try {
        const adminId = req.query.adminId;
        if (!adminId || typeof adminId !== "string") {
            return res.status(400).json({ error: "adminId query param is required" });
        }
        await (0, businessLogic_1.removeUserByAdmin)(adminId, req.params.id);
        return res.status(204).send();
    }
    catch (error) {
        return res.status(403).json({
            error: error instanceof Error ? error.message : "Failed to delete user",
        });
    }
});
// ========== MODERATION ENDPOINTS ==========
// POST /api/moderation/remove-event - moderacja usuniecia wydarzenia przez admina
app.post("/api/moderation/remove-event", async (req, res) => {
    try {
        const adminId = req.body.adminId;
        const eventId = req.body.eventId;
        const reason = req.body.reason;
        if (!adminId || typeof adminId !== "string") {
            return res
                .status(400)
                .json({ error: "adminId is required in request body" });
        }
        if (!eventId || typeof eventId !== "string") {
            return res
                .status(400)
                .json({ error: "eventId is required in request body" });
        }
        const result = await (0, businessLogic_1.moderateEventRemoval)(adminId, eventId, reason);
        return res.status(201).json(result);
    }
    catch (error) {
        return res.status(403).json({
            error: error instanceof Error ? error.message : "Failed to moderate event",
        });
    }
});
const startServer = async () => {
    const mongoUri = buildMongoUri();
    if (!mongoUri) {
        console.error("Missing MongoDB configuration. Set server/secrets.json (preferred) or env vars MONGODB_URI / MONGODB_USER + MONGODB_PASSWORD.");
        process.exit(1);
    }
    try {
        await mongoose_1.default.connect(mongoUri);
        console.log("Connected to MongoDB");
        await (0, store_1.ensureAdminSeed)();
    }
    catch (error) {
        console.error("Failed to connect to MongoDB:", error instanceof Error ? error.message : error);
        process.exit(1);
    }
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
};
void startServer();
__exportStar(require("./types"), exports);
__exportStar(require("./store"), exports);
__exportStar(require("./businessLogic"), exports);
