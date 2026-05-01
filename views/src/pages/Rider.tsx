import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Booking, getSession, getPendingTrip, setPendingTrip } from "@/lib/storage";
import { api, ApiTrip } from "@/lib/api";
import { Car, MapPin, Star } from "lucide-react";

const mapApiTrip = (t: ApiTrip, riderName: string): Booking => ({
  id: t.trip_id,
  riderId: t.rider_id,
  riderName,
  driverId: t.driver_id,
  driverName: t.driver_name,
  driverPlate: t.plate_number,
  driverCar: t.car_model,
  driverRating: t.driver_rating,
  driverAverageRating: t.driver_average_rating,
  driverRatingCount: t.driver_rating_count,
  pickup: t.start_point,
  dropoff: t.destination,
  status: t.status === "Completed" ? "completed" : "assigned",
  createdAt: 0,
});

const ratingLabel = (count = 0) => `${count} ${count === 1 ? "rating" : "ratings"}`;

const Rider = () => {
  const user = getSession();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [notes, setNotes] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [ratingDrafts, setRatingDrafts] = useState<Record<string, number>>({});
  const [pendingTrip, setPendingTripState] = useState<Booking | null>(() => {
    const stored = getPendingTrip();
    if (stored && stored.riderId !== user?.id) {
      setPendingTrip(null);
      return null;
    }
    return stored;
  });

  const refresh = async () => {
    if (!user) return;
    try {
      const { trips } = await api.getTripsByUser(user.id, "rider");
      const mapped = trips.map((t) => mapApiTrip(t, user.name));
      setBookings(mapped.reverse());

      // If the pending temp trip was accepted, it now appears in confirmed trips
      const current = getPendingTrip();
      if (current && mapped.find((b) => b.id === current.id)) {
        setPendingTrip(null);
        setPendingTripState(null);
      } else if (current) {
        // Check temp trip status for rejection
        try {
          const { trip } = await api.getTempTrip(current.id);
          if (trip && trip.status === "rejected") {
            toast.error("Driver rejected the ride request.");
            setPendingTrip(null);
            setPendingTripState(null);
          }
        } catch {
          // Ignore 404 or errors
        }
      }
    } catch {
      // network error — keep previous state
    }
  };

  const active = pendingTrip ?? bookings.find((b) => b.status !== "completed");

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (active?.status !== "pending") return;
    const i = setInterval(refresh, 1500);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id, active?.status]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.type !== "rider") return <Navigate to="/driver" replace />;

  const handleCancel = async () => {
    if (!pendingTrip || !user) return;
    try {
      await api.cancelRide(pendingTrip.id, user.id);
      setPendingTrip(null);
      setPendingTripState(null);
      toast.success("Booking cancelled.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Cancel failed");
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup.trim() || !dropoff.trim()) {
      toast.error("Pickup and drop-off are required");
      return;
    }
    if (active) {
      toast.error("You already have an active booking");
      return;
    }
    try {
      const { trip } = await api.requestRide(user.id, pickup.trim(), dropoff.trim());
      const pending: Booking = {
        id: trip.trip_id,
        riderId: trip.rider_id,
        riderName: user.name,
        driverId: trip.driver_id,
        pickup: trip.start_point,
        dropoff: trip.destination,
        status: "pending",
        createdAt: Date.now(),
      };
      setPendingTrip(pending);
      setPendingTripState(pending);
      toast.success("Ride requested! Waiting for driver to accept…");
      setPickup("");
      setDropoff("");
      setNotes("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Booking failed");
    }
  };

  const handleRateDriver = async (booking: Booking) => {
    const rating = ratingDrafts[booking.id];
    if (!rating || rating < 1 || rating > 5) {
      toast.error("Choose a rating from 1 to 5.");
      return;
    }
    try {
      await api.rateDriver(booking.id, user.id, rating);
      toast.success("Driver rating submitted.");
      setRatingDrafts((current) => {
        const next = { ...current };
        delete next[booking.id];
        return next;
      });
      refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Rating failed");
    }
  };

  return (
    <Layout>
      <div className="grid lg:grid-cols-5 gap-6">
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-card p-6 shadow-card border border-border/60">
            <h2 className="text-xl font-bold mb-1">Book a ride</h2>
            <p className="text-sm text-muted-foreground mb-4">A driver will be assigned automatically.</p>
            <form onSubmit={handleBook} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pickup">Pickup location</Label>
                <Input id="pickup" value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="123 Main St" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dropoff">Drop-off location</Label>
                <Input id="dropoff" value={dropoff} onChange={(e) => setDropoff(e.target.value)} placeholder="Airport terminal 2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Anything the driver should know" />
              </div>
              <Button type="submit" variant="hero" className="w-full" size="lg" disabled={!!active}>
                {active ? "You have an active booking" : "Book ride"}
              </Button>
            </form>
          </div>

          {active && (
            <div className="rounded-2xl bg-card p-6 shadow-card border border-border/60">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Current trip</h3>
                <StatusBadge status={active.status} />
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {active.pickup} → {active.dropoff}</p>
                {active.driverName ? (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Car className="h-4 w-4 text-primary" />
                    {active.driverName} · {active.driverCar} · <span className="font-mono">{active.driverPlate}</span>
                  </p>
                ) : (
                  <p className="text-muted-foreground">Waiting for driver to accept...</p>
                )}
              </div>
              {active.status === "pending" && (
                <Button variant="destructive" size="sm" className="mt-4 w-full" onClick={handleCancel}>
                  Cancel booking
                </Button>
              )}
            </div>
          )}
        </section>

        <section className="lg:col-span-3">
          <div className="rounded-2xl bg-card p-6 shadow-card border border-border/60">
            <h2 className="text-xl font-bold mb-4">Ride history</h2>
            {bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No rides yet. Book your first one!</p>
            ) : (
              <ul className="space-y-3">
                {bookings.map((b) => (
                  <li key={b.id} className="rounded-xl border border-border/60 p-4 hover:bg-secondary/40 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="font-medium">{b.pickup} → {b.dropoff}</p>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>{b.createdAt ? new Date(b.createdAt).toLocaleString() : ""}</p>
                      {b.driverName && (
                        <p>Driver: {b.driverName} · {b.driverCar} · <span className="font-mono">{b.driverPlate}</span></p>
                      )}
                      {b.driverAverageRating != null && (
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-warning/10 px-3 py-1.5 text-warning">
                          <Star className="h-4 w-4 fill-warning" />
                          <span className="font-semibold">{b.driverAverageRating.toFixed(1)}</span>
                          <span className="text-muted-foreground">out of 5</span>
                          <span className="text-muted-foreground">· {ratingLabel(b.driverRatingCount ?? 0)}</span>
                        </div>
                      )}
                      {b.driverRating && <p>Your rating: {b.driverRating} out of 5</p>}
                      {b.notes && <p>Notes: {b.notes}</p>}
                    </div>
                    {b.status === "completed" && !b.driverRating && (
                      <div className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              className="rounded-md p-1 text-warning transition-colors hover:bg-warning/10"
                              aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
                              onClick={() => setRatingDrafts((current) => ({ ...current, [b.id]: value }))}
                            >
                              <Star
                                className={`h-5 w-5 ${
                                  value <= (ratingDrafts[b.id] ?? 0) ? "fill-warning" : "fill-transparent"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleRateDriver(b)}>
                          Submit rating
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Rider;
