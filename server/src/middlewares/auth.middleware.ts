import { NextFunction, Request, Response } from "express";
import { getUserById } from "../store";
import { UserRole } from "../types";

const jwt = require("jsonwebtoken") as {
  sign: (
    payload: Record<string, unknown>,
    secret: string,
    options?: Record<string, unknown>,
  ) => string;
  verify: (
    token: string,
    secret: string,
  ) => { id: string; role: UserRole; email: string };
};

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
    res
      .status(401)
      .json({ error: "Brak lub niepoprawny naglowek Authorization" });
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    res.status(401).json({ error: "Brak tokena" });
    return;
  }

  try {
    req.user = jwt.verify(token, getJwtSecret());
    next();
  } catch {
    res.status(401).json({ error: "Token jest niewazny lub wygasl" });
  }
};

export const requireRoles = (allowedRoles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      res.status(401).json({ error: "Uzytkownik niezalogowany" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "Brak uprawnien" });
      return;
    }

    next();
  };
};

// Legacy helpers kept for compatibility with controller classes.
export const authorize = async (actorId: string, allowedRoles: UserRole[]) => {
  const user = await getUserById(actorId);
  if (!user) throw new Error("Uzytkownik nie istnieje");

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Brak uprawnien do wykonania tej akcji");
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
  throw new Error("Brak uprawnien");
};
