import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { PageSpinner } from "@/components/ui/Spinner";
import Navbar from "@/components/Navbar";
import { User, Pencil, Check, X, Activity, Scale, Ruler, Target, Flame } from "lucide-react";
import api from "@/services/api";

const SEL = "flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors";
const EMPTY = { age:"", gender:"", height:"", weight:"", goal:"", activityLevel:"", experienceLevel:"", medicalConditions:"" };

const GOAL_LABEL = { WEIGHT_LOSS:"Weight Loss", MUSCLE_GAIN:"Muscle Gain", MAINTENANCE:"Maintenance", ENDURANCE:"Endurance" };
const ACT_LABEL  = { SEDENTARY:"Sedentary", LIGHTLY_ACTIVE:"Lightly Active", MODERATELY_ACTIVE:"Moderately Active", VERY_ACTIVE:"Very Active", EXTREMELY_ACTIVE:"Extremely Active" };
const EXP_LABEL  = { BEGINNER:"Beginner", INTERMEDIATE:"Intermediate", ADVANCED:"Advanced" };

const bmiInfo = b => {
  if (!b) return null;
  if (b < 18.5) return { label:"Underweight", cls:"text-blue-400",  bar:"bg-blue-400" };
  if (b < 25)   return { label:"Healthy",     cls:"text-green-400", bar:"bg-green-400" };
  if (b < 30)   return { label:"Overweight",  cls:"text-yellow-400",bar:"bg-yellow-400" };
  return              { label:"Obese",        cls:"text-red-400",   bar:"bg-red-400" };
};

