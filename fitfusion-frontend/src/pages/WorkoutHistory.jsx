import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Spinner";
import Navbar from "@/components/Navbar";
import {
  History, TrendingUp, Target, Clock, BarChart2,
  Video, ChevronDown, ChevronUp, Filter, Award, Zap
} from "lucide-react";
import api from "@/services/api";

const EXERCISE_ICONS = {
  squat:"🦵", pushup:"💪", bicep_curl:"🏋️",
  lunge:"🚶", shoulder_press:"🙌", plank:"🧘",
};

const PROG_META = {
  INCREASE:{ icon:"📈", label:"Increase",  cls:"bg-green-500/20 text-green-400 border-green-500/30"  },
  MAINTAIN:{ icon:"⚖️", label:"Maintain",  cls:"bg-primary/20 text-primary border-primary/30"        },
  DECREASE:{ icon:"📉", label:"Decrease",  cls:"bg-yellow-500/20 text-yellow-400 border-yellow-500/30"},
};

function scoreColor(s) {
  if (s >= 85) return "text-green-400";
  if (s >= 65) return "text-primary";
  return "text-yellow-400";
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
}
function fmtTime(s) {
  if (!s) return "—";
  if (s < 60) return `${Math.round(s)}s`;
  return `${Math.floor(s/60)}m ${Math.round(s%60)}s`;
}

