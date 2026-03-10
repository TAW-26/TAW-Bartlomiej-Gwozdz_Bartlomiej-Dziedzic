import express, { Request, Response } from "express";
import morgan from "morgan";

const app = express();
const PORT = Number(process.env.PORT) || 3100;

app.use(morgan("dev"));
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.get("/", (_req: Request, res: Response) => {
  res.send("Node.js backend is running");
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
