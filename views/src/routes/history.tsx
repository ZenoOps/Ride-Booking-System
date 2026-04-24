import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { useRideStore } from "@/lib/ride-store";
import { StatusBadge } from "@/components/StatusBadge";
import { MapPin, Navigation2, Calendar } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Ride history — Hopla" },
      { name: "description", content: "Browse all your past trips with driver, route, fare, and status." },
      { property: "og:title", content: "Ride history — Hopla" },
      { property: "og:description", content: "Browse all your past trips with driver, route, fare, and status." },
    ],
  }),
  component: HistoryPage,
});

function formatDate(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

function HistoryPage() {
  const { history } = useRideStore();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Ride history</h1>
            <p className="mt-1 text-sm text-muted-foreground">{history.length} {history.length === 1 ? "trip" : "trips"} so far</p>
          </div>
          <Button asChild variant="outline" className="rounded-2xl"><Link to="/">Book new</Link></Button>
        </div>

        {history.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center shadow-[var(--shadow-card)]">
            <p className="text-sm text-muted-foreground">No rides yet. Your completed trips will appear here.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {history.map((ride) => (
              <li key={ride.id} className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-soft)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={ride.status} />
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" /> {formatDate(ride.bookedAt)}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-start gap-2 text-foreground"><MapPin className="mt-0.5 h-4 w-4 text-primary" />{ride.pickup}</div>
                      <div className="flex items-start gap-2 text-foreground"><Navigation2 className="mt-0.5 h-4 w-4 text-accent-foreground" />{ride.dropoff}</div>
                    </div>
                    {ride.driver && (
                      <div className="text-xs text-muted-foreground">
                        {ride.driver.avatar} {ride.driver.name} · {ride.driver.car}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">₹{ride.fare}</div>
                    <div className="text-xs text-muted-foreground">{ride.rideType}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
