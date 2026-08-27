import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { PageSpinner } from "@/components/ui/Spinner";
import Navbar from "@/components/Navbar";
import { Apple, Flame, Utensils, Lightbulb, Droplets, Beef, Wheat, Egg } from "lucide-react";
import api from "@/services/api";

const MEAL_ICONS = { breakfast:"🌅", lunch:"☀️", dinner:"🌙", snack:"🍎" };

const tips = [
  { icon: Droplets, title:"Stay Hydrated",    desc:"Aim for 8–10 glasses of water daily, especially during workouts." },
  { icon: Beef,     title:"Protein Timing",   desc:"Consume protein within 30 minutes post-workout for optimal recovery." },
  { icon: Wheat,    title:"Complex Carbs",    desc:"Choose whole grains over refined carbs for sustained energy levels." },
  { icon: Egg,      title:"Healthy Fats",     desc:"Include omega-3 rich foods like salmon and nuts in your diet." },
];

const GOAL_LABEL = {
  WEIGHT_LOSS: "Weight Loss", MUSCLE_GAIN: "Muscle Gain",
  MAINTENANCE: "Maintenance", ENDURANCE: "Endurance",
};

export default function Nutrition() {
  const [rec,     setRec]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    api.get("/api/recommendations")
      .then(r => setRec(r.data))
      .catch(e => setError(e.response?.data?.message || "Could not load nutrition plan."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen hero-gradient"><Navbar /><PageSpinner message="Building your meal plan…" /></div>;

  const total = rec ? {
    cal:  rec.dailyCalories   || 0,
    prot: rec.proteinGrams    || 0,
    carb: rec.carbohydrateGrams || 0,
    fat:  rec.fatGrams        || 0,
  } : null;

  return (
    <div className="min-h-screen hero-gradient">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">

          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <Apple className="h-6 w-6 text-accent" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">Nutrition</h1>
            </div>
            <p className="text-muted-foreground">AI-optimised meal plans designed for your fitness goals.</p>
          </div>

          {error && (
            <div className="glass-card rounded-2xl p-10 text-center mb-8">
              <Apple className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-display font-bold text-lg mb-2">No nutrition plan yet</h3>
              <p className="text-muted-foreground text-sm mb-4">{error}</p>
              <Link to="/profile" className="text-primary hover:underline text-sm font-medium">
                Set up your profile →
              </Link>
            </div>
          )}

          {rec && (
            <>
              {/* Daily summary */}
              <Card className="card-gradient border-border/50 mb-8 animate-fade-in" style={{ animationDelay:"0.1s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-primary" />
                    Daily Nutritional Summary
                    {rec.goal && (
                      <Badge variant="outline" className="ml-auto text-primary border-primary/30">
                        {GOAL_LABEL[rec.goal] || rec.goal}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: <Flame className="h-6 w-6 text-accent mx-auto mb-2" />, val: total.cal,       unit:"kcal",  label:"Calories",      color:"text-accent" },
                      { icon: <span className="block h-6 w-6 mx-auto mb-2 text-primary font-bold text-center leading-6">P</span>, val: total.prot, unit:"g", label:"Protein", color:"text-primary" },
                      { icon: <span className="block h-6 w-6 mx-auto mb-2 text-yellow-400 font-bold text-center leading-6">C</span>, val: total.carb, unit:"g", label:"Carbs", color:"text-yellow-400" },
                      { icon: <span className="block h-6 w-6 mx-auto mb-2 text-orange-400 font-bold text-center leading-6">F</span>, val: total.fat, unit:"g", label:"Fats", color:"text-orange-400" },
                    ].map(({ icon, val, unit, label, color }) => (
                      <div key={label} className="text-center p-4 bg-secondary/50 rounded-xl">
                        {icon}
                        <p className={`font-display text-2xl font-bold ${color}`}>{val}<span className="text-sm ml-1 text-muted-foreground">{unit}</span></p>
                        <p className="text-xs text-muted-foreground mt-1">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Macro bars */}
                  <div className="mt-6 space-y-3">
                    {[
                      { label:"Protein",      val:total.prot, total:total.prot+total.carb+total.fat, color:"from-primary to-primary/70",       text:"text-primary"      },
                      { label:"Carbohydrates",val:total.carb, total:total.prot+total.carb+total.fat, color:"from-yellow-400 to-yellow-400/70",  text:"text-yellow-400"   },
                      { label:"Fats",         val:total.fat,  total:total.prot+total.carb+total.fat, color:"from-orange-400 to-orange-400/70",  text:"text-orange-400"   },
                    ].map(({ label, val, total: t, color, text }) => {
                      const pct = t > 0 ? Math.round((val/t)*100) : 0;
                      return (
                        <div key={label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{label}</span>
                            <span className={text}>{val}g · {pct}%</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`}
                                 style={{ width:`${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Meal plan */}
              {rec.mealPlan?.length > 0 && (
                <div className="mb-8">
                  <h2 className="font-display text-xl font-bold mb-4">Today&apos;s Meal Plan</h2>
                  <div className="space-y-4">
                    {rec.mealPlan.map((meal, i) => {
                      const mealKey = Object.keys(MEAL_ICONS).find(k => meal.mealName?.toLowerCase().includes(k)) || "snack";
                      return (
                        <Card key={i}
                              className="card-gradient border-border/50 hover:border-primary/30 transition-all duration-300 animate-fade-in"
                              style={{ animationDelay:`${0.1*(i+2)}s` }}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                              <div className="flex items-center gap-4">
                                <span className="text-4xl">{MEAL_ICONS[mealKey]}</span>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs">{meal.mealName}</Badge>
                                  </div>
                                  {meal.foods?.length > 0 && (
                                    <p className="text-sm text-muted-foreground">
                                      {meal.foods.slice(0, 4).map(f => f.name).join(" · ")}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="md:ml-auto flex gap-4 text-center">
                                {[
                                  { val:Math.round(meal.totalCalories), label:"kcal",    color:"text-accent"       },
                                  { val:Math.round(meal.totalProtein)+"g", label:"protein", color:"text-primary"  },
                                  { val:Math.round(meal.totalCarbs)+"g",   label:"carbs",   color:"text-yellow-400"},
                                  { val:Math.round(meal.totalFat)+"g",     label:"fats",    color:"text-orange-400"},
                                ].map(({ val, label, color }) => (
                                  <div key={label}>
                                    <p className={`font-semibold text-sm ${color}`}>{val}</p>
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {/* Food items */}
                            {meal.foods?.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-border/50 grid sm:grid-cols-2 gap-2">
                                {meal.foods.map((f, fi) => (
                                  <div key={fi} className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                                      {f.name}
                                      <span className="text-muted-foreground">{f.quantity}{f.unit}</span>
                                    </span>
                                    <span className="text-muted-foreground">{Math.round(f.calories)} kcal</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Tips — always shown */}
          <div>
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-400" /> Nutrition Tips
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tips.map(({ icon: Icon, title, desc }, i) => (
                <Card key={title} className="glass-card border-border/50 animate-fade-in" style={{ animationDelay:`${0.1*i}s` }}>
                  <CardContent className="p-4">
                    <Icon className="h-6 w-6 text-primary mb-3" />
                    <h4 className="font-semibold mb-1 text-sm">{title}</h4>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
