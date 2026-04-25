import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authStore, useAuth } from "@/lib/auth-store";
import { LogIn, User, Lock, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Hopla" },
      { name: "description", content: "Log in to your Hopla account to book rides and view your trip history." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const user = useAuth();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const nextRoute = (type) => (type === "driver" ? "/driver" : "/");

  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto max-w-md px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground">Already signed in</h1>
          <p className="mt-2 text-muted-foreground">Hi {user.name}, ready to continue?</p>
          <Button onClick={() => navigate({ to: nextRoute(user.userType) })} className="mt-6 rounded-2xl">
            {user.userType === "driver" ? "Go to driver bookings" : "Go to booking"}
          </Button>
        </main>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const signedIn = authStore.signIn({ name, password });
      navigate({ to: nextRoute(signedIn.userType) });
    } catch (err) {
      setError(err.message || "Could not log in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-md px-4 py-10">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-(--shadow-card) sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(image:--gradient-warm) text-primary-foreground shadow-(--shadow-soft)">
              <LogIn className="h-6 w-6" />
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Log in to keep things rolling.</p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">Name</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" autoComplete="name" className="h-11 rounded-2xl pl-10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" className="h-11 rounded-2xl pl-10" />
              </div>
            </div>

            <Button type="submit" disabled={submitting} size="lg" className="h-12 w-full rounded-2xl bg-(image:--gradient-warm) text-base font-semibold shadow-(--shadow-soft) hover:opacity-95">
              {submitting ? "Logging in…" : "Log in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to Hopla?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">Create an account</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
