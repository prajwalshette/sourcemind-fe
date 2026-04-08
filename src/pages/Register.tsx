import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Network, Shield, ArrowRight, Zap, CheckCircle2, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/hooks/useAuth";

export function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const register = useRegister();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    try {
      await register.mutateAsync({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : "Registration failed";
      register.reset();
      alert(message ?? "Registration failed");
    }
  };

  return (
    <div className="min-h-svh flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Left Side: Brand Storytelling */}
      <div className="hidden md:flex md:w-1/2 relative bg-muted/30 items-center justify-center p-12 overflow-hidden border-r border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/15 via-background to-background -z-10" />
        
        {/* Animated background elements */}
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="max-w-md space-y-8 relative z-10">
          <div className="flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Network className="h-8 w-8 text-primary" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-foreground">SourceMind</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground animate-in fade-in slide-in-from-left-6 duration-700">
              Join the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                Intelligence Revolution
              </span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed animate-in fade-in slide-in-from-left-8 duration-700 delay-150">
              Start building your personal semantic brain today. Secure, private, and blazingly fast.
            </p>
          </div>

          <div className="space-y-4 pt-8 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            {[
              { icon: Shield, label: "Private & Secure by Design", description: "Your data is strictly isolated and encrypted." },
              { icon: Zap, label: "Instant Semantic Search", description: "Get answers from your sources in milliseconds." },
              { icon: CheckCircle2, label: "Multi-Source Integration", description: "Connect all your information in one place." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-background/50 border border-border/50 backdrop-blur-sm transition-all hover:bg-background/80 group">
                <div className="mt-1">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{item.label}</h3>
                  <p className="text-muted-foreground text-xs">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background md:hidden -z-10" />
        
        <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in-95 duration-500">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 md:hidden mb-8">
            <Network className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-foreground">SourceMind</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Create account</h2>
            <p className="text-muted-foreground">
              Sign up to start organizing your knowledge
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl bg-background/50 border-input transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 rounded-xl pr-12 bg-background/50 border-input transition-all focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-12 hover:bg-transparent text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Must be at least 8 characters long.
              </p>
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all hover:translate-y-[ -1px] active:translate-y-[0px]" 
              disabled={register.isPending}
            >
              {register.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or sign up with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-11 rounded-xl border-border bg-background/50 backdrop-blur-sm transition-all hover:bg-muted/50">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button variant="outline" className="h-11 rounded-xl border-border bg-background/50 backdrop-blur-sm transition-all hover:bg-muted/50">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.16H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.84l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>

        <Link 
          to="/" 
          className="absolute top-6 left-6 md:hidden lg:flex lg:left-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