export default function WorkoutHistory() {
  const [sessions,  setSessions]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("all");
  const [expanded,  setExpanded]  = useState(null);

  useEffect(() => {
    api.get("/api/sessions")
      .then(r => setSessions(r.data))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  /* Unique exercises for filter */
  const exercises = ["all", ...new Set(sessions.map(s => s.exercise))];

  const filtered = filter === "all" ? sessions : sessions.filter(s => s.exercise === filter);

  /* Aggregate stats */
  const totalSessions = sessions.length;
  const avgScore      = sessions.length
    ? Math.round(sessions.reduce((a, s) => a + s.averageFormScore, 0) / sessions.length)
    : 0;
  const totalReps = sessions.reduce((a, s) => a + (s.completedReps || 0), 0);
  const bestScore = sessions.length ? Math.round(Math.max(...sessions.map(s => s.averageFormScore))) : 0;

  /* Score trend: compare last 3 sessions avg vs previous 3 */
  const trend = (() => {
    if (sessions.length < 2) return null;
    const recent = sessions.slice(0, 3).map(s => s.averageFormScore);
    const prev   = sessions.slice(3, 6).map(s => s.averageFormScore);
    if (!prev.length) return null;
    const rAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const pAvg = prev.reduce((a, b) => a + b, 0) / prev.length;
    return rAvg - pAvg;
  })();

  if (loading) return (
    <div className="min-h-screen hero-gradient">
      <Navbar /><PageSpinner message="Loading your history…" />
    </div>
  );

  return (
    <div className="min-h-screen hero-gradient">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-5xl">

          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <History className="h-6 w-6 text-primary" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">Workout History</h1>
            </div>
            <p className="text-muted-foreground">
              Every session you've completed, with ML progression recommendations.
            </p>
          </div>

          {/* Aggregate stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon:History,   label:"Total Sessions", value:totalSessions, color:"text-primary",    bg:"bg-primary/10"    },
              { icon:BarChart2, label:"Avg Form Score",  value:`${avgScore}%`, color:"text-green-400", bg:"bg-green-500/10"  },
              { icon:Target,    label:"Total Reps",      value:totalReps,     color:"text-accent",     bg:"bg-accent/10"     },
              { icon:Award,     label:"Best Score",      value:`${bestScore}%`, color:"text-yellow-400", bg:"bg-yellow-500/10"},
            ].map(({ icon: Icon, label, value, color, bg }, i) => (
              <div key={label}
                   className="glass-card rounded-xl p-4 animate-fade-in"
                   style={{ animationDelay:`${0.05*i}s` }}>
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Trend banner */}
          {trend !== null && (
            <div className={`mb-6 flex items-center gap-3 p-4 rounded-xl border animate-fade-in
              ${trend >= 0
                ? "border-green-500/30 bg-green-500/5"
                : "border-yellow-500/30 bg-yellow-500/5"}`}>
              <TrendingUp className={`h-5 w-5 ${trend >= 0 ? "text-green-400" : "text-yellow-400"}`} />
              <div>
                <p className="font-semibold text-sm">
                  {trend >= 0
                    ? `Form improving! +${trend.toFixed(1)}% vs previous 3 sessions`
                    : `Form dip: ${trend.toFixed(1)}% vs previous 3 sessions`}
                </p>
                <p className="text-xs text-muted-foreground">Based on your last 6 sessions</p>
              </div>
            </div>
          )}

          {/* Filter */}
          {exercises.length > 2 && (
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {exercises.map(ex => (
                <button key={ex} onClick={() => setFilter(ex)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                    ${filter === ex
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50"}`}>
                  {ex === "all" ? "All" : <>{EXERCISE_ICONS[ex] || "💪"} {ex.replace(/_/g," ")}</>}
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="glass-card rounded-2xl p-12 text-center">
              <History className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display font-bold text-lg mb-2">No sessions yet</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Complete a workout to start building your history and get ML recommendations.
              </p>
              <Link to="/track-video">
                <Button variant="hero" className="gap-2">
                  <Video className="h-4 w-4" /> Track a Workout
                </Button>
              </Link>
            </div>
          )}

          {/* Session cards */}
          <div className="space-y-4">
            {filtered.map((session, i) => {
              const prog = PROG_META[session.progressionAction] || PROG_META.MAINTAIN;
              const isExpanded = expanded === session.id;
              const sc = scoreColor(session.averageFormScore);

              return (
                <Card key={session.id}
                      className="card-gradient border-border/50 hover:border-primary/20 transition-all animate-fade-in"
                      style={{ animationDelay:`${0.04*i}s` }}>
                  <CardContent className="p-0">

                    {/* Main row */}
                    <button
                      className="w-full flex items-center gap-4 p-5 text-left"
                      onClick={() => setExpanded(isExpanded ? null : session.id)}
                    >
                      {/* Exercise icon */}
                      <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center text-2xl shrink-0">
                        {EXERCISE_ICONS[session.exercise] || "💪"}
                      </div>

                      {/* Name + date */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold capitalize">
                            {session.exercise.replace(/_/g, " ")}
                          </span>
                          <Badge variant="outline" className={`text-xs ${prog.cls}`}>
                            {prog.icon} {prog.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          <span>{fmtDate(session.sessionDate)}</span>
                          <span>·</span>
                          <span>{session.completedReps}/{session.targetReps} reps</span>
                          <span>·</span>
                          <span>{fmtTime(session.workoutDurationSeconds)}</span>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right shrink-0 mr-2">
                        <p className={`font-display text-2xl font-bold ${sc}`}>
                          {Math.round(session.averageFormScore)}%
                        </p>
                        <p className="text-xs text-muted-foreground">form</p>
                      </div>

                      {/* Expand chevron */}
                      <div className="text-muted-foreground shrink-0">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1 border-t border-border/50 space-y-4 animate-fade-in">

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { label:"Completed Reps",  val:session.completedReps },
                            { label:"Good Form Reps",  val:session.correctReps  },
                            { label:"Completion Rate", val:`${Math.round(session.completionRate)}%` },
                            { label:"Duration",        val:fmtTime(session.workoutDurationSeconds) },
                          ].map(({ label, val }) => (
                            <div key={label} className="text-center p-3 bg-secondary/30 rounded-xl border border-border/50">
                              <p className="font-display font-bold text-lg text-primary">{val}</p>
                              <p className="text-xs text-muted-foreground">{label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Form score bar */}
                        <div>
                          <div className="flex justify-between text-xs mb-2">
                            <span className="font-semibold text-muted-foreground uppercase tracking-wider">Average Form Score</span>
                            <span className={`font-bold ${sc}`}>{Math.round(session.averageFormScore)}%</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-700"
                                 style={{ width:`${session.averageFormScore}%` }} />
                          </div>
                        </div>

                        {/* ML Recommendation block */}
                        <div className={`p-4 rounded-xl border ${prog.cls}`}>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xl">{prog.icon}</span>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                🤖 ML Recommendation
                              </p>
                              <p className="font-semibold text-sm">{prog.label}</p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {session.progressionReason || "Performance within expected range."}
                          </p>
                        </div>

                        {/* Track Again button */}
                        <div className="flex gap-3">
                          <Link
                            to={`/track-video?exercise=${encodeURIComponent(session.exercise)}&reps=${
                              session.progressionAction === "INCREASE"
                                ? Math.min(session.targetReps + 2, 50)
                                : session.progressionAction === "DECREASE"
                                  ? Math.max(session.targetReps - 2, 5)
                                  : session.targetReps
                            }`}
                            className="flex-1"
                          >
                            <Button variant="hero" size="sm" className="w-full gap-2">
                              <Video className="h-4 w-4" />
                              Track Again
                              {session.progressionAction === "INCREASE" && ` (${session.targetReps + 2} reps)`}
                              {session.progressionAction === "DECREASE" && ` (${Math.max(session.targetReps - 2, 5)} reps)`}
                            </Button>
                          </Link>
                          <Link to="/ai-recommendations">
                            <Button variant="glass" size="sm" className="gap-2">
                              <BarChart2 className="h-4 w-4" /> AI Insights
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Bottom CTA */}
          {filtered.length > 0 && (
            <div className="mt-8 text-center">
              <Link to="/track-video">
                <Button variant="hero" className="gap-2">
                  <Video className="h-4 w-4" /> Track New Workout
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
