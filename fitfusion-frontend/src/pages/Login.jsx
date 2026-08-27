import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert } from "@/components/ui/Alert";
import Navbar from "@/components/Navbar";
import { Activity, Mail, Lock, Eye, EyeOff } from "lucide-react";
import api from "@/services/api";

/* Read role claim from JWT without a library */
function getRoleFromToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1])).role || null;
  } catch { return null; }
}

/* Extract the best error message from any backend response shape */
function extractError(err) {
  if (!err.response) {
    return "Cannot connect to server. Make sure the Spring Boot backend is running on port 8080.";
  }
  const data = err.response.data;
  if (!data) return "Login failed. Please try again.";
  if (data.fields) return Object.values(data.fields).join(" · ");
  if (data.message) return data.message;
  return "Invalid email or password.";
}

export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim())  { setError("Please enter your email address."); return; }
    if (!password)      { setError("Please enter your password.");       return; }

    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", {
        email:    email.trim().toLowerCase(),
        password,
      });

      localStorage.setItem("token", res.data.token);

      /* Redirect based on role stored in JWT */
      const role = getRoleFromToken(res.data.token);
      if (role === "TRAINER") {
        navigate("/trainer");
      } else {
        navigate("/dashboard");
      }
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
            <CardTitle className="font-display text-2xl">Welcome Back</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              Sign in to continue your fitness journey
            </p>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">

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
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPass
                      ? <EyeOff className="h-4 w-4" />
                      : <Eye    className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && <Alert type="error">{error}</Alert>}

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign In"}
              </Button>

            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Create Account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
