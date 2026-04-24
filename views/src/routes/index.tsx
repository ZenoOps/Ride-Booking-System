import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { rideStore, useRideStore } from "@/lib/ride-store";
import { StatusBadge } from "@/components/StatusBadge";
import { MapPin, Navigation2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hopla — Book a friendly ride in seconds" },
      { name: "description", content: "Book a ride with Hopla. Pick a car class, get matched with a nearby driver, and track your trip end to end." },
      { property: "og:title", content: "Hopla — Book a friendly ride" },
      { property: "og:description", content: "Pick a car class, get matched with a driver, and track your trip end to end." },
    ],
  }),
  component: BookPage,
});

const RIDE_TYPES = [
  { type: "Standard" as const, desc: "Affordable everyday rides", emoji: "🚗" },
  { type: "Comfort" as const, desc: "Newer cars, more space", emoji: "🚙" },
  { type: "XL" as const, desc: "Up to 6 passengers", emoji: "🚐" },
];

function BookPage() {
  const navigate = useNavigate();
  const { current } = useRideStore();
  const [pickup, setPickup] = useState("Indiranagar 100ft Road");
  const [dropoff, setDropoff] = useState("Cubbon Park");
  const [rideType, setRideType] = useState<"Standard" | "Comfort" | "XL">("Standard");

  const handleBook = () => {
    if (!pickup.trim() || !dropoff.trim()) return;
    rideStore.bookRide(pickup, dropoff, rideType);
    navigate({ to: "/driver" });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <section className="mb-8 flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent/30 px-3 py-1 text-xs font-medium text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" /> Friendly rides, fair prices
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Where to today?
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Tell us where you're going, pick the comfort level you want, and we'll match you with a nearby driver.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-5">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] md:col-span-3">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pickup" className="text-sm font-medium">Pickup</Label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                  <Input id="pickup" value={pickup} onChange={(e) => setPickup(e.target.value)} className="h-12 rounded-2xl pl-10" placeholder="Enter pickup location" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dropoff" className="text-sm font-medium">Drop-off</Label>
                <div className="relative">
                  <Navigation2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent-foreground" />
                  <Input id="dropoff" value={dropoff} onChange={(e) => setDropoff(e.target.value)} className="h-12 rounded-2xl pl-10" placeholder="Where to?" />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-sm font-medium">Ride type</Label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {RIDE_TYPES.map((r) => {
                    const active = rideType === r.type;
                    return (
                      <button
                        key={r.type}
                        type="button"
                        onClick={() => setRideType(r.type)}
                        className={`flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition-all ${
                          active ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)]" : "border-border bg-background hover:border-primary/40"
                        }`}
                      >
                        <span className="text-2xl">{r.emoji}</span>
                        <span className="text-sm font-semibold text-foreground">{r.type}</span>
                        <span className="text-xs text-muted-foreground">{r.desc}</span>
                        <span className="mt-1 text-sm font-bold text-primary">₹{rideStore.getFare(r.type)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button onClick={handleBook} size="lg" className="h-12 w-full rounded-2xl bg-[image:var(--gradient-warm)] text-base font-semibold shadow-[var(--shadow-soft)] hover:opacity-95">
                Book ride · ₹{rideStore.getFare(rideType)}
              </Button>
            </div>
          </div>

          <aside className="rounded-3xl border border-border bg-[image:var(--gradient-cool)] p-6 shadow-[var(--shadow-card)] md:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-accent-foreground">Current ride</h2>
              {current && <StatusBadge status={current.status} />}
            </div>
            {current ? (
              <div className="mt-4 space-y-2 text-sm text-accent-foreground/90">
                <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4" /><span>{current.pickup}</span></div>
                <div className="flex items-start gap-2"><Navigation2 className="mt-0.5 h-4 w-4" /><span>{current.dropoff}</span></div>
                <div className="pt-2 text-xs opacity-80">{current.rideType} · ₹{current.fare}</div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-accent-foreground/80">No active ride. Book one to get started!</p>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
