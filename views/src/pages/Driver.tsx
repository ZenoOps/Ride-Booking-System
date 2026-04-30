import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Booking, getSession } from "@/lib/storage";
import { api, ApiTrip } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, MapPin, Star, User as UserIcon } from "lucide-react";

const ratingLabel = (count = 0) => `${count} ${count === 1 ? "rating" : "ratings"}`;

const Driver = () => {
  const user = getSession();
  const [pending, setPending] = useState<Booking[]>([]);
  const [mine, setMine] = useState<Booking[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [newLocation, setNewLocation] = useState<string>("");
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState<number>(0);

  const mapConfirmed = (t: ApiTrip): Booking => ({
    id: t.trip_id,
    riderId: t.rider_id,
    riderName: t.rider_name ?? "",
    driverId: t.driver_id,
    driverName: user?.name,
    driverPlate: t.plate_number,
    driverCar: t.car_model ?? user?.carModel,
    driverRating: t.driver_rating,
    driverAverageRating: t.driver_average_rating,
    driverRatingCount: t.driver_rating_count,
    pickup: t.start_point,
    dropoff: t.destination,
    status: t.status === "Completed" ? "completed" : "assigned",
    createdAt: 0,
  });

  const refresh = async () => {
    if (!user) return;
    try {
      const [pendingRes, historyRes] = await Promise.all([
        api.getDriverPendingTrips(user.id),
        api.getTripsByUser(user.id, "driver"),
      ]);

      setPending(
        pendingRes.trips.map((t) => ({
          id: t.trip_id,
          riderId: t.rider_id,
          riderName: t.rider_name ?? "",
          driverId: t.driver_id,
          pickup: t.start_point,
          dropoff: t.destination,
          status: "pending" as const,
          createdAt: 0,
        })),
      );

      setMine(historyRes.trips.map(mapConfirmed).reverse());
      const rating = historyRes.trips.find((t) => t.driver_average_rating !== undefined);
      if (rating) {
        setAverageRating(rating.driver_average_rating ?? null);
        setRatingCount(rating.driver_rating_count ?? 0);
      }
    } catch {
      // network error — keep previous state
    }
  };

  useEffect(() => {
    if (!user) return;
    api.getDriver(user.id).then((res) => {
      setCurrentLocation(res.user.current_location);
      setNewLocation(res.user.current_location);
      setAverageRating(res.user.average_rating ?? null);
      setRatingCount(res.user.rating_count ?? 0);
    }).catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeMine = mine.find((b) => b.status === "assigned");

  useEffect(() => {
    refresh();
    if (activeMine) return;
    const i = setInterval(refresh, 15000);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!activeMine]);

  const handleLocationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.trim() || !user) return;
    try {
      const res = await api.updateDriverLocation(user.id, newLocation.trim());
      setCurrentLocation(res.driver.current_location);
      setNewLocation(res.driver.current_location);
      toast.success("Location updated!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update location");
    }
  };

  if (!user) return <Navigate to="/login" replace />;
  if (user.type !== "driver") return <Navigate to="/rider" replace />;

  const completeTrip = async (id: string) => {
    try {
      await api.endTrip(id);
      toast.success("Trip completed!");
      refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to complete trip");
    }
  };

  const accept = async (b: Booking) => {
    if (activeMine) {
      toast.error("Finish your current trip first");
      return;
    }
    try {
      await api.respondToRide(b.id, "accept");
      toast.success(`Booking accepted from ${b.riderName || "driver"}`);
      refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to accept ride");
    }
  };

  const reject = async (b: Booking) => {
    try {
      await api.respondToRide(b.id, "reject");
      toast.success(`Booking rejected from ${b.riderName || "driver"}`);
      refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to reject ride");
    }
  };

  return (
    <Layout>
      <div className="grid lg:grid-cols-5 gap-6">
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-card p-6 shadow-card border border-border/60">
            <h2 className="text-xl font-bold mb-1">Your vehicle</h2>
            <p className="text-sm text-muted-foreground mb-4">Used for every trip you accept.</p>
            <div className="rounded-xl bg-secondary/60 p-4 space-y-1 text-sm">
              <p className="flex items-center gap-2"><Car className="h-4 w-4 text-primary" /> {user.carModel}</p>
              <p className="font-mono text-muted-foreground">{user.plateNumber}</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-warning/10 px-3 py-1.5 text-warning">
                <Star className="h-4 w-4 fill-warning" />
                {averageRating == null ? (
                  <span className="font-medium">No ratings yet</span>
                ) : (
                  <>
                    <span className="font-semibold">{averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">out of 5</span>
                    <span className="text-muted-foreground">· {ratingLabel(ratingCount)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-card border border-border/60">
            <h2 className="text-xl font-bold mb-1">Current location</h2>
            <p className="text-sm text-muted-foreground mb-4">Riders at this location will be matched to you.</p>
            <form onSubmit={handleLocationUpdate} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder={currentLocation || "e.g. Bang Sue"}
                />
              </div>
              <Button type="submit" variant="outline" className="w-full" size="sm">
                Update location
              </Button>
            </form>
          </div>

          {activeMine && (
            <div className="rounded-2xl bg-card p-6 shadow-card border border-border/60">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Current trip</h3>
                <StatusBadge status={activeMine.status} />
              </div>
              <div className="space-y-2 text-sm mb-4">
                <p className="flex items-center gap-2"><UserIcon className="h-4 w-4 text-primary" /> {activeMine.riderName}</p>
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {activeMine.pickup} → {activeMine.dropoff}</p>
                {activeMine.notes && <p className="text-muted-foreground">Notes: {activeMine.notes}</p>}
              </div>
              <Button variant="success" className="w-full" onClick={() => completeTrip(activeMine.id)}>
                Complete trip
              </Button>
            </div>
          )}
        </section>

        <section className="lg:col-span-3 space-y-6">
          <div className="rounded-2xl bg-card p-6 shadow-card border border-border/60">
            <h2 className="text-xl font-bold mb-4">Pending bookings</h2>
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending bookings right now.</p>
            ) : (
              <ul className="space-y-3">
                {pending.map((b) => (
                  <li key={b.id} className="rounded-xl border border-border/60 p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-medium">{b.pickup} → {b.dropoff}</p>
                        <p className="text-xs text-muted-foreground">Rider: {b.riderName}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="hero" onClick={() => accept(b)} disabled={!!activeMine}>
                          Accept
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => reject(b)}>
                          Reject
                        </Button>
                      </div>
                    </div>
                    {b.notes && <p className="text-xs text-muted-foreground">Notes: {b.notes}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-card border border-border/60">
            <h2 className="text-xl font-bold mb-4">Trip history</h2>
            {mine.length === 0 ? (
              <p className="text-sm text-muted-foreground">No trips yet.</p>
            ) : (
              <ul className="space-y-3">
                {mine.map((b) => (
                  <li key={b.id} className="rounded-xl border border-border/60 p-4">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className="font-medium">{b.pickup} → {b.dropoff}</p>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">Rider : {b.riderName}</p>
                    {b.driverRating ? (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        Rider rating: {b.driverRating} out of 5
                      </p>
                    ) : (
                      b.status === "completed" && <p className="mt-1 text-xs text-muted-foreground">No rating yet</p>
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

export default Driver;
