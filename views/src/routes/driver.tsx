import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { useRideStore, rideStore } from "@/lib/ride-store";
import { StatusBadge } from "@/components/StatusBadge";
import { Star, Phone, MessageCircle, Clock, Car } from "lucide-react";

export const Route = createFileRoute("/driver")({
  head: () => ({
    meta: [
      { title: "Driver assignment — Hopla" },
      { name: "description", content: "See your assigned driver, vehicle details, ETA and rating before your trip starts." },
      { property: "og:title", content: "Driver assignment — Hopla" },
      { property: "og:description", content: "See your assigned driver, vehicle details, ETA and rating." },
    ],
  }),
  component: DriverPage,
});

function DriverPage() {
  const { current } = useRideStore();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Driver assignment</h1>
          {current && <StatusBadge status={current.status} />}
        </div>

        {!current && (
          <EmptyState
            title="No ride in progress"
            body="Book a ride first to get matched with a nearby driver."
            cta={<Button asChild className="rounded-2xl"><Link to="/">Book a ride</Link></Button>}
          />
        )}

        {current?.status === "searching" && (
          <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
            <div className="mx-auto mb-4 h-14 w-14 animate-pulse rounded-full bg-[image:var(--gradient-warm)]" />
            <h2 className="text-lg font-semibold text-foreground">Looking for nearby drivers…</h2>
            <p className="mt-2 text-sm text-muted-foreground">This usually takes just a few seconds.</p>
            <Button variant="ghost" className="mt-6 rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => rideStore.cancel()}>
              Cancel request
            </Button>
          </div>
        )}

        {current && current.driver && (current.status === "assigned" || current.status === "started") && (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
              <div className="bg-[image:var(--gradient-cool)] p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card text-3xl shadow-[var(--shadow-card)]">
                    {current.driver.avatar}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-accent-foreground">{current.driver.name}</h2>
                    <div className="mt-1 flex items-center gap-1 text-sm text-accent-foreground/90">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-semibold">{current.driver.rating}</span>
                      <span className="opacity-70">· verified driver</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-3">
                <InfoTile icon={<Car className="h-4 w-4" />} label="Vehicle" value={current.driver.car} />
                <InfoTile label="Plate" value={current.driver.plate} />
                <InfoTile icon={<Clock className="h-4 w-4" />} label="ETA" value={`${current.driver.eta} min`} />
              </div>

              <div className="flex gap-2 border-t border-border p-4">
                <Button variant="outline" className="flex-1 rounded-2xl"><Phone className="mr-2 h-4 w-4" /> Call</Button>
                <Button variant="outline" className="flex-1 rounded-2xl"><MessageCircle className="mr-2 h-4 w-4" /> Message</Button>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <h3 className="text-sm font-semibold text-muted-foreground">Trip</h3>
              <div className="mt-3 space-y-2 text-sm text-foreground">
                <div>📍 {current.pickup}</div>
                <div>🏁 {current.dropoff}</div>
                <div className="pt-2 text-base font-bold text-primary">₹{current.fare} · {current.rideType}</div>
              </div>
              <Button asChild className="mt-4 w-full rounded-2xl bg-[image:var(--gradient-warm)]">
                <Link to="/trip">Go to trip status</Link>
              </Button>
            </div>
          </div>
        )}

        {current?.status === "completed" && (
          <EmptyState title="Trip completed" body="View it in your ride history." cta={<Button asChild className="rounded-2xl"><Link to="/history">View history</Link></Button>} />
        )}
      </main>
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function EmptyState({ title, body, cta }: { title: string; body: string; cta: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center shadow-[var(--shadow-card)]">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <div className="mt-6 flex justify-center">{cta}</div>
    </div>
  );
}
