import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageSpinner } from "@/components/ui/Spinner";
import Navbar from "@/components/Navbar";
import {
  Brain, Sparkles, Target, TrendingUp, Video,
  Zap, RefreshCw, CheckCircle2, Dumbbell, History,
  TrendingDown, Minus, ArrowUpRight, BarChart2
} from "lucide-react";
import api from "@/services/api";

const EXERCISE_ICONS = {
  squat:"🦵", pushup:"💪", bicep_curl:"🏋️",
  lunge:"🚶", shoulder_press:"🙌", plank:"🧘",
};

const PROG_META = {
  INCREASE: {
    Icon: TrendingUp, label: "Increase Difficulty",
    cls: "border-green-500/30 bg-green-500/5", color: "text-green-400",
    badge: "bg-green-500/20 text-green-400 border-green-500/30",
    priority: "High", category: "Workout",
  },
  MAINTAIN: {
    Icon: Minus, label: "Maintain Current Level",
    cls: "border-primary/30 bg-primary/5", color: "text-primary",
    badge: "bg-primary/20 text-primary border-primary/30",
    priority: "Medium", category: "Workout",
  },
  DECREASE: {
    Icon: TrendingDown, label: "Reduce Difficulty",
    cls: "border-yellow-500/30 bg-yellow-500/5", color: "text-yellow-400",
    badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    priority: "Medium", category: "Recovery",
  },
};

const PRIORITY_CLS = {
  High:   "bg-red-500/20 text-red-400 border-red-500/30",
  Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Low:    "bg-green-500/20 text-green-400 border-green-500/30",
};

const CAT_CLS = {
  Workout:   "bg-primary/20 text-primary",
  Nutrition: "bg-accent/20 text-accent",
  Recovery:  "bg-purple-500/20 text-purple-400",
  Goal:      "bg-blue-500/20 text-blue-400",
};

const GOAL_LABEL = {
  WEIGHT_LOSS:"Weight Loss", MUSCLE_GAIN:"Muscle Gain",
  MAINTENANCE:"Maintenance", ENDURANCE:"Endurance",
};

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US",{month:"short",day:"numeric"});
}

