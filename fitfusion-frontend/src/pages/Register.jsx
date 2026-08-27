import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert } from "@/components/ui/Alert";
import Navbar from "@/components/Navbar";
import { Activity, Mail, Lock, User, Users, UserCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import api from "@/services/api";

/* Extract the most useful error message from any backend response shape */
function extractError(err) {
  const data = err.response?.data;
  if (!data) return err.message || "Registration failed. Please try again.";

  // GlobalExceptionHandler validation shape: { fields: { password: "..." } }
  if (data.fields) {
    const fieldMsgs = Object.values(data.fields);
    if (fieldMsgs.length > 0) return fieldMsgs.join(" · ");
  }

  // Normal message field
  if (data.message) return data.message;

  // Spring default error shape
  if (data.error) return data.error;

  return "Registration failed. Please try again.";
}

export default function Register() {
  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [role,       setRole]       = useState("user");
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [loading,    setLoading]    = useState(false);
  const navigate = useNavigate();

  /* Client-side validation */
  const validate = () => {
    if (!name.trim())           return "Please enter your full name.";
    if (name.trim().length < 2) return "Name must be at least 2 characters.";
    if (!email.trim())          return "Please enter your email address.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Please enter a valid email address.";
    if (!password)              return "Please enter a password.";
    if (password.length < 8)   return "Password must be at least 8 characters.";
    return null;
  };

  /* Password strength */
  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3;
  const strengthColors = ["", "bg-red-500", "bg-yellow-500", "bg-green-500"];
  const strengthLabels = ["", "Too short", "Fair", "Strong"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      await api.post("/api/auth/register", {
        name:     name.trim(),
        email:    email.trim().toLowerCase(),
        password,
        role:     role.toUpperCase(),   // sends "USER" or "TRAINER" to backend
      });
      setSuccess("Account created successfully! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient">
      <Navbar />
      <div className="pt-24 pb-12 px-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md card-gradient border-border/50 animate-scale-in">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto p-3 rounded-xl bg-primary/10 w-fit mb-4">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-display text-2xl">Create Account</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              Start your AI-powered fitness journey today
            </p>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Role selector */}
              <div className="space-y-2">
                <Label>I want to join as</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[["user","User",User],["trainer","Trainer",Users]].map(([v, l, Icon]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setRole(v)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all
                        ${role === v
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50"}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{l}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="pl-10"
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPass
                      ? <EyeOff className="h-4 w-4" />
                      : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password strength indicator */}
                {password.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300
                            ${i <= strength ? strengthColors[strength] : "bg-secondary"}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {strengthLabels[strength]}
                      {strength === 3 && <span className="text-green-400 ml-1">✓</span>}
                    </p>
                  </div>
                )}
              </div>

              {/* Password requirements hint */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/30 border border-border/50">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Password must be at least <span className="font-semibold text-foreground">8 characters</span> long.
                </p>
              </div>

              {/* Alerts */}
              {error   && <Alert type="error">{error}</Alert>}
              {success && <Alert type="success">{success}</Alert>}

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                size="lg"
                disabled={loading || !!success}
              >
                {loading ? "Creating account…" : "Create Account"}
              </Button>

            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
