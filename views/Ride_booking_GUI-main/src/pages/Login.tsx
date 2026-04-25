import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getUsers, setSession } from "@/lib/storage";

const Login = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = getUsers().find(
      (u) => u.name.toLowerCase() === name.trim().toLowerCase() && u.password === password
    );
    if (!user) {
      toast.error("Invalid name or password");
      return;
    }
    setSession(user);
    toast.success(`Welcome back, ${user.name}!`);
    navigate(user.type === "rider" ? "/rider" : "/driver");
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
