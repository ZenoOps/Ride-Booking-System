export type UserType = "rider" | "driver";

export interface User {
  id: string;
  name: string;
  password: string;
  type: UserType;
  plateNumber?: string;
  carModel?: string;
}

export type TripStatus = "pending" | "assigned" | "started" | "completed";

export interface Booking {
  id: string;
  riderId: string;
  riderName: string;
  driverId?: string;
  driverName?: string;
  driverPlate?: string;
  driverCar?: string;
  pickup: string;
  dropoff: string;
  notes?: string;
  status: TripStatus;
  createdAt: number;
}

const USERS_KEY = "rh_users";
const BOOKINGS_KEY = "rh_bookings";
const SESSION_KEY = "rh_session";

const read = <T,>(k: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v));

export const getUsers = () => read<User[]>(USERS_KEY, []);
export const saveUsers = (u: User[]) => write(USERS_KEY, u);

export const getBookings = () => read<Booking[]>(BOOKINGS_KEY, []);
export const saveBookings = (b: Booking[]) => write(BOOKINGS_KEY, b);

export const getSession = (): User | null => read<User | null>(SESSION_KEY, null);
export const setSession = (u: User | null) => {
  if (u) write(SESSION_KEY, u);
  else localStorage.removeItem(SESSION_KEY);
};

export const uid = () => Math.random().toString(36).slice(2, 10);

export const refreshSession = (): User | null => {
  const s = getSession();
  if (!s) return null;
  const fresh = getUsers().find((u) => u.id === s.id) || null;
  if (fresh) setSession(fresh);
  return fresh;
};
