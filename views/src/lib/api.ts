const BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function req<T>(method: string, path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(BASE + path, window.location.origin);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { method });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export interface ApiSession {
  user_id: string;
  username: string;
  user_type: string;
  is_authenticated: boolean;
}

export interface ApiDriver {
  user_id: string;
  name: string;
  available_status: string;
  current_location: string;
  plate_number: string;
  car_model?: string;
}

export interface ApiTrip {
  trip_id: string;
  driver_id: string;
  rider_id: string;
  plate_number: string;
  start_point: string;
  destination: string;
  status: string;
  driver_name?: string;
  car_model?: string;
  rider_name?: string;
}

export const api = {
  signUp: (userType: string, name: string, password: string, plateNumber?: string, carModel?: string) =>
    req<{ user: ApiSession }>("POST", `/${userType}`, {
      name,
      password,
      ...(plateNumber ? { plate_number: plateNumber } : {}),
      ...(carModel ? { car_model: carModel } : {}),
    }),

  signIn: (userType: string, name: string, password: string) =>
    req<{ user: ApiSession }>("POST", `/${userType}/signin`, { name, password }),

  getDriver: (driverId: string) =>
    req<{ user: ApiDriver }>("GET", `/driver/${driverId}`),

  requestRide: (riderId: string, startPoint: string, destination: string) =>
    req<{ trip: ApiTrip }>("POST", "/request-ride", {
      rider_id: riderId,
      start_point: startPoint,
      destination,
    }),

  getTempTrip: (tripId: string) =>
    req<{ trip: ApiTrip }>("GET", `/temp-trip/${tripId}`),

  respondToRide: (tripId: string, action: "accept" | "reject") =>
    req<{ trip: ApiTrip }>("PUT", `/respond-ride/${tripId}`, { action }),

  getTripsByUser: (userId: string, userType: string) =>
    req<{ trips: ApiTrip[] }>("GET", `/trip/user/${userId}`, { user_type: userType }),

  endTrip: (tripId: string) =>
    req<{ trip: ApiTrip }>("PUT", `/trip/${tripId}`),

  getDriverPendingTrips: (driverId: string) =>
    req<{ trips: ApiTrip[] }>("GET", `/driver/${driverId}/pending-trips`),

  updateDriverLocation: (driverId: string, newLocation: string) =>
    req<{ driver: ApiDriver }>("PUT", `/driver/${driverId}/location`, { new_location: newLocation }),

  cancelRide: (tripId: string, riderId: string) =>
    req<{ message: string }>("DELETE", `/cancel-ride/${tripId}`, { rider_id: riderId }),
};
