export type UserRole = "user" | "organizer" | "admin";

export interface User {
  id: string;
  email: string;
  password: string;
  fullName?: string;
  role: UserRole;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
  createdAt: string;
}
