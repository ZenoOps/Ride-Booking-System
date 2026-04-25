import type { RideStatus } from "@/lib/ride-store";

const STYLES: Record<RideStatus, { label: string; className: string }> = {
  idle: { label: "No ride", className: "bg-muted text-muted-foreground" },
  searching: { label: "Searching driver…", className: "bg-warning/20 text-warning-foreground" },
  assigned: { label: "Driver on the way", className: "bg-accent/40 text-accent-foreground" },
  started: { label: "In progress", className: "bg-primary/15 text-primary" },
  completed: { label: "Completed", className: "bg-success/20 text-success-foreground" },
  cancelled: { label: "Cancelled", className: "bg-destructive/15 text-destructive" },
};

export function StatusBadge({ status }: { status: RideStatus }) {
  const s = STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${s.className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}
