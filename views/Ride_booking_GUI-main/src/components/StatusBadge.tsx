import { TripStatus } from "@/lib/storage";

const styles: Record<TripStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  assigned: "bg-secondary text-secondary-foreground",
  started: "bg-warning/15 text-warning",
  completed: "bg-success/15 text-success",
};

const labels: Record<TripStatus, string> = {
  pending: "Pending",
  assigned: "Driver assigned",
  started: "Started",
  completed: "Completed",
};

export const StatusBadge = ({ status }: { status: TripStatus }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
    {labels[status]}
  </span>
);
