import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import Navbar from "@/components/Navbar";
import {
  Dumbbell, Apple, Brain, TrendingUp, Target,
  Flame, Clock, Calendar, ArrowRight, Video, History
} from "lucide-react";
import api from "@/services/api";

const EXERCISE_ICONS = {
  squat: "🦵", pushup: "💪", bicep_curl: "🏋️",
  lunge: "🚶", shoulder_press: "🙌", plank: "🧘",
};

const PROG_COLORS = {
  INCREASE: "text-green-400",
  MAINTAIN: "text-primary",
  DECREASE: "text-yellow-400",
};
const PROG_BG = {
  INCREASE: "border-green-500/30 bg-green-500/5",
  MAINTAIN: "border-primary/30 bg-primary/5",
  DECREASE: "border-yellow-500/30 bg-yellow-500/5",
};
const PROG_ICONS = { INCREASE: "📈", MAINTAIN: "⚖️", DECREASE: "📉" };

export default function Dashboard() {
  const [user,   setUser]   = useState(null);
  const [count,  setCount]  = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get("/api/users/me").then(r => setUser(r.data)).catch(() => {}),
      api.get("/api/sessions/count").then(r => setCount(r.data.count)).catch(() => setCount(0)),
      api.get("/api/sessions/recent?limit=5").then(r => setRecent(r.data)).catch(() => setRecent([])),
    ]).finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return (
    <div className="min-h-screen hero-gradient">
      <Navbar /><PageSpinner message="Loading dashboard…" />
    </div>
  );

  const firstName  = user?.name?.split(" ")[0] || "Athlete";
  const hour       = new Date().getHours();
  const greeting   = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const fmt        = iso => iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";
  const scoreColor = s => s >= 85 ? "text-green-400" : s >= 65 ? "text-primary" : "text-yellow-400";

  /* Latest ML recommendation to show in banner */
  const mlSession = recent.find(s => s.progressionAction) || null;

  const quickStats = [
    { label: "Sessions Done", value: count ?? 0,                                      icon: Flame,    color: "text-accent"  },
    { label: "Profile",       value: user?.hasProfile ? "Active" : "Setup",           icon: Target,   color: "text-primary" },
    { label: "Last Session",  value: recent.length ? fmt(recent[0].sessionDate) : "—",icon: Clock,    color: "text-primary" },
    { label: "This Week",     value: recent.filter(s => {
        if (!s.sessionDate) return false;
        return (Date.now() - new Date(s.sessionDate).getTime()) < 7 * 24 * 60 * 60 * 1000;
      }).length,                                                                        icon: Calendar, color: "text-accent"  },
  ];

  const dashCards = [
    { title: "My Workouts",   value: String(count ?? 0),              description: "Sessions tracked",     icon: Dumbbell, color: "text-primary", bg: "bg-primary/10", link: "/workouts"           },
    { title: "Nutrition",     value: user?.hasProfile ? "Active" : "—", description: "Meal plan & macros", icon: Apple,    color: "text-accent",  bg: "bg-accent/10",  link: "/nutrition"          },
    { title: "AI Insights",   value: user?.hasProfile ? "Ready"  : "—", description: "ML recommendations", icon: Brain,    color: "text-primary", bg: "bg-primary/10", link: "/ai-recommendations" },
  ];

  return (
    <div className="min-h-screen hero-gradient">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">

          {/* Welcome header */}
          <div className="mb-8 animate-fade-in flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                {greeting}, <span className="gradient-text">{firstName}</span>
              </h1>
              <p className="text-muted-foreground">
                {user?.hasProfile
                  ? "Track workouts, hit your targets, and let ML guide your progression."
                  : "Complete your profile to unlock personalised plans and AI recommendations."}
              </p>
              {!user?.hasProfile && (
                <Link to="/profile" className="inline-block mt-3">
                  <Button variant="hero" size="sm">Set Up Profile →</Button>
                </Link>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link to="/track-video">
                <Button variant="hero" size="sm" className="gap-2">
                  <Video className="h-4 w-4" /> Track Workout
                </Button>
              </Link>
              <Link to="/history">
                <Button variant="glass" size="sm" className="gap-2">
                  <History className="h-4 w-4" /> History
                </Button>
              </Link>
            </div>
          </div>

          {/* ML Progression Banner */}
          {mlSession?.progressionAction && (
            <div className={`mb-6 flex items-center gap-4 p-4 rounded-xl border animate-fade-in
              ${PROG_BG[mlSession.progressionAction] || "border-primary/30 bg-primary/5"}`}>
              <span className="text-2xl shrink-0">{PROG_ICONS[mlSession.progressionAction]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                  🤖 ML Recommendation — latest session
                </p>
                <p className={`font-semibold text-sm ${PROG_COLORS[mlSession.progressionAction]}`}>
                  {mlSession.progressionReason || "Keep up the great work!"}
                </p>
              </div>
              <Link to={`/track-video?exercise=${encodeURIComponent(mlSession.exercise)}&reps=${
                mlSession.progressionAction === "INCREASE"
                  ? mlSession.targetReps + 2
                  : mlSession.progressionAction === "DECREASE"
                    ? Math.max(mlSession.targetReps - 2, 5)
                    : mlSession.targetReps
              }`} className="shrink-0">
                <Button variant="ghost" size="sm" className={`gap-1 ${PROG_COLORS[mlSession.progressionAction]}`}>
                  Track Now <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {quickStats.map(({ label, value, icon: Icon, color }, i) => (
              <div key={label}
                   className="glass-card rounded-xl p-4 animate-fade-in"
                   style={{ animationDelay: `${0.1 * i}s` }}>
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`h-5 w-5 ${color}`} />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
                <p className="font-display text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>

          {/* Main cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {dashCards.map(({ title, value, description, icon: Icon, color, bg, link }, i) => (
              <Card key={title}
                    className="card-gradient border-border/50 hover:border-primary/30 transition-all duration-300 group animate-fade-in"
                    style={{ animationDelay: `${0.1 * (i + 4)}s` }}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${bg}`}>
                      <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                    <span className="font-display text-3xl font-bold">{value}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-1">{title}</CardTitle>
                  <p className="text-sm text-muted-foreground mb-4">{description}</p>
                  <Link to={link}>
                    <Button variant="ghost" className="p-0 h-auto text-primary gap-1 hover:gap-3 transition-all">
                      View Details <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom row */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Recent sessions */}
            <Card className="card-gradient border-border/50 animate-fade-in" style={{ animationDelay: "0.7s" }}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Recent Sessions
                  </span>
                  <Link to="/history">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1 h-auto py-1">
                      View all <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recent.length === 0 ? (
                  <div className="text-center py-6">
                    <Dumbbell className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-30" />
                    <p className="text-sm text-muted-foreground mb-4">No sessions yet.</p>
                    <Link to="/track-video">
                      <Button variant="hero" size="sm" className="gap-2">
                        <Video className="h-4 w-4" /> Track Your First Workout
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {recent.map(s => (
                      <Link
                        key={s.id}
                        to={`/track-video?exercise=${encodeURIComponent(s.exercise)}&reps=${
                          s.progressionAction === "INCREASE" ? s.targetReps + 2
                          : s.progressionAction === "DECREASE" ? Math.max(s.targetReps - 2, 5)
                          : s.targetReps
                        }`}
                        className="flex items-center justify-between py-2.5 px-3 rounded-lg
                                   hover:bg-secondary/30 border border-transparent
                                   hover:border-border/50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{EXERCISE_ICONS[s.exercise] || "🏋️"}</span>
                          <div>
                            <p className="font-medium text-sm capitalize">{s.exercise.replace(/_/g, " ")}</p>
                            <p className="text-xs text-muted-foreground">
                              {s.completedReps}/{s.targetReps} reps · {fmt(s.sessionDate)}
                              {s.progressionAction && s.progressionAction !== "MAINTAIN" && (
                                <span className={`ml-2 font-semibold
                                  ${s.progressionAction === "INCREASE" ? "text-green-400" : "text-yellow-400"}`}>
                                  {PROG_ICONS[s.progressionAction]}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <p className={`font-semibold text-sm shrink-0 ${scoreColor(s.averageFormScore)}`}>
                          {Math.round(s.averageFormScore)}%
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card className="card-gradient border-border/50 animate-fade-in" style={{ animationDelay: "0.8s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { to: "/track-video",        icon: Video,     label: "Track a Workout",          sub: "Upload video or use live camera",  color: "text-primary",    bg: "bg-primary/10"    },
                    { to: "/generate-workout",   icon: Brain,     label: "Generate AI Plan",          sub: "Groq LLM personalised programme",  color: "text-accent",     bg: "bg-accent/10"     },
                    { to: "/ai-recommendations", icon: TrendingUp, label: "ML Recommendations",       sub: "See your progression suggestions", color: "text-green-400",  bg: "bg-green-500/10"  },
                    { to: "/history",            icon: History,   label: "Session History",           sub: "All workouts with form scores",    color: "text-primary",    bg: "bg-primary/10"    },
                  ].map(({ to, icon: Icon, label, sub, color, bg }) => (
                    <Link key={to} to={to}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/30
                                     border border-transparent hover:border-border/50 transition-all group">
                      <div className={`p-2 rounded-lg ${bg} shrink-0`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{label}</p>
                        <p className="text-xs text-muted-foreground truncate">{sub}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary
                                            group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}