export default function AIRecommendations() {
  const [rec,      setRec]      = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/api/recommendations").then(r => setRec(r.data)).catch(() => {}),
      api.get("/api/sessions").then(r => setSessions(r.data)).catch(() => setSessions([])),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen hero-gradient">
      <Navbar /><PageSpinner message="Loading AI insights…" />
    </div>
  );

  /* ── Build recommendations from real data ── */
  const recs = [];

  /* Nutrition recommendation from profile */
  if (rec) {
    recs.push({
      id: "nutrition",
      category: "Nutrition",
      priority: "Medium",
      title: `Daily Calorie Target: ${rec.dailyCalories} kcal`,
      description: `Protein: ${rec.proteinGrams}g · Carbs: ${rec.carbohydrateGrams}g · Fat: ${rec.fatGrams}g — based on your ${GOAL_LABEL[rec.goal] || rec.goal} goal.`,
      action: "View meal plan",
      link: "/nutrition",
      Icon: Target,
      extra: null,
    });
  }

  /* Workout plan rec */
  if (rec?.workoutPlan?.length) {
    recs.push({
      id: "workout-plan",
      category: "Workout",
      priority: "High",
      title: "Your Weekly Workout Schedule",
      description: rec.workoutPlan.slice(0, 4).join(" · ") + (rec.workoutPlan.length > 4 ? ` +${rec.workoutPlan.length - 4} more` : ""),
      action: "Generate AI plan",
      link: "/generate-workout",
      Icon: Dumbbell,
      extra: null,
    });
  }

  /* ML session recommendations — one per unique exercise + action */
  const seen = new Set();
  sessions.slice(0, 10).forEach(s => {
    const key = `${s.exercise}-${s.progressionAction}`;
    if (!s.progressionAction || seen.has(key)) return;
    seen.add(key);

    const meta = PROG_META[s.progressionAction] || PROG_META.MAINTAIN;
    const nextReps = s.progressionAction === "INCREASE"
      ? s.targetReps + 2
      : s.progressionAction === "DECREASE"
        ? Math.max(s.targetReps - 2, 5)
        : s.targetReps;

    recs.push({
      id: `session-${s.id}`,
      category: meta.category,
      priority: meta.priority,
      title: `${meta.label} — ${s.exercise.replace(/_/g, " ")}`,
      description: s.progressionReason || `Your last session: ${s.completedReps}/${s.targetReps} reps at ${s.averageFormScore?.toFixed(1)}% form score.`,
      action: s.progressionAction === "INCREASE"
        ? `Track now with ${nextReps} reps`
        : s.progressionAction === "DECREASE"
          ? `Track now with ${nextReps} reps (lighter)`
          : `Track again — focus on form`,
      link: `/track-video?exercise=${encodeURIComponent(s.exercise)}&reps=${nextReps}`,
      Icon: meta.Icon,
      extra: { session: s, nextReps, meta },
    });
  });

  /* Fallback if nothing */
  if (recs.length === 0) {
    recs.push({
      id: "setup",
      category: "Goal",
      priority: "High",
      title: "Complete Your Fitness Profile",
      description: "Set up your profile to unlock personalised AI recommendations and ML-driven progression.",
      action: "Set up profile",
      link: "/profile",
      Icon: CheckCircle2,
      extra: null,
    });
  }

  /* ── Aggregate session stats ── */
  const avgScore   = sessions.length ? Math.round(sessions.reduce((a,s) => a+s.averageFormScore, 0) / sessions.length) : 0;
  const increaseN  = sessions.filter(s => s.progressionAction === "INCREASE").length;
  const decreaseN  = sessions.filter(s => s.progressionAction === "DECREASE").length;

  return (
    <div className="min-h-screen hero-gradient">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">

          {/* Header */}
          <div className="mb-8 animate-fade-in flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold">AI Insights</h1>
              </div>
              <p className="text-muted-foreground">
                ML-driven recommendations based on your real workout performance data.
              </p>
            </div>
            <Link to="/history">
              <Button variant="glass" size="sm" className="gap-2">
                <History className="h-4 w-4" /> Session History
              </Button>
            </Link>
          </div>

          {/* How it works */}
          <Card className="card-gradient border-primary/20 mb-6 animate-fade-in">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-base mb-1">How the ML Model Works</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    After each tracked session, a trained ML model analyses your rep count, form score,
                    completion rate, and previous performance trend. It outputs{" "}
                    <span className="text-green-400 font-semibold">INCREASE</span>,{" "}
                    <span className="text-primary font-semibold">MAINTAIN</span>, or{" "}
                    <span className="text-yellow-400 font-semibold">DECREASE</span> intensity — then the
                    "Track Again" button below pre-fills the correct rep target automatically.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[[Zap,"Real Performance Data"],[RefreshCw,"Adapts Each Session"],[Target,"Goal-Oriented"]].map(([Icon,l]) => (
                      <Badge key={l} variant="secondary" className="text-xs gap-1">
                        <Icon className="h-3 w-3" />{l}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats strip */}
          {sessions.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in" style={{ animationDelay:"0.1s" }}>
              {[
                { label:"Sessions",      value:sessions.length, color:"text-primary"    },
                { label:"Avg Form",      value:`${avgScore}%`,  color:"text-green-400"  },
                { label:"Progressions",  value:increaseN,       color:"text-green-400"  },
              ].map(({ label, value, color }) => (
                <div key={label} className="glass-card rounded-xl p-4 text-center">
                  <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Your Recommendations</h2>
              <Badge variant="outline" className="text-primary border-primary/30">
                {recs.length} active
              </Badge>
            </div>

            {recs.map(({ id, category, priority, title, description, action, link, Icon, extra }, i) => (
              <Card key={id}
                    className="card-gradient border-border/50 hover:border-primary/20 transition-all animate-fade-in"
                    style={{ animationDelay:`${0.07*i}s` }}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">

                    {/* Icon */}
                    <div className="p-3 rounded-xl bg-secondary/50 shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>

                    <div className="flex-1">
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="outline" className={CAT_CLS[category] || "bg-secondary"}>
                          {category}
                        </Badge>
                        <Badge variant="outline" className={PRIORITY_CLS[priority] || "bg-secondary"}>
                          {priority} Priority
                        </Badge>
                        {extra?.session && (
                          <Badge variant="outline" className={extra.meta.badge}>
                            {extra.meta.label}
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-display font-semibold text-lg mb-1 capitalize">{title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{description}</p>

                      {/* Session context for ML recs */}
                      {extra?.session && (
                        <div className="flex flex-wrap gap-4 mb-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span>{EXERCISE_ICONS[extra.session.exercise] || "💪"}</span>
                            Last: {extra.session.completedReps}/{extra.session.targetReps} reps
                          </span>
                          <span className="flex items-center gap-1">
                            <BarChart2 className="h-3 w-3" />
                            {extra.session.averageFormScore?.toFixed(1)}% form
                          </span>
                          <span>{fmtDate(extra.session.sessionDate)}</span>
                          <span className="font-semibold text-primary">
                            Next target: {extra.nextReps} reps
                          </span>
                        </div>
                      )}

                      {/* Action button */}
                      <Link to={link}>
                        <Button variant="ghost" className="p-0 h-auto text-primary hover:text-primary/80 font-semibold gap-1.5 group">
                          {action}
                          <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent sessions table */}
          {sessions.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold">Recent Sessions</h2>
                <Link to="/history">
                  <Button variant="ghost" size="sm" className="text-primary gap-1">
                    View all <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
              <Card className="card-gradient border-border/50">
                <CardContent className="p-0">
                  <div className="hidden sm:grid grid-cols-[auto_1fr_100px_120px_100px] px-5 py-3 bg-secondary/30 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                    <div className="w-8"></div>
                    <div>Exercise</div>
                    <div>Reps</div>
                    <div>Form Score</div>
                    <div>ML Action</div>
                  </div>
                  {sessions.slice(0, 5).map(s => {
                    const prog = PROG_META[s.progressionAction] || PROG_META.MAINTAIN;
                    return (
                      <div key={s.id}
                           className="flex sm:grid sm:grid-cols-[auto_1fr_100px_120px_100px] px-5 py-4 border-b border-border/50 last:border-0 hover:bg-secondary/20 items-center gap-3 sm:gap-0">
                        <div className="text-xl">{EXERCISE_ICONS[s.exercise] || "💪"}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm capitalize">{s.exercise.replace(/_/g," ")}</p>
                          <p className="text-xs text-muted-foreground">{fmtDate(s.sessionDate)}</p>
                        </div>
                        <div className="text-sm font-semibold">{s.completedReps}/{s.targetReps}</div>
                        <div className={`text-sm font-bold ${scoreColor(s.averageFormScore)}`}>
                          {Math.round(s.averageFormScore)}%
                        </div>
                        <Badge variant="outline" className={`text-xs ${prog.badge} hidden sm:inline-flex`}>
                          {prog.Icon && <prog.Icon className="h-3 w-3 mr-1" />}
                          {s.progressionAction}
                        </Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Architecture note */}
          <Card className="glass-card border-border/50 mt-8 animate-fade-in">
            <CardContent className="p-5 text-center">
              <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                Recommendations are powered by a trained ML model (joblib) running in a dedicated FastAPI
                microservice on port 8000. It uses features like form score, rep completion rate, RPE
                estimate, and performance trend across your session history.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function scoreColor(s) {
  return s >= 85 ? "text-green-400" : s >= 65 ? "text-primary" : "text-yellow-400";
}
