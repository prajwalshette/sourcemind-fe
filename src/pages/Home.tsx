import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { getStoredToken, useLogout } from "@/hooks/useAuth";
import { Globe, FileText, Youtube, Github, ArrowRight, Network, Zap, Shield } from "lucide-react";

export function Home() {
  const isLoggedIn = !!getStoredToken();
  const logout = useLogout();
  const sources = [
    {
      title: "Websites",
      description: "Ingest content from any public URL, articles, and blogs instantly.",
      icon: <Globe className="w-6 h-6 text-blue-500" />,
      comingSoon: false
    },
    {
      title: "Documents",
      description: "Upload and analyze PDFs, Word docs, and plain text files with ease.",
      icon: <FileText className="w-6 h-6 text-amber-500" />,
      comingSoon: true
    },
    {
      title: "YouTube Videos",
      description: "Extract transcripts and semantic meaning directly from video links.",
      icon: <Youtube className="w-6 h-6 text-red-500" />,
      comingSoon: true
    },
    {
      title: "GitHub Repos",
      description: "Index entire codebases and documentation for deep technical querying.",
      icon: <Github className="w-6 h-6 text-foreground" />,
      comingSoon: true
    }
  ];

  return (
    <div className="flex flex-col min-h-svh bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight text-foreground">SourceMind</span>
          </div>
          <nav className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <Button variant="outline" size="sm" className="rounded-full" onClick={logout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Log in
                </Link>
                <Link to="/register" className={cn(buttonVariants(), "rounded-full px-6")}>
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background -z-10" />
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Zap className="mr-2 h-4 w-4" /> Signals multi-source intelligence
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 text-foreground animate-in fade-in slide-in-from-bottom-6 duration-700">
              Your Universal <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                Knowledge Engine
              </span>
            </h1>
            <p className="mx-auto max-w-[42rem] mb-10 text-muted-foreground sm:text-xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
              Unify your scattered intelligence. Connect websites, documents, videos, and codebases into a single semantic brain that answers your questions instantly.
            </p>
            <div className="flex flex-row flex-wrap justify-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Link to="/register" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-5 sm:px-8 h-14 text-sm sm:text-base")}>
                Start for free <ArrowRight className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
              <Link to="/login" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "rounded-full px-6 sm:px-8 h-14 text-sm sm:text-base bg-background/50 backdrop-blur-md")}>
                View Demo
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-muted/30 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Connect Any Data Source</h2>
              <p className="text-muted-foreground text-lg">
                SourceMind seamlessly digests unstructured information across platforms, making it instantly queryable via natural language.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sources.map((source, index) => (
                <div 
                  key={index} 
                  className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 duration-300"
                >
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                    {source.icon}
                  </div>
                  {source.comingSoon && (
                    <div className="absolute right-6 top-6">
                      <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                        Coming soon
                      </span>
                    </div>
                  )}
                  <h3 className="mb-3 text-xl font-semibold text-foreground">
                    {source.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {source.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Prop Section */}
        <section className="py-24 border-b border-border/50 relative overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-primary/5 to-transparent -z-10" />
          <div className="container mx-auto px-4">
            <div className="flex justify-center mb-12">
              <Shield className="w-16 h-16 text-primary opacity-80" />
            </div>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight mb-6">Secure & Private by Design</h2>
              <p className="text-muted-foreground text-lg mb-10">
                Your data remains yours. Multi-tenant architecture ensures strict isolation of your vectorized intelligence. Stop searching, start knowing.
              </p>
              <Link to="/register" className={cn(buttonVariants({ size: "lg" }), "rounded-full shadow-lg shadow-primary/20")}>
                Create your workspace
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-border bg-card">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground">SourceMind</span>
          </div>
          <p className="text-sm text-balance text-center text-muted-foreground leading-loose">
            Built for multi-source intelligence ingestion and retrieval.
          </p>
          <div className="flex gap-4">
            <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
            <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
