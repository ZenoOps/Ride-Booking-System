import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { getUsers, saveUsers, setSession, uid, UserType } from "@/lib/storage";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState<UserType>("rider");
  const [plateNumber, setPlateNumber] = useState("");
  const [carModel, setCarModel] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (type === "driver" && (!plateNumber.trim() || !carModel.trim())) {
      toast.error("Drivers must provide plate number and car model");
      return;
    }
    const users = getUsers();
    if (users.some((u) => u.name.toLowerCase() === name.trim().toLowerCase())) {
      toast.error("That name is already taken");
      return;
    }
    const user = {
      id: uid(),
      name: name.trim(),
      password,
      type,
      ...(type === "driver" ? { plateNumber: plateNumber.trim(), carModel: carModel.trim() } : {}),
    };
    saveUsers([...users, user]);
    setSession(user);
    toast.success(`Welcome, ${user.name}!`);
    navigate(type === "rider" ? "/rider" : "/driver");
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="rounded-2xl bg-card p-8 shadow-card border border-border/60">
          <h1 className="text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-sm text-muted-foreground mb-6">Join as a rider or a driver.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
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
                    htmlFor={`r-${t}`}
                    className={`flex items-center gap-2 rounded-xl border-2 p-3 cursor-pointer capitalize transition-colors ${
                      type === t ? "border-primary bg-secondary" : "border-border"
                    }`}
                  >
                    <RadioGroupItem id={`r-${t}`} value={t} />
                    {t}
                  </Label>
                ))}
              </RadioGroup>
            </div>

            {type === "driver" && (
              <div className="grid gap-4 rounded-xl bg-secondary/60 p-4">
                <div className="space-y-2">
                  <Label htmlFor="plate">Plate number</Label>
                  <Input id="plate" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} placeholder="ABC-1234" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="car">Car model</Label>
                  <Input id="car" value={carModel} onChange={(e) => setCarModel(e.target.value)} placeholder="Toyota Prius 2021" />
                </div>
              </div>
            )}

            <Button type="submit" variant="hero" className="w-full" size="lg">
              Sign up
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Signup;
