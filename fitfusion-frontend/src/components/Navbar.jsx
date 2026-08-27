import { Link, useLocation, useNavigate } from "react-router-dom";
import { Activity, Menu, X, LogOut, Dumbbell, Apple, Brain,
         LayoutDashboard, Video, User, History, Users, BookOpen } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/* Decode JWT to read the role claim without a library */
function getTokenRole() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Backend stores role as "TRAINER" or "USER" (no ROLE_ prefix)
    return payload.role || null;
  } catch { return null; }
}

const USER_LINKS = [
  { to: "/dashboard",          label: "Dashboard",  icon: LayoutDashboard },
  { to: "/workouts",           label: "Workouts",   icon: Dumbbell        },
  { to: "/nutrition",          label: "Nutrition",  icon: Apple           },
  { to: "/ai-recommendations", label: "AI Insights",icon: Brain           },
  { to: "/track-video",        label: "Track",      icon: Video           },
  { to: "/history",            label: "History",    icon: History         },
  { to: "/profile",            label: "Profile",    icon: User            },
];

const TRAINER_LINKS = [
  { to: "/trainer",            label: "Trainer Hub",  icon: Users     },
  { to: "/generate-workout",   label: "AI Plan",      icon: Brain     },
  { to: "/track-video",        label: "Video Track",  icon: Video     },
  { to: "/history",            label: "History",      icon: History   },
  { to: "/profile",            label: "Profile",      icon: User      },
];

const AUTH_PATHS = [
  "/dashboard","/workouts","/nutrition","/ai-recommendations",
  "/profile","/track-video","/generate-workout","/history","/trainer"
];

export default function Navbar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [open, setOpen] = useState(false);

  const token     = localStorage.getItem("token");
  const role      = getTokenRole();                // "ROLE_TRAINER" | "ROLE_USER" | null
  const isTrainer = role === "TRAINER";
  const isAuth    = AUTH_PATHS.some(p => location.pathname.startsWith(p));
  const navLinks  = isTrainer ? TRAINER_LINKS : USER_LINKS;

  const handleLogout = () => {
    localStorage.removeItem("token");
    setOpen(false);
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to={token ? (isTrainer ? "/trainer" : "/dashboard") : "/"}
            className="flex items-center gap-2 group"
          >
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-xl gradient-text">FitFusion</span>
              {isTrainer && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full
                                 bg-primary/10 border border-primary/25 text-xs font-bold text-primary">
                  Trainer
                </span>
              )}
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {isAuth && token ? (
              <>
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive(to)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    )}
                  >
                    {label}
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="ml-2 text-muted-foreground hover:text-destructive gap-1.5"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/#features"
                      className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground
                                 hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="hero" size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary/60 transition-colors"
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden py-3 border-t border-border/30 animate-fade-in">
            <div className="flex flex-col gap-1">
              {isAuth && token ? (
                <>
                  {navLinks.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive(to)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                      )}
                    >
                      <Icon className="h-4 w-4" /> {label}
                    </Link>
                  ))}
                  <button
                    onClick={() => { handleLogout(); setOpen(false); }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                               text-muted-foreground hover:text-destructive hover:bg-destructive/10
                               transition-colors mt-1"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)}
                        className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)}>
                    <Button variant="hero" size="sm" className="mx-4 mt-1 w-[calc(100%-2rem)]">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
