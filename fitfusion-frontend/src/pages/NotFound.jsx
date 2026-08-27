import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Activity, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="mx-auto p-4 rounded-2xl bg-primary/10 w-fit mb-6">
          <Activity className="h-12 w-12 text-primary" />
        </div>
        <h1 className="font-display text-7xl font-bold gradient-text mb-4">404</h1>
        <h2 className="font-display text-2xl font-bold mb-3">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="hero" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Go Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="glass">Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
