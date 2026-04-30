import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { setSession, User, UserType } from "@/lib/storage";
import { api } from "@/lib/api";

const Login = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState<UserType>("rider");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) {
      toast.error("Please enter your name and password");
      return;
    }

    try {
      const res = await api.signIn(type, name.trim(), password);
      const user: User = {
        id: res.user.user_id,
        name: res.user.username,
        type,
      };

      if (type === "driver") {
        try {
          const driverRes = await api.getDriver(res.user.user_id);
          user.plateNumber = driverRes.user.plate_number;
          user.carModel = driverRes.user.car_model;
        } catch {
          // non-critical — vehicle info will be missing but login succeeds
        }
      }

      setSession(user);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(type === "rider" ? "/rider" : "/driver");
    } catch {
      toast.error("Invalid name or password");
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="rounded-2xl bg-card p-8 shadow-card border border-border/60">
          <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-6">Log in to continue.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>I am a…</Label>
              <RadioGroup
                value={type}
                onValueChange={(v) => setType(v as UserType)}
                className="grid grid-cols-2 gap-3"
              >
                {(["rider", "driver"] as UserType[]).map((t) => (
                  <Label
                    key={t}
                    htmlFor={`l-${t}`}
                    className={`flex items-center gap-2 rounded-xl border-2 p-3 cursor-pointer capitalize transition-colors ${
                      type === t ? "border-primary bg-secondary" : "border-border"
                    }`}
                  >
                    <RadioGroupItem id={`l-${t}`} value={t} />
                    {t}
                  </Label>
                ))}
              </RadioGroup>
            </div>
            <Button type="submit" variant="hero" className="w-full" size="lg">
              Log in
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-6">
            New here?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
