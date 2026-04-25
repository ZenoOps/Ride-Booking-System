import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Booking,
  getBookings,
  getSession,
  getUsers,
  saveBookings,
  uid,
} from "@/lib/storage";
import { Car, MapPin } from "lucide-react";

const Rider = () => {
  const user = getSession();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [notes, setNotes] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);

  const refresh = () => {
    if (!user) return;
    setBookings(
      getBookings()
        .filter((b) => b.riderId === user.id)
        .sort((a, b) => b.createdAt - a.createdAt),
    );
  };

  useEffect(() => {
    refresh();
    const i = setInterval(refresh, 1500);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (user.type !== "rider") return <Navigate to="/driver" replace />;

  const active = bookings.find((b) => b.status !== "completed");

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup.trim() || !dropoff.trim()) {
      toast.error("Pickup and drop-off are required");
      return;
    }
    if (active) {
      toast.error("You already have an active booking");
      return;
    }
    const all = getBookings();
    // Auto-assign first available driver (no active trip)
    const drivers = getUsers().filter((u) => u.type === "driver");
    const busy = new Set(
      all.filter((b) => b.status === "assigned" || b.status === "started").map((b) => b.driverId),
    );
    const driver = drivers.find((d) => !busy.has(d.id));

    const booking: Booking = {
      id: uid(),
      riderId: user.id,
      riderName: user.name,
      pickup: pickup.trim(),
      dropoff: dropoff.trim(),
      notes: notes.trim() || undefined,
      status: driver ? "assigned" : "pending",
      driverId: driver?.id,
      driverName: driver?.name,
      driverPlate: driver?.plateNumber,
      driverCar: driver?.carModel,
      createdAt: Date.now(),
    };
    saveBookings([booking, ...all]);
    toast.success(driver ? `Driver ${driver.name} assigned!` : "Booking created — waiting for a driver");
    setPickup("");
    setDropoff("");
    setNotes("");
    refresh();
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
                  <p className="text-muted-foreground">Waiting for a driver to be assigned…</p>
                )}
              </div>
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
                      <p>{new Date(b.createdAt).toLocaleString()}</p>
                      {b.driverName && (
                        <p>Driver: {b.driverName} · {b.driverCar} · <span className="font-mono">{b.driverPlate}</span></p>
                      )}
                      {b.notes && <p>Notes: {b.notes}</p>}
                    </div>
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
