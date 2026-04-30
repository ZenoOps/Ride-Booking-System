export type UserType = "rider" | "driver";

export interface User {
  id: string;
  name: string;
  type: UserType;
  plateNumber?: string;
  carModel?: string;
}

export type TripStatus = "pending" | "assigned" | "started" | "completed" | "rejected";

export interface Booking {
  id: string;
  riderId: string;
  riderName: string;
  driverId?: string;
  driverName?: string;
  driverPlate?: string;
  driverCar?: string;
  driverRating?: number | null;
  driverAverageRating?: number | null;
  driverRatingCount?: number;
  pickup: string;
  dropoff: string;
  notes?: string;
  status: TripStatus;
  createdAt: number;
}

const SESSION_KEY = "rh_session";
const PENDING_TRIP_KEY = "rh_pending_trip";

const read = <T,>(k: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v));

export const getSession = (): User | null => read<User | null>(SESSION_KEY, null);
export const setSession = (u: User | null) => {
  if (u) write(SESSION_KEY, u);
  else localStorage.removeItem(SESSION_KEY);
};

export const getPendingTrip = (): Booking | null => read<Booking | null>(PENDING_TRIP_KEY, null);
export const setPendingTrip = (b: Booking | null) => {
  if (b) write(PENDING_TRIP_KEY, b);
  else localStorage.removeItem(PENDING_TRIP_KEY);
};
