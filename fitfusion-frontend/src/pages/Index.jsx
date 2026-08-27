import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import Navbar from "@/components/Navbar";
import {
  Activity, Brain, Dumbbell, Apple, TrendingUp, Zap,
  ArrowRight, CheckCircle2, Cpu, Database, Server, Cloud
} from "lucide-react";

const features = [
  { icon: Dumbbell, title: "Personalized Workouts",  description: "AI-crafted exercise routines tailored to your fitness level, goals, and available equipment." },
  { icon: Apple,    title: "Nutrition Guidance",      description: "Smart meal planning and macro tracking to fuel your performance and recovery." },
  { icon: Brain,    title: "AI Recommendations",      description: "Intelligent suggestions that evolve with your progress using machine learning algorithms." },
  { icon: TrendingUp, title: "Progress Tracking",    description: "Comprehensive analytics and insights to visualise your fitness journey over time." },
];

const microservices = [
  { icon: Cpu,      name: "AI Service",       desc: "ML-powered recommendations" },
  { icon: Database, name: "User Service",     desc: "Authentication & profiles" },
  { icon: Server,   name: "Workout Service",  desc: "Exercise management" },
  { icon: Cloud,    name: "Nutrition Service",desc: "Meal planning API" },
];

const benefits = [
  "Independent service scaling", "Technology flexibility",
  "Fault isolation", "Continuous deployment",
  "Team autonomy", "API-first design",
];

export default function Index() {
  return (
    <div className="min-h-screen hero-gradient">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Fitness Platform</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Transform Your Body with{" "}
              <span className="gradient-text">Intelligent</span> Fitness
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
              FitFusion combines cutting-edge AI with personalised workout and nutrition plans
              to help you achieve your fitness goals faster than ever.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Link to="/register">
                <Button variant="hero" size="xl">
                  Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="xl">Sign In</Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
              {[["10K+","Active Users"],["500+","Workout Plans"],["95%","Success Rate"]].map(([v,l]) => (
                <div key={l}>
                  <p className="font-display text-3xl md:text-4xl font-bold gradient-text">{v}</p>
                  <p className="text-sm text-muted-foreground mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools for your fitness transformation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description }, i) => (
              <Card key={title} className="card-gradient border-border/50 hover:border-primary/30 transition-all duration-300 group animate-fade-in" style={{ animationDelay: `${0.1*i}s` }}>
                <CardContent className="p-6">
                  <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Microservices */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Built on <span className="gradient-accent-text">Microservice</span> Architecture
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Scalable, resilient, and maintainable. Our platform leverages modern microservices
              for optimal performance and reliability.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {microservices.map(({ icon: Icon, name, desc }, i) => (
              <div key={name} className="glass-card rounded-xl p-4 text-center animate-fade-in" style={{ animationDelay: `${0.1*i}s` }}>
                <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-1">{name}</h4>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="glass-card rounded-2xl p-8">
              <h3 className="font-display font-bold text-xl mb-4 text-center">System Architecture Benefits</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {benefits.map(b => (
                  <div key={b} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <Activity className="h-12 w-12 text-primary mx-auto mb-6 animate-float" />
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Fitness?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of users who have already achieved their fitness goals with FitFusion.
            </p>
            <Link to="/register">
              <Button variant="hero" size="xl">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/30">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-display font-bold gradient-text">FitFusion</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 FitFusion. AI-Powered Fitness Platform.</p>
        </div>
      </footer>
    </div>
  );
}
