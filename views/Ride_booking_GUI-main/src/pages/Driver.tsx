import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Booking, getBookings, getSession, saveBookings } from "@/lib/storage";
import { Car, MapPin, User as UserIcon } from "lucide-react";

const Driver = () => {
  const user = getSession();
  const [pending, setPending] = useState<Booking[]>([]);
  const [mine, setMine] = useState<Booking[]>([]);

  const refresh = () => {
    if (!user) return;
    const all = getBookings();
    setPending(all.filter((b) => b.status === "pending").sort((a, b) => a.createdAt - b.createdAt));
    setMine(
      all
        .filter((b) => b.driverId === user.id)
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
  if (user.type !== "driver") return <Navigate to="/rider" replace />;

  const activeMine = mine.find((b) => b.status === "assigned" || b.status === "started");

  const update = (id: string, patch: Partial<Booking>) => {
    const all = getBookings().map((b) => (b.id === id ? { ...b, ...patch } : b));
    saveBookings(all);
    refresh();
  };

  const accept = (b: Booking) => {
    if (activeMine) {
      toast.error("Finish your current trip first");
      return;
    }
    update(b.id, {
      status: "assigned",
      driverId: user.id,
      driverName: user.name,
      driverPlate: user.plateNumber,
      driverCar: user.carModel,
    });
    toast.success(`Booking accepted from ${b.riderName}`);
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
            </div>
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
              {activeMine.status === "assigned" ? (
                <Button variant="hero" className="w-full" onClick={() => update(activeMine.id, { status: "started" })}>
                  Start trip
                </Button>
              ) : (
                <Button variant="success" className="w-full" onClick={() => update(activeMine.id, { status: "completed" })}>
                  Complete trip
                </Button>
              )}
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
                      <Button size="sm" variant="hero" onClick={() => accept(b)} disabled={!!activeMine}>
                        Accept
                      </Button>
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
                    <p className="text-xs text-muted-foreground">{b.riderName} · {new Date(b.createdAt).toLocaleString()}</p>
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