export default function Profile() {
  const [profile,   setProfile]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [editing,   setEditing]   = useState(false);
  const [form,      setForm]      = useState(EMPTY);
  const [message,   setMessage]   = useState("");
  const [error,     setError]     = useState("");
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    api.get("/api/profile")
      .then(r => setProfile(r.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const fc = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const startEdit = () => {
    setForm(profile
      ? { age: profile.age, gender: profile.gender, height: profile.height, weight: profile.weight,
          goal: profile.goal, activityLevel: profile.activityLevel,
          experienceLevel: profile.experienceLevel, medicalConditions: profile.medicalConditions || "" }
      : EMPTY);
    setEditing(true); setMessage(""); setError("");
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError(""); setMessage(""); setSaving(true);
    try {
      const res = await (profile ? api.put : api.post)("/api/profile", form);
      setProfile(res.data);
      setMessage(profile ? "Profile updated successfully!" : "Profile created successfully!");
      setEditing(false);
    } catch (err) { setError(err.response?.data?.message || "Could not save profile."); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen hero-gradient"><Navbar /><PageSpinner message="Loading profile…" /></div>;

  const bmi = profile ? bmiInfo(profile.bmi) : null;

  return (
    <div className="min-h-screen hero-gradient">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-3xl">

          {/* Header */}
          <div className="mb-8 animate-fade-in flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold">Profile</h1>
              </div>
              <p className="text-muted-foreground">Your fitness details and personal goals.</p>
            </div>
            {profile && !editing && (
              <Button variant="glass" size="sm" className="gap-2" onClick={startEdit}>
                <Pencil className="h-4 w-4" /> Edit Profile
              </Button>
            )}
          </div>

          {message && <Alert type="success" className="mb-4">{message}</Alert>}
          {error   && <Alert type="error"   className="mb-4">{error}</Alert>}

          {/* Profile display */}
          {profile && !editing && (
            <>
              {/* BMI spotlight */}
              {profile.bmi && (
                <Card className="card-gradient border-border/50 mb-6 animate-fade-in">
                  <CardContent className="p-6 flex items-center gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">BMI</p>
                      <p className={`font-display text-5xl font-bold ${bmi?.cls}`}>
                        {Number(profile.bmi).toFixed(1)}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className={`font-display font-bold text-xl mb-2 ${bmi?.cls}`}>{bmi?.label}</p>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden w-48">
                        <div className={`h-full rounded-full ${bmi?.bar}`}
                             style={{ width:`${Math.min((profile.bmi/40)*100,100)}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Body Mass Index</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { icon: Activity, label:"Age",    value:`${profile.age} yrs`,   color:"text-primary" },
                  { icon: Ruler,    label:"Height",  value:`${profile.height} cm`, color:"text-primary" },
                  { icon: Scale,    label:"Weight",  value:`${profile.weight} kg`, color:"text-accent"  },
                  { icon: Flame,    label:"Goal",    value: GOAL_LABEL[profile.goal] || profile.goal, color:"text-accent" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="glass-card rounded-xl p-4 text-center">
                    <Icon className={`h-5 w-5 ${color} mx-auto mb-2`} />
                    <p className="font-display font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              {/* Detail card */}
              <Card className="card-gradient border-border/50 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" /> Fitness Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      ["Gender",       profile.gender?.charAt(0) + profile.gender?.slice(1).toLowerCase()],
                      ["Goal",         GOAL_LABEL[profile.goal] || profile.goal],
                      ["Activity Level", ACT_LABEL[profile.activityLevel] || profile.activityLevel],
                      ["Experience",   EXP_LABEL[profile.experienceLevel] || profile.experienceLevel],
                      ["Medical Conditions", profile.medicalConditions || "None"],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">{label}</p>
                          <p className="font-medium text-sm capitalize">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Empty state */}
          {!profile && !editing && (
            <div className="glass-card rounded-2xl p-12 text-center">
              <User className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display font-bold text-lg mb-2">No profile yet</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Set up your fitness profile to unlock personalised plans and AI recommendations.
              </p>
              <Button variant="hero" onClick={startEdit}>🚀 Create Profile</Button>
            </div>
          )}

          {/* Form */}
          {editing && (
            <Card className="card-gradient border-primary/30 animate-scale-in">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="font-display text-xl">
                  {profile ? "Edit Profile" : "Create Profile"}
                </CardTitle>
                {profile && (
                  <button onClick={() => setEditing(false)}
                          className="p-1 rounded-lg hover:bg-secondary/60 transition-colors">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Body stats */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 pb-2 border-b border-border/50">
                      📏 Body Stats
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input id="age" name="age" type="number" min={10} max={120}
                               value={form.age} onChange={fc} placeholder="25" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <select id="gender" name="gender" value={form.gender} onChange={fc} required className={SEL}>
                          <option value="">Select gender</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input id="height" name="height" type="number" min={100} max={250}
                               value={form.height} onChange={fc} placeholder="175" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input id="weight" name="weight" type="number" min={30} max={300}
                               value={form.weight} onChange={fc} placeholder="70" required />
                      </div>
                    </div>
                  </div>

                  {/* Goals */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 pb-2 border-b border-border/50">
                      🎯 Goals &amp; Experience
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Goal</Label>
                        <select name="goal" value={form.goal} onChange={fc} required className={SEL}>
                          <option value="">Select goal</option>
                          {Object.entries(GOAL_LABEL).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Activity Level</Label>
                        <select name="activityLevel" value={form.activityLevel} onChange={fc} required className={SEL}>
                          <option value="">Select activity level</option>
                          {Object.entries(ACT_LABEL).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Experience Level</Label>
                        <select name="experienceLevel" value={form.experienceLevel} onChange={fc} required className={SEL}>
                          <option value="">Select experience</option>
                          {Object.entries(EXP_LABEL).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="medical">Medical Conditions</Label>
                        <Input id="medical" name="medicalConditions" type="text"
                               value={form.medicalConditions} onChange={fc} placeholder="None" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2 border-t border-border/50">
                    {profile && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                    )}
                    <Button type="submit" variant="hero" size="sm" className="gap-2" disabled={saving}>
                      <Check className="h-4 w-4" />
                      {saving ? "Saving…" : profile ? "Save Changes" : "Create Profile"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
