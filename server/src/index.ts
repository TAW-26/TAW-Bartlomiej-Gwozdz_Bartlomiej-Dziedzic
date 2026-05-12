import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import app from "./app";
import { ensureAdminSeed } from "./store";

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
  const cluster =
    process.env.MONGODB_CLUSTER ?? "cluster0.inw1xa4.mongodb.net";
  const appName = process.env.MONGODB_APP_NAME ?? "Cluster0";

  if (!user || !password) {
    return undefined;
  }

  return `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(
    password,
  )}@${cluster}/?appName=${encodeURIComponent(appName)}`;
};

loadLocalSecrets();

const startServer = async (): Promise<void> => {
  if (process.env.USE_MEMORY_DB === "true") {
    await ensureAdminSeed();
  } else {
    const mongoUri = buildMongoUri();

    if (!mongoUri) {
      console.warn(
        "No MongoDB configuration found. Set USE_MEMORY_DB=true to use the in-memory store.",
      );
    } else {
      try {
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB");
        await ensureAdminSeed();
      } catch (error) {
        console.error(
          "Failed to connect to MongoDB:",
          error instanceof Error ? error.message : error,
        );
      }
    }
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
};

void startServer();

export * from "./types";
export * from "./store";
