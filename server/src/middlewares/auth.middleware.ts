import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getUserById } from "../store";
import { UserRole } from "../types";

export interface AuthUser {
  id: string;
  role: UserRole;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

const getJwtSecret = (): string => process.env.JWT_SECRET ?? "dev-jwt-secret";

export const createAccessToken = (user: AuthUser): string =>
  jwt.sign({ ...user }, getJwtSecret(), { expiresIn: "8h" });

export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }

  try {
    req.user = jwt.verify(token, getJwtSecret()) as AuthUser;
    next();
  } catch {
    res.status(401).json({ error: "Token is invalid or has expired" });
  }
};

export const requireRoles = (allowedRoles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    next();
  };
};

// Helpers used by legacy controller classes; not wired into the Express router.
export const authorize = async (actorId: string, allowedRoles: UserRole[]) => {
  const user = await getUserById(actorId);
  if (!user) throw new Error("User not found");

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Insufficient permissions to perform this action");
  }
  return user;
};

export const isOwnerOrAdmin = async (
  actorId: string,
  resourceOrganizerId: string,
) => {
  const user = await getUserById(actorId);
  if (user?.role === "admin") return true;
  if (actorId === resourceOrganizerId) return true;
  throw new Error("Insufficient permissions");
};
