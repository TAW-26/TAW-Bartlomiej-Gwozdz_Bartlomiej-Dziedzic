"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3100;
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", message: "Server is running" });
});
app.get("/", (_req, res) => {
    res.send("Node.js backend is running");
});
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
