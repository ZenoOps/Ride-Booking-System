import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Car, MapPin, Clock } from "lucide-react";
import { getSession } from "@/lib/storage";

const Index = () => {
  const user = getSession();
  if (user) {
    return <Navigate to={user.type === "rider" ? "/rider" : "/driver"} replace />;
  }

  return (
    <Layout>
      <section className="grid lg:grid-cols-2 gap-12 items-center py-10">
        <div className="space-y-6">
          <span className="inline-block rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-medium">
            Simple. Friendly. Fast.
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Your ride, just a tap away.
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Sign up as a rider to book trips, or as a driver to accept rides. A clean experience for both.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg">
              <Link to="/signup">Get started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login">I already have an account</Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: Car, title: "Book in seconds", text: "Set pickup & drop-off, we handle the rest." },
            { icon: MapPin, title: "Auto-assigned drivers", text: "First available driver picks you up." },
            { icon: Clock, title: "Live trip status", text: "Track started & completed trips." },
            { icon: Car, title: "Ride history", text: "Every trip stored for easy reference." },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl bg-card p-5 shadow-card border border-border/60">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-secondary-foreground mb-3">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
