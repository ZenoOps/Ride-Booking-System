import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, LogOut } from "lucide-react";
import { getSession, setSession } from "@/lib/storage";

export const Layout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const user = getSession();

  const handleLogout = () => {
    setSession(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-teal-400 text-white shadow-lg shadow-sky-200">
              <Car className="h-5 w-5" />
            </span>
            OBreeze
          </Link>
          {user && (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-muted-foreground">
                Hi, <span className="font-medium text-foreground">{user.name}</span> ({user.type})
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </Button>
            </div>
          )}
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
};
