// Frontend-only mock auth store. Persists users + session in localStorage.
import { useSyncExternalStore } from "react";

const USERS_KEY = "hopla.users";
const SESSION_KEY = "hopla.session";

const isBrowser = typeof window !== "undefined";

const readUsers = () => {
  if (!isBrowser) return [];
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
};
const writeUsers = (users) => {
  if (isBrowser) localStorage.setItem(USERS_KEY, JSON.stringify(users));
};
const readSession = () => {
  if (!isBrowser) return null;
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
};
const writeSession = (s) => {
  if (!isBrowser) return;
  if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else localStorage.removeItem(SESSION_KEY);
};

let session = readSession();
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

export const authStore = {
  subscribe(cb) { listeners.add(cb); return () => listeners.delete(cb); },
  getUser: () => session,

  signUp({ name, password, userType, plateNumber }) {
    const users = readUsers();
    const normalized = name.trim().toLowerCase();
    if (users.find((u) => u.nameKey === normalized)) {
      throw new Error("An account with this name already exists.");
    }
    const user = {
      id: `u-${Date.now().toString(36)}`,
      name: name.trim(),
      nameKey: normalized,
      password,
      userType,
      plateNumber: userType === "driver" ? plateNumber.trim().toUpperCase() : "",
    };
    users.push(user);
    writeUsers(users);
    const { password: _pw, ...safe } = user;
    return safe;
  },

  signIn({ name, password }) {
    const users = readUsers();
    const normalized = name.trim().toLowerCase();
    const user = users.find((u) => (u.nameKey || u.name?.trim().toLowerCase()) === normalized && u.password === password);
    if (!user) throw new Error("Invalid name or password.");
    const { password: _pw, ...safe } = user;
    session = safe;
    writeSession(session);
    emit();
    return safe;
  },

  signOut() {
    session = null;
    writeSession(null);
    emit();
  },
};

export function useAuth() {
  return useSyncExternalStore(
    authStore.subscribe,
    () => authStore.getUser(),
    () => null
  );
}
