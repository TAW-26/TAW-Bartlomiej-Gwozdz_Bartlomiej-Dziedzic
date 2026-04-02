import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

// Endpoint testowy
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export * from "./types";
export * from "./store";
export * from "./businessLogic";
