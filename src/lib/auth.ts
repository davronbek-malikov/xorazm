"use client";

import { USERS } from "./seed/users";
import { User } from "./types";

const COOKIE_NAME = "xorazm_session";

export interface Session {
  username: string;
  fullName: string;
  role: User["role"];
}

export function login(username: string, password: string): Session | null {
  const user = USERS.find((u) => u.username === username && u.password === password && u.active);
  if (!user) return null;
  const session: Session = { username: user.username, fullName: user.fullName, role: user.role };
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=86400`;
  return session;
}

export function logout() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

export function getSession(): Session | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1])) as Session;
  } catch {
    return null;
  }
}
