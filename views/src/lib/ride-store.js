// Simple in-memory ride store with pub/sub for the demo.
// All state lives in module scope; persists across route changes during the session.

import { useSyncExternalStore } from "react";

const DRIVERS = [
  { id: "d1", name: "Aarav Sharma", car: "Toyota Prius", plate: "MH 12 AB 4421", rating: 4.9, eta: 3, avatar: "🧑‍✈️" },
  { id: "d2", name: "Maya Patel", car: "Honda City", plate: "DL 8C XY 7782", rating: 4.8, eta: 5, avatar: "👩‍✈️" },
  { id: "d3", name: "Liam Chen", car: "Hyundai Verna", plate: "KA 03 PQ 1190", rating: 4.95, eta: 2, avatar: "🧔" },
  { id: "d4", name: "Sofia Reyes", car: "Kia Seltos", plate: "TN 22 RS 5567", rating: 4.7, eta: 6, avatar: "👩" },
];

const FARES = { Standard: 180, Comfort: 260, XL: 340 };

let currentRide = null;
let history = [
  {
    id: "r-001",
    pickup: "Indiranagar",
    dropoff: "MG Road",
    rideType: "Standard",
    fare: 180,
    driver: DRIVERS[0],
    status: "completed",
    bookedAt: Date.now() - 86400000 * 2,
    startedAt: Date.now() - 86400000 * 2 + 300000,
    completedAt: Date.now() - 86400000 * 2 + 1500000,
  },
  {
    id: "r-002",
    pickup: "Koramangala",
    dropoff: "Airport",
    rideType: "Comfort",
    fare: 720,
    driver: DRIVERS[2],
    status: "completed",
    bookedAt: Date.now() - 86400000,
    startedAt: Date.now() - 86400000 + 240000,
    completedAt: Date.now() - 86400000 + 3600000,
  },
];

const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

export const rideStore = {
  subscribe(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  getCurrent: () => currentRide,
  getHistory: () => history,
  getDrivers: () => DRIVERS,
  getFare: (type) => FARES[type],

  bookRide(pickup, dropoff, rideType) {
    currentRide = {
      id: `r-${Date.now().toString().slice(-6)}`,
      pickup,
      dropoff,
      rideType,
      fare: FARES[rideType],
      driver: null,
      status: "searching",
      bookedAt: Date.now(),
    };
    emit();
    setTimeout(() => {
      if (currentRide && currentRide.status === "searching") {
        currentRide = {
          ...currentRide,
          driver: DRIVERS[Math.floor(Math.random() * DRIVERS.length)],
          status: "assigned",
        };
        emit();
      }
    }, 1800);
  },

  startTrip() {
    if (currentRide && currentRide.status === "assigned") {
      currentRide = { ...currentRide, status: "started", startedAt: Date.now() };
      emit();
    }
  },

  completeTrip() {
    if (currentRide && currentRide.status === "started") {
      currentRide = { ...currentRide, status: "completed", completedAt: Date.now() };
      history = [currentRide, ...history];
      emit();
    }
  },

  cancel() {
    if (currentRide && (currentRide.status === "searching" || currentRide.status === "assigned")) {
      const cancelled = { ...currentRide, status: "cancelled", completedAt: Date.now() };
      history = [cancelled, ...history];
      currentRide = null;
      emit();
    }
  },

  reset() {
    currentRide = null;
    emit();
  },
};

export function useRideStore() {
  const current = useSyncExternalStore(
    rideStore.subscribe,
    () => rideStore.getCurrent(),
    () => rideStore.getCurrent()
  );
  const hist = useSyncExternalStore(
    rideStore.subscribe,
    () => rideStore.getHistory(),
    () => rideStore.getHistory()
  );
  return { current, history: hist };
}
