import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { PageSpinner } from "@/components/ui/Spinner";
import Navbar from "@/components/Navbar";
import {
  Users, Dumbbell, BarChart2, Plus, Pencil,
  Trash2, Check, X, Flame, Clock, Target,
  BookOpen, Video, Brain, Trophy
} from "lucide-react";
import api from "@/services/api";

const CAT_COLORS = {
  STRENGTH:    "bg-primary/20 text-primary border-primary/30",
  CARDIO:      "bg-red-500/20 text-red-400 border-red-500/30",
  FLEXIBILITY: "bg-green-500/20 text-green-400 border-green-500/30",
  HIIT:        "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};
const CAT_ICONS = { STRENGTH:"🏋️", CARDIO:"🏃", FLEXIBILITY:"🧘", HIIT:"⚡" };
const SEL = "flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors";
const EMPTY = { name:"", category:"", duration:"", calories:"", difficulty:"" };

export default function TrainerDashboard() {
  const [stats,    setStats]    = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [message,  setMessage]  = useState("");
  const [error,    setError]    = useState("");
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/api/trainer/stats").then(r => setStats(r.data)).catch(() => {}),
      api.get("/api/trainer/workouts").then(r => setWorkouts(r.data)).catch(() => setWorkouts([])),
    ]).finally(() => setLoading(false));
  }, []);

  const fc = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const openCreate = () => { setEditId(null); setForm(EMPTY); setShowForm(true); setMessage(""); setError(""); };
  const openEdit   = w => { setEditId(w.id); setForm({ name:w.name, category:w.category, duration:w.duration, calories:w.calories||"", difficulty:w.difficulty||"" }); setShowForm(true); setMessage(""); setError(""); };
  const closeForm  = () => { setShowForm(false); setEditId(null); setForm(EMPTY); };

  const handleSubmit = async e => {
    e.preventDefault(); setError(""); setMessage(""); setSaving(true);
    try {
      if (editId) {
        const r = await api.put(`/api/trainer/workouts/${editId}`, form);
        setWorkouts(p => p.map(w => w.id === editId ? r.data : w));
        setMessage("Template updated!");
      } else {
        const r = await api.post("/api/trainer/workouts", form);
        setWorkouts(p => [...p, r.data]);
        setMessage("Template created!");
      }
      closeForm();
    } catch (err) { setError(err.response?.data?.message || "Could not save template."); }
    finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this workout template?")) return;
    setDeleting(id);
    try {
      await api.delete(`/api/trainer/workouts/${id}`);
      setWorkouts(p => p.filter(w => w.id !== id));
    } catch { setError("Could not delete template."); }
    finally { setDeleting(null); }
  };

  if (loading) return (
    <div className="min-h-screen hero-gradient">
      <Navbar /><PageSpinner message="Loading trainer dashboard…" />
    </div>
  );

  const trainerName = stats?.trainerName?.split(" ")[0] || "Trainer";

  return (
    <div className="min-h-screen hero-gradient">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">

          {/* ── Header ── */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold">
                  Trainer Hub — <span className="gradient-text">{trainerName}</span>
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Create and manage workout templates. Guide your clients with expert plans.
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Trophy className="h-3 w-3 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Certified Trainer</span>
            </div>
          </div>

          {/* ── Stats strip ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Dumbbell, label:"Total Templates",  value: stats?.totalTemplates ?? 0,      color:"text-primary",    bg:"bg-primary/10"    },
              { icon: Flame,    label:"Strength Plans",   value: stats?.strengthTemplates ?? 0,   color:"text-accent",     bg:"bg-accent/10"     },
              { icon: Clock,    label:"Cardio Plans",     value: stats?.cardioTemplates ?? 0,     color:"text-red-400",    bg:"bg-red-500/10"    },
              { icon: Target,   label:"HIIT Plans",       value: stats?.hiitTemplates ?? 0,       color:"text-yellow-400", bg:"bg-yellow-500/10" },
            ].map(({ icon: Icon, label, value, color, bg }, i) => (
              <div key={label} className="glass-card rounded-xl p-4 animate-fade-in" style={{ animationDelay:`${0.05*i}s` }}>
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* ── Trainer tools ── */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: BookOpen, label:"Workout Templates", sub:"Create plans for your clients",    color:"text-primary",   bg:"bg-primary/10",   action:"scroll" },
              { icon: Video,    label:"Video Analysis",    sub:"Analyse client exercise videos",   color:"text-green-400", bg:"bg-green-500/10", link:"/track-video" },
              { icon: Brain,    label:"AI Plan Generator", sub:"Generate AI-powered programmes",   color:"text-accent",    bg:"bg-accent/10",    link:"/generate-workout" },
            ].map(({ icon: Icon, label, sub, color, bg, link, action }, i) => (
              <div key={label}
                   onClick={() => { if (link) window.location.href = link; }}
                   className="glass-card rounded-xl p-5 cursor-pointer hover:border-primary/30 hover:-translate-y-0.5 transition-all animate-fade-in"
                   style={{ animationDelay:`${0.05*(i+4)}s` }}>
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <p className="font-semibold text-sm font-display">{label}</p>
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
              </div>
            ))}
          </div>

          {/* ── Workout templates section ── */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              Workout Templates
            </h2>
            <Button variant="hero" size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Create Template
            </Button>
          </div>

          {/* Alerts */}
          {message && <Alert type="success" className="mb-4">{message}</Alert>}
          {error   && <Alert type="error"   className="mb-4">{error}</Alert>}

          {/* Create / edit form */}
          {showForm && (
            <Card className="card-gradient border-primary/30 mb-6 animate-scale-in">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-display">
                  {editId ? "Edit Template" : "New Workout Template"}
                </CardTitle>
                <button onClick={closeForm} className="p-1 rounded hover:bg-secondary/60 transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Template Name</Label>
                      <Input name="name" value={form.name} onChange={fc}
                             placeholder="e.g. Beginner Full Body Blast" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <select name="category" value={form.category} onChange={fc} required className={SEL}>
                        <option value="">Select category</option>
                        {["STRENGTH","CARDIO","FLEXIBILITY","HIIT"].map(c => (
                          <option key={c} value={c}>{c.charAt(0)+c.slice(1).toLowerCase()}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <select name="difficulty" value={form.difficulty} onChange={fc} className={SEL}>
                        <option value="">Select difficulty</option>
                        {["BEGINNER","INTERMEDIATE","ADVANCED"].map(d => (
                          <option key={d} value={d}>{d.charAt(0)+d.slice(1).toLowerCase()}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Duration (min)</Label>
                      <Input name="duration" type="number" min={1} value={form.duration} onChange={fc}
                             placeholder="e.g. 45" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Est. Calories</Label>
                      <Input name="calories" type="number" min={0} value={form.calories} onChange={fc}
                             placeholder="e.g. 400" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2 border-t border-border/50">
                    <Button type="button" variant="ghost" size="sm" onClick={closeForm}>Cancel</Button>
                    <Button type="submit" variant="hero" size="sm" className="gap-2" disabled={saving}>
                      <Check className="h-4 w-4" />
                      {saving ? "Saving…" : editId ? "Update Template" : "Create Template"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {workouts.length === 0 && (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Dumbbell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display font-bold text-lg mb-2">No templates yet</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Create your first workout template to share with clients.
              </p>
              <Button variant="hero" className="gap-2" onClick={openCreate}>
                <Plus className="h-4 w-4" /> Create First Template
              </Button>
            </div>
          )}

          {/* Templates grid */}
          {workouts.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {workouts.map((w, i) => (
                <Card key={w.id}
                      className="card-gradient border-border/50 hover:border-primary/30 transition-all duration-200 overflow-hidden animate-fade-in"
                      style={{ animationDelay:`${0.04*i}s` }}>
                  <CardContent className="p-5">
                    {/* Top */}
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{CAT_ICONS[w.category] || "💪"}</span>
                      {w.difficulty && (
                        <Badge variant="outline" className={`text-xs ${
                          w.difficulty === "BEGINNER" ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : w.difficulty === "INTERMEDIATE" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                        }`}>
                          {w.difficulty.charAt(0)+w.difficulty.slice(1).toLowerCase()}
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-display font-bold text-base mb-2 leading-tight">{w.name}</h3>

                    {w.category && (
                      <Badge variant="outline" className={`text-xs mb-3 ${CAT_COLORS[w.category] || "bg-secondary"}`}>
                        {w.category}
                      </Badge>
                    )}

                    {/* Stats row */}
                    <div className="flex gap-4 mb-4">
                      <div className="text-center px-3 py-1.5 bg-secondary/40 rounded-lg">
                        <p className="text-xs font-bold text-primary">{w.duration}</p>
                        <p className="text-[10px] text-muted-foreground">min</p>
                      </div>
                      {w.calories && (
                        <div className="text-center px-3 py-1.5 bg-secondary/40 rounded-lg">
                          <p className="text-xs font-bold text-accent">{w.calories}</p>
                          <p className="text-[10px] text-muted-foreground">kcal</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-border/50">
                      <Button variant="ghost" size="sm" className="flex-1 gap-1 text-xs hover:text-primary"
                              onClick={() => openEdit(w)}>
                        <Pencil className="h-3 w-3" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1 gap-1 text-xs hover:text-destructive"
                              onClick={() => handleDelete(w.id)} disabled={deleting === w.id}>
                        <Trash2 className="h-3 w-3" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Trainer guide */}
          <Card className="glass-card border-border/50 mt-10 animate-fade-in">
            <CardContent className="p-6">
              <h3 className="font-display font-bold text-base mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Trainer Guide
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                {[
                  ["📋 Create Templates", "Build reusable workout templates with category, difficulty, duration, and calorie estimates."],
                  ["🎥 Video Analysis",   "Use the Video Tracker to analyse client exercise videos and score their form."],
                  ["🤖 AI Plan Gen",      "Generate AI-powered personalised workout plans using Groq LLM."],
                  ["📊 Progress Tracking","Review workout history and ML progression recommendations per session."],
                ].map(([title, desc]) => (
                  <div key={title} className="flex items-start gap-3 p-3 bg-secondary/20 rounded-xl">
                    <span className="text-lg shrink-0">{title.split(" ")[0]}</span>
                    <div>
                      <p className="font-semibold text-foreground text-xs mb-0.5">{title.slice(3)}</p>
                      <p className="text-xs">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
