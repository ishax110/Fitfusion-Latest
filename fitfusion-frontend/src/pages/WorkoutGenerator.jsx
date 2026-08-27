import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import Navbar from "@/components/Navbar";
import {
  Bot, Sparkles, ArrowRight, ArrowLeft, Check,
  Dumbbell, Video, Clock, Flame, ChevronRight
} from "lucide-react";
import api from "@/services/api";

/* ── Question definitions ── */
const QUESTIONS = [
  {
    id: "primary_goal", title: "What is your primary fitness goal?",
    type: "tiles", cols: 2,
    options: [
      { value:"lose_weight",     icon:"🔥", label:"Lose Weight",     sub:"Burn fat, slim down" },
      { value:"build_muscle",    icon:"💪", label:"Build Muscle",    sub:"Gain strength & size" },
      { value:"improve_fitness", icon:"🏃", label:"Improve Fitness", sub:"Cardio & endurance" },
      { value:"stay_active",     icon:"⚖️", label:"Stay Active",    sub:"Maintain & feel good" },
    ],
  },
  {
    id: "experience", title: "Your training experience?",
    type: "tiles", cols: 3,
    options: [
      { value:"beginner",     icon:"🌱", label:"Beginner",      sub:"0–6 months" },
      { value:"intermediate", icon:"🌿", label:"Intermediate",  sub:"6mo – 2yrs" },
      { value:"advanced",     icon:"🌳", label:"Advanced",      sub:"2+ years" },
    ],
  },
  {
    id: "days_per_week", title: "How many days per week can you train?",
    type: "slider", min:2, max:7, step:1, default:4, unit:"days / week",
  },
  {
    id: "session_duration", title: "How long is each session?",
    type: "tiles", cols: 4,
    options: [
      { value:"20-30", icon:"⚡", label:"20–30 min", sub:"Quick" },
      { value:"30-45", icon:"🕐", label:"30–45 min", sub:"Standard" },
      { value:"45-60", icon:"🕑", label:"45–60 min", sub:"Full" },
      { value:"60+",   icon:"🕒", label:"60+ min",   sub:"Extended" },
    ],
  },
  {
    id: "equipment", title: "What equipment do you have?",
    type: "tiles", cols: 2,
    options: [
      { value:"no_equipment",    icon:"🏠", label:"No Equipment",  sub:"Bodyweight only" },
      { value:"dumbbells",       icon:"🏋️", label:"Dumbbells",     sub:"Home gym" },
      { value:"full_gym",        icon:"🏟️", label:"Full Gym",      sub:"All machines" },
      { value:"resistance_bands",icon:"🎗️", label:"Bands",         sub:"Portable" },
    ],
  },
  {
    id: "workout_style", title: "What type of workouts do you prefer?",
    type: "tiles", cols: 2,
    options: [
      { value:"strength_training", icon:"🏋️", label:"Strength",   sub:"Lifting & resistance" },
      { value:"cardio",            icon:"🏃", label:"Cardio",      sub:"Running & cycling" },
      { value:"hiit",              icon:"⚡", label:"HIIT",        sub:"High intensity" },
      { value:"mixed",             icon:"🔀", label:"Mixed",       sub:"Variety each session" },
    ],
  },
  {
    id: "injuries", title: "Any injuries or areas to avoid?",
    type: "tiles", cols: 4,
    options: [
      { value:"none",       icon:"✅", label:"None",       sub:"All good" },
      { value:"lower_back", icon:"🔴", label:"Lower Back", sub:"" },
      { value:"knees",      icon:"🔴", label:"Knees",      sub:"" },
      { value:"shoulders",  icon:"🔴", label:"Shoulders",  sub:"" },
    ],
  },
  {
    id: "extra_notes", title: "Anything else the AI should know?",
    type: "textarea",
    placeholder: 'e.g. "morning sessions only, no jumping, focus on core"',
  },
];
const TOTAL = QUESTIONS.length;

