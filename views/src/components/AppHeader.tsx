import { Link } from "@tanstack/react-router";
import { Car, MapPin, Activity, History } from "lucide-react";

const navItems = [
  { to: "/" as const, label: "Book", icon: MapPin },
  { to: "/driver" as const, label: "Driver", icon: Car },
  { to: "/trip" as const, label: "Trip", icon: Activity },
  { to: "/history" as const, label: "History", icon: History },
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[image:var(--gradient-warm)] text-primary-foreground shadow-[var(--shadow-soft)]">
            <Car className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">Hopla</span>
        </Link>
        <nav className="flex items-center gap-1 rounded-full bg-muted p-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              activeProps={{ className: "bg-card text-foreground shadow-[var(--shadow-card)]" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
