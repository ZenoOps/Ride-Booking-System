import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { useRideStore, rideStore } from "@/lib/ride-store";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckCircle2, Play, MapPin, Navigation2 } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/trip")({
  head: () => ({
    meta: [
      { title: "Trip status — Hopla" },
      { name: "description", content: "Track your trip in real time. Start the ride, follow progress, and complete it on arrival." },
      { property: "og:title", content: "Trip status — Hopla" },
      { property: "og:description", content: "Start the ride, follow progress, and complete it on arrival." },
    ],
  }),
  component: TripPage,
});

function TripPage() {
  const navigate = useNavigate();
  const { current } = useRideStore();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (current?.status !== "started") {
      setProgress(0);
      return;
    }
    const id = setInterval(() => setProgress((p) => Math.min(100, p + 4)), 600);
    return () => clearInterval(id);
  }, [current?.status]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Trip status</h1>
          {current && <StatusBadge status={current.status} />}
        </div>

        {!current && (
          <Empty body="No active trip. Book a ride first." cta={<Button asChild className="rounded-2xl"><Link to="/">Book a ride</Link></Button>} />
        )}

        {current?.status === "searching" && (
          <Empty body="We're still matching you with a driver…" cta={<Button asChild variant="outline" className="rounded-2xl"><Link to="/driver">Open driver page</Link></Button>} />
        )}

        {current && (current.status === "assigned" || current.status === "started" || current.status === "completed") && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /><span className="text-foreground">{current.pickup}</span></div>
                  <div className="ml-2 h-6 w-px border-l-2 border-dashed border-border" />
                  <div className="flex items-start gap-2"><Navigation2 className="mt-0.5 h-4 w-4 text-accent-foreground" /><span className="text-foreground">{current.dropoff}</span></div>
                </div>
                {current.driver && (
                  <div className="text-right">
                    <div className="text-2xl">{current.driver.avatar}</div>
                    <div className="text-xs font-medium text-muted-foreground">{current.driver.name.split(" ")[0]}</div>
                  </div>
                )}
              </div>

              {/* Progress visualization */}
              <div className="mt-6">
                <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[image:var(--gradient-warm)] transition-all duration-500"
                    style={{ width: `${current.status === "completed" ? 100 : current.status === "started" ? progress : 0}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>Pickup</span>
                  <span>{current.status === "completed" ? "Arrived" : current.status === "started" ? `${progress}%` : "Waiting to start"}</span>
                  <span>Drop-off</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              {current.status === "assigned" && (
                <>
                  <h3 className="text-base font-semibold text-foreground">Ready to roll?</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Tap start once you're in the car.</p>
                  <Button onClick={() => rideStore.startTrip()} className="mt-4 h-12 w-full rounded-2xl bg-[image:var(--gradient-warm)] text-base font-semibold">
                    <Play className="mr-2 h-4 w-4 fill-current" /> Start trip
                  </Button>
                </>
              )}
              {current.status === "started" && (
                <>
                  <h3 className="text-base font-semibold text-foreground">Trip in progress</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Tap complete when you arrive.</p>
                  <Button onClick={() => rideStore.completeTrip()} className="mt-4 h-12 w-full rounded-2xl bg-success text-success-foreground hover:bg-success/90">
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Complete trip
                  </Button>
                </>
              )}
              {current.status === "completed" && (
                <>
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/20">
                      <CheckCircle2 className="h-7 w-7 text-success" />
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-foreground">Trip completed!</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Total fare ₹{current.fare}</p>
                    <div className="mt-5 flex w-full gap-2">
                      <Button asChild variant="outline" className="flex-1 rounded-2xl"><Link to="/history">See history</Link></Button>
                      <Button onClick={() => { rideStore.reset(); navigate({ to: "/" }); }} className="flex-1 rounded-2xl bg-[image:var(--gradient-warm)]">
                        Book another
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Empty({ body, cta }: { body: string; cta: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center shadow-[var(--shadow-card)]">
      <p className="text-sm text-muted-foreground">{body}</p>
      <div className="mt-6 flex justify-center">{cta}</div>
    </div>
  );
}