function buildPreferences(a) {
  return [
    a.primary_goal      && `Goal: ${a.primary_goal.replace(/_/g," ")}`,
    a.experience        && `Experience: ${a.experience}`,
    a.session_duration  && `Session duration: ${a.session_duration} min`,
    a.equipment         && `Equipment: ${a.equipment.replace(/_/g," ")}`,
    a.workout_style     && `Preferred style: ${a.workout_style.replace(/_/g," ")}`,
    a.injuries && a.injuries !== "none" && `Avoid: ${a.injuries.replace(/_/g," ")}`,
    a.extra_notes?.trim(),
  ].filter(Boolean).join(". ");
}

const CAT_META = {
  STRENGTH:    { emoji:"🏋️", badge:"bg-primary/20 text-primary border-primary/30" },
  CARDIO:      { emoji:"🏃",  badge:"bg-red-500/20 text-red-400 border-red-500/30" },
  FLEXIBILITY: { emoji:"🧘",  badge:"bg-green-500/20 text-green-400 border-green-500/30" },
  HIIT:        { emoji:"⚡",  badge:"bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
};

function answerDisplay(q, val) {
  if (!val) return "—";
  if (q.type === "slider")   return `${val} ${q.unit}`;
  if (q.type === "textarea") return val.trim() || "None";
  return q.options?.find(o => o.value === val)?.label || val;
}

export default function WorkoutGenerator() {
  const navigate = useNavigate();
  const [step,     setStep]     = useState(0);
  const [answers,  setAnswers]  = useState({ days_per_week: 4 });
  const [gen,      setGen]      = useState(false);
  const [plan,     setPlan]     = useState(null);
  const [error,    setError]    = useState("");
  const [missing,  setMissing]  = useState(false);
  const [toast,    setToast]    = useState(null);

  const isSummary  = step === TOTAL;
  const currentQ   = QUESTIONS[step];
  const currentVal = answers[currentQ?.id];
  const progress   = Math.round((step / TOTAL) * 100);

  const select = (id, val) => setAnswers(p => ({ ...p, [id]: val }));

  const canNext = isSummary || currentQ?.type === "textarea" ||
                  currentQ?.type === "slider" ||
                  (currentVal !== undefined && currentVal !== "");

  const generate = async () => {
    setError(""); setPlan(null); setMissing(false); setGen(true);
    try {
      const res = await api.post("/api/workouts/generate-ai", {
        preferences:   buildPreferences(answers),
        days_per_week: answers.days_per_week || 4,
      });
      setPlan(res.data);
      setStep(TOTAL + 1);
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (err.response?.status === 400 || msg.toLowerCase().includes("profile")) setMissing(true);
      else setError(msg || "Generation failed. Make sure the AI service is running.");
    } finally { setGen(false); }
  };

  const saveWorkout = async w => {
    try {
      await api.post("/api/workouts", {
        name:       w.name,
        category:   w.category,
        duration:   w.duration_minutes,
        calories:   w.estimated_calories,
        difficulty: w.difficulty,
      });
      setToast({ type:"success", msg:`"${w.name}" saved!` });
    } catch { setToast({ type:"error", msg:"Could not save." }); }
    setTimeout(() => setToast(null), 3000);
  };

  const reset = () => { setStep(0); setAnswers({ days_per_week:4 }); setPlan(null); setError(""); setMissing(false); };

  /* Profile missing */
  if (missing) return (
    <div className="min-h-screen hero-gradient">
      <Navbar />
      <main className="pt-20 pb-12 px-4 flex items-center justify-center min-h-[70vh]">
        <Card className="card-gradient border-border/50 max-w-md w-full text-center">
          <CardContent className="p-10">
            <Bot className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-display font-bold text-lg mb-2">Profile Required</h3>
            <p className="text-muted-foreground text-sm mb-6">Set up your fitness profile first so the AI can personalise your plan.</p>
            <Link to="/profile"><Button variant="hero">🚀 Set Up Profile</Button></Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );

  /* Plan result view */
  if (plan) return (
    <div className="min-h-screen hero-gradient">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-5xl">

          {toast && <Alert type={toast.type} className="mb-4">{toast.msg}</Alert>}

          {/* Plan header */}
          <div className="mb-8 animate-fade-in flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-primary">AI Plan Ready</span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">{plan.plan_name}</h1>
              <p className="text-muted-foreground text-sm max-w-xl">{plan.overview}</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={reset}>
              <Bot className="h-4 w-4" /> New Plan
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Dumbbell, label:"Days / Week",     value: plan.days_per_week },
              { icon: Flame,    label:"kcal / session",  value: `~${plan.estimated_calories_per_session}` },
              { icon: Clock,    label:"Duration",         value: `${plan.duration_weeks} weeks` },
              { icon: Check,    label:"Level",            value: plan.experience_level?.slice(0,3) || "—" },
            ].map(({ icon: Icon, label, value }, i) => (
              <div key={label} className="glass-card rounded-xl p-4 text-center animate-fade-in" style={{ animationDelay:`${0.05*i}s` }}>
                <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="font-display text-xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {/* Workout cards */}
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            🗓️ Weekly Schedule
            <span className="flex-1 h-px bg-border/50 ml-2" />
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {plan.workouts?.map((w, i) => {
              const meta = CAT_META[w.category?.toUpperCase()] || { emoji:"💪", badge:"bg-primary/20 text-primary" };
              return (
                <Card key={i} className="card-gradient border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden animate-fade-in" style={{ animationDelay:`${0.05*i}s` }}>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{w.day}</span>
                      <Badge variant="outline" className={`text-xs ${meta.badge}`}>{w.category}</Badge>
                    </div>
                    <h3 className="font-display font-bold text-base mb-1">{w.name}</h3>
                    {w.focus && <p className="text-xs text-muted-foreground mb-3">Focus: {w.focus}</p>}
                    <div className="flex gap-4 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {w.duration_minutes} min</span>
                      <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-accent" /> ~{w.estimated_calories} kcal</span>
                    </div>

                    {w.exercises?.length > 0 && (
                      <div className="space-y-1.5 mb-4">
                        {w.exercises.map((ex, ei) => (
                          <div key={ei} className="flex items-start gap-2 text-xs py-1.5 border-t border-border/50 first:border-0">
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">{ei+1}</span>
                            <div className="flex-1">
                              <span className="font-medium">{ex.name}</span>
                              <span className="text-muted-foreground ml-2">
                                {[ex.sets && `${ex.sets} sets`, ex.reps && `${ex.reps} reps`].filter(Boolean).join(" · ")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button onClick={() => { const ex = w.exercises?.[0]?.name || w.name; const r = parseInt(w.exercises?.[0]?.reps)||10; navigate(`/track-video?exercise=${encodeURIComponent(ex)}&reps=${r}`); }}
                              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors">
                        <Video className="h-3 w-3" /> Track
                      </button>
                      <button onClick={() => saveWorkout(w)}
                              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold bg-secondary/50 border border-border hover:bg-secondary transition-colors">
                        <Check className="h-3 w-3" /> Save
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {plan.rest_days?.map((d, i) => (
              <div key={`rest-${i}`} className="glass-card rounded-xl p-5 flex flex-col items-center justify-center text-center opacity-60">
                <span className="text-3xl mb-2">😴</span>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{d}</p>
                <p className="text-sm text-muted-foreground">Rest Day — Recovery</p>
              </div>
            ))}
          </div>

          {/* Tips */}
          {plan.tips?.length > 0 && (
            <>
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                💡 Pro Tips <span className="flex-1 h-px bg-border/50 ml-2" />
              </h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {plan.tips.map((tip, i) => (
                  <Card key={i} className="glass-card border-border/50">
                    <CardContent className="p-4 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary flex items-center justify-center shrink-0">{i+1}</span>
                      <p className="text-sm text-muted-foreground">{tip}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );

  /* ── Questionnaire ── */
  return (
    <div className="min-h-screen hero-gradient">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-2xl">

          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary">AI Workout Generator</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-1">Generate Your Plan</h1>
            <p className="text-muted-foreground text-sm">Answer 8 questions — the AI builds your perfect programme.</p>
          </div>

          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                   style={{ width:`${progress}%` }} />
            </div>
            <span className="text-xs font-bold text-muted-foreground shrink-0">
              {isSummary ? "Ready!" : `${step+1} / ${TOTAL}`}
            </span>
          </div>

          {/* Summary step */}
          {isSummary ? (
            <div className="space-y-4 animate-fade-in">
              <Card className="card-gradient border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" /> Your Answers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {QUESTIONS.map(q => (
                      <div key={q.id} className="p-3 bg-secondary/40 rounded-xl border border-border/50">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1 truncate">
                          {q.title.replace(/^(What|How|Any|Anything).*?(your|many|long|do|else)?/i,"").trim().slice(0,20) || q.id.replace(/_/g," ")}
                        </p>
                        <p className="font-semibold text-sm truncate">{answerDisplay(q, answers[q.id])}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button variant="hero" className="w-full gap-3 h-14 text-base" onClick={generate} disabled={gen}>
                {gen ? <><Spinner size="sm" className="border-primary-foreground" /> Generating your plan…</> : <><Sparkles className="h-5 w-5" /> Generate My Workout Plan</>}
              </Button>
              <Button variant="ghost" className="w-full gap-2 text-muted-foreground" onClick={() => setStep(TOTAL-1)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </div>
          ) : (
            /* Question step */
            <Card className="card-gradient border-border/50 animate-scale-in">
              <CardContent className="p-6 space-y-6">
                <div>
                  <Badge variant="outline" className="text-primary border-primary/30 text-xs mb-3">
                    Question {step+1} of {TOTAL}
                  </Badge>
                  <h2 className="font-display font-bold text-xl">{currentQ.title}</h2>
                </div>

                {/* Tiles */}
                {currentQ.type === "tiles" && (
                  <div className={`grid gap-3 ${
                    currentQ.cols === 4 ? "grid-cols-2 sm:grid-cols-4"
                    : currentQ.cols === 3 ? "grid-cols-3"
                    : "grid-cols-2"
                  }`}>
                    {currentQ.options.map(opt => (
                      <button key={opt.value} type="button" onClick={() => select(currentQ.id, opt.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all duration-200
                          ${currentVal === opt.value
                            ? "border-primary bg-primary/10"
                            : "border-border bg-secondary/40 hover:border-primary/50 hover:bg-secondary/60"}`}>
                        <span className="text-2xl">{opt.icon}</span>
                        <span className={`text-sm font-semibold ${currentVal === opt.value ? "text-primary" : ""}`}>{opt.label}</span>
                        {opt.sub && <span className="text-xs text-muted-foreground">{opt.sub}</span>}
                      </button>
                    ))}
                  </div>
                )}

                {/* Slider */}
                {currentQ.type === "slider" && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <span className="font-display text-5xl font-bold gradient-text">
                        {answers[currentQ.id] ?? currentQ.default}
                      </span>
                      <span className="text-muted-foreground ml-2 text-sm">{currentQ.unit}</span>
                    </div>
                    <input type="range" min={currentQ.min} max={currentQ.max} step={currentQ.step}
                           value={answers[currentQ.id] ?? currentQ.default}
                           onChange={e => select(currentQ.id, Number(e.target.value))}
                           className="w-full accent-primary cursor-pointer" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{currentQ.min} days</span><span>{currentQ.max} days</span>
                    </div>
                  </div>
                )}

                {/* Textarea */}
                {currentQ.type === "textarea" && (
                  <textarea value={answers[currentQ.id] || ""} rows={4}
                            onChange={e => select(currentQ.id, e.target.value)}
                            placeholder={currentQ.placeholder}
                            className="flex w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-colors" />
                )}

                {/* Nav buttons */}
                <div className="flex gap-3 pt-2 border-t border-border/50">
                  {step > 0 && (
                    <Button variant="glass" size="sm" className="gap-2" onClick={() => setStep(s => s-1)}>
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                  )}
                  <Button variant="hero" size="sm" className="ml-auto gap-2"
                          disabled={!canNext} onClick={() => canNext && setStep(s => s+1)}>
                    {step === TOTAL-1 ? "Review" : "Next"} <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
