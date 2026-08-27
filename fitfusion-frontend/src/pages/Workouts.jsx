import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert } from "@/components/ui/Alert";
import { PageSpinner } from "@/components/ui/Spinner";
import Navbar from "@/components/Navbar";
import {
  Dumbbell, Clock, Flame, Play, Zap, Target,
  Trophy, Plus, Pencil, Trash2, Video, Bot, X, Check
} from "lucide-react";
import api from "@/services/api";

const CAT_EMOJI  = { STRENGTH:"🏋️", CARDIO:"🏃", FLEXIBILITY:"🧘", HIIT:"⚡" };
const DIFF_CLASS = {
  BEGINNER:     "bg-green-500/20 text-green-400 border-green-500/30",
  INTERMEDIATE: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  ADVANCED:     "bg-red-500/20 text-red-400 border-red-500/30",
};
const EMPTY = { name:"", category:"", duration:"", calories:"", difficulty:"" };

export default function Workouts() {
  const [workouts,  setWorkouts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState(EMPTY);
  const [message,   setMessage]   = useState("");
  const [error,     setError]     = useState("");
  const [deleting,  setDeleting]  = useState(null);

  useEffect(() => {
    api.get("/api/workouts")
      .then(r => setWorkouts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fc = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const openEdit = w => {
    setEditId(w.id);
    setForm({ name:w.name, category:w.category, duration:w.duration, calories:w.calories||"", difficulty:w.difficulty||"" });
    setShowForm(true); setMessage(""); setError("");
  };

  const closeForm = () => { setShowForm(false); setEditId(null); setForm(EMPTY); };

  const handleSubmit = async e => {
    e.preventDefault(); setError(""); setMessage("");
    try {
      if (editId) {
        const r = await api.put(`/api/workouts/${editId}`, form);
        setWorkouts(p => p.map(w => w.id === editId ? r.data : w));
        setMessage("Workout updated!");
      } else {
        const r = await api.post("/api/workouts", form);
        setWorkouts(p => [...p, r.data]);
        setMessage("Workout created!");
      }
      closeForm();
    } catch (err) { setError(err.response?.data?.message || "Could not save workout."); }
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this workout?")) return;
    setDeleting(id);
    try {
      await api.delete(`/api/workouts/${id}`);
      setWorkouts(p => p.filter(w => w.id !== id));
    } catch { setError("Could not delete workout."); }
    finally { setDeleting(null); }
  };

  return (
    <div className="min-h-screen hero-gradient">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">

          {/* Header */}
          <div className="mb-8 animate-fade-in flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold">Workouts</h1>
              </div>
              <p className="text-muted-foreground">Manage your workout library and track performance.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link to="/generate-workout">
                <Button variant="glass" size="sm" className="gap-2">
                  <Bot className="h-4 w-4 text-primary" /> AI Generate
                </Button>
              </Link>
              <Button variant="hero" size="sm" className="gap-2" onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY); }}>
                <Plus className="h-4 w-4" /> Add Workout
              </Button>
            </div>
          </div>

          {/* Alerts */}
          {message && <Alert type="success" className="mb-4">{message}</Alert>}
          {error   && <Alert type="error"   className="mb-4">{error}</Alert>}

          {/* Create/Edit form */}
          {showForm && (
            <Card className="card-gradient border-primary/30 mb-8 animate-scale-in">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-display">
                  {editId ? "Edit Workout" : "New Workout"}
                </CardTitle>
                <button onClick={closeForm} className="p-1 rounded-lg hover:bg-secondary/60 transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Workout Name</Label>
                      <Input name="name" value={form.name} onChange={fc} placeholder="e.g. Morning HIIT" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <select name="category" value={form.category} onChange={fc} required
                        className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors">
                        <option value="">Select category</option>
                        {["STRENGTH","CARDIO","FLEXIBILITY","HIIT"].map(c => (
                          <option key={c} value={c}>{c.charAt(0)+c.slice(1).toLowerCase()}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <select name="difficulty" value={form.difficulty} onChange={fc}
                        className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors">
                        <option value="">Select difficulty</option>
                        {["BEGINNER","INTERMEDIATE","ADVANCED"].map(d => (
                          <option key={d} value={d}>{d.charAt(0)+d.slice(1).toLowerCase()}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Duration (min)</Label>
                      <Input name="duration" type="number" min={1} value={form.duration} onChange={fc} placeholder="45" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Calories (optional)</Label>
                      <Input name="calories" type="number" min={0} value={form.calories} onChange={fc} placeholder="350" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" size="sm" onClick={closeForm}>Cancel</Button>
                    <Button type="submit" variant="hero" size="sm" className="gap-2">
                      <Check className="h-4 w-4" /> {editId ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: Trophy, label:"Total", value: workouts.length },
              { icon: Flame,  label:"Avg kcal", value: workouts.length ? Math.round(workouts.filter(w=>w.calories).reduce((s,w)=>s+(w.calories||0),0)/Math.max(workouts.filter(w=>w.calories).length,1)) : 0 },
              { icon: Target, label:"Categories", value: new Set(workouts.map(w=>w.category)).size },
            ].map(({ icon: Icon, label, value }, i) => (
              <div key={label} className="glass-card rounded-xl p-4 text-center animate-fade-in" style={{ animationDelay:`${0.1*i}s` }}>
                <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="font-display text-xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {/* Loading */}
          {loading && <PageSpinner message="Loading workouts…" />}

          {/* Empty */}
          {!loading && workouts.length === 0 && (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Dumbbell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display font-bold text-lg mb-2">No workouts yet</h3>
              <p className="text-muted-foreground text-sm mb-6">Add workouts manually or let AI generate a plan for you.</p>
              <div className="flex gap-3 justify-center">
                <Link to="/generate-workout">
                  <Button variant="hero" size="sm">🤖 Generate with AI</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>+ Add Manually</Button>
              </div>
            </div>
          )}

          {/* Workout grid */}
          {!loading && workouts.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workouts.map((w, i) => (
                <Card key={w.id}
                      className="card-gradient border-border/50 hover:border-primary/30 transition-all duration-300 group overflow-hidden animate-fade-in"
                      style={{ animationDelay:`${0.05*i}s` }}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <span className="text-4xl">{CAT_EMOJI[w.category] || "💪"}</span>
                      {w.difficulty && (
                        <Badge variant="outline" className={DIFF_CLASS[w.difficulty] || "bg-primary/20 text-primary"}>
                          {w.difficulty.charAt(0)+w.difficulty.slice(1).toLowerCase()}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-2">{w.name}</CardTitle>
                    {w.category && (
                      <Badge variant="secondary" className="w-fit text-xs">{w.category}</Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2 bg-secondary/50 rounded-lg">
                        <Clock className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                        <p className="text-xs font-medium">{w.duration} min</p>
                      </div>
                      <div className="text-center p-2 bg-secondary/50 rounded-lg">
                        <Flame className="h-4 w-4 text-accent mx-auto mb-1" />
                        <p className="text-xs font-medium">{w.calories || "—"} kcal</p>
                      </div>
                      <div className="text-center p-2 bg-secondary/50 rounded-lg">
                        <Zap className="h-4 w-4 text-primary mx-auto mb-1" />
                        <p className="text-xs font-medium capitalize">{w.category?.toLowerCase() || "—"}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/track-video?exercise=${encodeURIComponent(w.name)}&reps=10`} className="flex-1">
                        <Button variant="hero" size="sm" className="w-full gap-1">
                          <Video className="h-3 w-3" /> Track
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(w)} className="text-muted-foreground hover:text-primary">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(w.id)}
                        disabled={deleting === w.id}
                        className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
