import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { authStore, useAuth } from "@/lib/auth-store";
import { UserPlus, User, Lock, AlertCircle, Car, MapPin } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Hopla" },
      { name: "description", content: "Create your Hopla account to book rides faster and keep your trip history in one place." },
      { property: "og:title", content: "Sign up — Hopla" },
      { property: "og:description", content: "Create your Hopla account to book rides faster." },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();
  const user = useAuth();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("rider");
  const [plateNumber, setPlateNumber] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const nextRoute = (type) => (type === "driver" ? "/driver" : "/");

  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto max-w-md px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground">You're signed in</h1>
          <p className="mt-2 text-muted-foreground">Welcome back, {user.name}.</p>
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

    if (!name.trim()) return setError("Please enter your name.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (userType === "driver" && plateNumber.trim().length < 4) return setError("Please enter a valid plate number.");

    setSubmitting(true);
    try {
      authStore.signUp({ name, password, userType, plateNumber });
      navigate({ to: "/login" });
    } catch (err) {
      setError(err.message || "Could not create account.");
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
              <UserPlus className="h-6 w-6" />
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Save your trips and book rides faster.</p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field id="name" label="Full name" icon={User}>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" autoComplete="name" className="h-11 rounded-2xl pl-10" />
            </Field>
            <Field id="password" label="Password" icon={Lock}>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" className="h-11 rounded-2xl pl-10" />
            </Field>

            <div className="space-y-2">
              <Label className="text-sm font-medium">User type</Label>
              <RadioGroup value={userType} onValueChange={setUserType} className="grid gap-2 sm:grid-cols-2">
                <UserTypeOption value="rider" label="Rider" icon={MapPin} active={userType === "rider"} />
                <UserTypeOption value="driver" label="Driver" icon={Car} active={userType === "driver"} />
              </RadioGroup>
            </div>

            {userType === "driver" && (
              <Field id="plateNumber" label="Plate number" icon={Car}>
                <Input id="plateNumber" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} placeholder="MH 12 AB 4421" autoComplete="off" className="h-11 rounded-2xl pl-10 uppercase" />
              </Field>
            )}

            <Button type="submit" disabled={submitting} size="lg" className="h-12 w-full rounded-2xl bg-(image:--gradient-warm) text-base font-semibold shadow-(--shadow-soft) hover:opacity-95">
              {submitting ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function UserTypeOption({ value, label, icon: Icon, active }) {
  return (
    <Label className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-all ${active ? "border-primary bg-primary/5 shadow-(--shadow-soft)" : "border-border bg-background hover:border-primary/40"}`}>
      <RadioGroupItem value={value} />
      <Icon className="h-4 w-4 text-primary" />
      <span className="font-semibold text-foreground">{label}</span>
    </Label>
  );
}

function Field({ id, label, icon: Icon, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
        {children}
      </div>
    </div>
  );
}
