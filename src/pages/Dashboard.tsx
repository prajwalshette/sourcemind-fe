import { Link } from "react-router-dom";
import { 
  Globe, 
  FileText, 
  MessageSquare, 
  Zap, 
  ArrowRight, 
  Clock, 
  PlusCircle,
  CheckCircle2,
  Database,
  Search,
  Activity,
  BarChart3,
  MousePointerClick
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { getStoredUser } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

export function Dashboard() {
  const user = getStoredUser();
  const { data, isLoading } = useDashboardStats();
  
  const stats = [
    { 
      label: "Knowledge Base", 
      value: data?.totals?.documents ?? 0, 
      sub: "Indexed URLs",
      icon: Database, 
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "hover:border-blue-500/30"
    },
    { 
      label: "Semantic Chunks", 
      value: data?.totals?.chunks?.toLocaleString() ?? 0, 
      sub: "Vector Embeddings",
      icon: FileText, 
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "hover:border-purple-500/30"
    },
    { 
      label: "AI Queries", 
      value: data?.totals?.queries ?? 0, 
      sub: "Last 30 days",
      icon: Search, 
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "hover:border-amber-500/30"
    },
    { 
      label: "Avg. Latency", 
      value: `${data?.performance?.avgLatencyMs ?? 0}ms`, 
      sub: "System Response",
      icon: Activity, 
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "hover:border-emerald-500/30"
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Hero - Premium Glassmorphism */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary/5 via-background to-background border border-border/50 p-8 lg:p-12 shadow-2xl shadow-primary/5">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -z-10" />
        <div className="relative z-10 space-y-12">
          <div className="space-y-6 lg:col-span-full mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border/50 text-xs font-bold text-primary tracking-wide uppercase shadow-sm w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Intelligence Engine Active
            </div>
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-none flex items-center flex-wrap md:flex-nowrap gap-x-2 whitespace-nowrap mb-4">
              <span className="text-muted-foreground/80">Welcome back,</span>
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                {user?.email?.split("@")[0] ?? "User"}
              </span>
            </div>
            <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">
              Your semantic knowledge base is synced and ready. Process new sites or interrogate your current dataset with natural language.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/dashboard/documents" className={cn(buttonVariants({ size: "lg" }), "rounded-2xl px-10 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform")}>
                <PlusCircle className="mr-2 h-5 w-5" /> Ingest New URL
              </Link>
              <Link to="/dashboard/chat" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-2xl px-10 bg-background/50 backdrop-blur-sm hover:bg-background/80 hover:scale-[1.02] transition-transform")}>
                <MessageSquare className="mr-2 h-5 w-5" /> Start Reasoning
              </Link>
            </div>
          </div>
          
          {/* Quick Metrics - Now Horizontal All in One Line */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className={cn("p-6 rounded-[2rem] bg-card/40 backdrop-blur-sm border border-border/40 space-y-3 transition-all group hover:bg-card/60", stat.border)}>
                <div className={cn("p-2.5 w-fit rounded-2xl mb-1 shadow-sm transition-transform group-hover:scale-110", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tighter">{isLoading ? "..." : stat.value}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Stats & Activity */}
        <div className="lg:col-span-8 space-y-8">

          {/* Activity Chart Section - Custom Visualization */}
          <Card className="border-border/50 shadow-sm bg-card/50 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 px-6 py-4">
              <div className="space-y-0.5">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" /> System Utilization
                </CardTitle>
                <p className="text-xs text-muted-foreground font-medium">Daily ingestion & query volume (7d)</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" /> Documents
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-400" /> Queries
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[200px] flex items-end justify-between gap-2 md:gap-4 px-2">
                {isLoading ? (
                  Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex-1 bg-muted animate-pulse rounded-t-lg" style={{ height: `${20 + i * 10}%` }} />
                  ))
                ) : (
                  data?.activity.map((day, i) => {
                    const maxVal = Math.max(...data.activity.map(d => Math.max(d.docs, d.queries)), 1);
                    const docHeight = `${(day.docs / maxVal) * 100}%`;
                    const queryHeight = `${(day.queries / maxVal) * 100}%`;
                    
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full">
                        <div className="flex-1 w-full flex items-end justify-center gap-1 relative">
                          <div 
                            className="w-1/3 bg-primary rounded-t-md transition-all duration-500 group-hover:bg-primary/80" 
                            style={{ height: docHeight }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded border shadow-sm whitespace-nowrap z-20">
                              {day.docs} docs
                            </div>
                          </div>
                          <div 
                            className="w-1/3 bg-blue-400 rounded-t-md transition-all duration-500 group-hover:bg-blue-400/80" 
                            style={{ height: queryHeight }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded border shadow-sm whitespace-nowrap translate-y-[-100%] z-20">
                              {day.queries} queries
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase rotate-[-45deg] md:rotate-0 mt-2">
                          {new Date(day.date).toLocaleDateString([], { weekday: 'short' })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Documents Table-ish View */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Recently Ingested
              </h3>
              <Link to="/dashboard/documents" className="text-xs font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-wider">
                Browse Repository <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 w-full animate-pulse bg-muted rounded-2xl" />
                ))
              ) : data?.recentDocuments?.length ? (
                data.recentDocuments.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="group bg-card/30 hover:bg-card border border-border/40 hover:border-primary/30 rounded-2xl p-4 transition-all duration-300 flex items-center gap-4"
                  >
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border border-border/50 shadow-inner",
                      doc.status === "INDEXED" ? "bg-emerald-500/5 text-emerald-500" : "bg-amber-500/5 text-amber-500"
                    )}>
                      {doc.status === "INDEXED" ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <Activity className="h-6 w-6 animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate text-foreground mb-0.5">{doc.title || "Untitled Document"}</h4>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                        <Globe className="h-3 w-3 opacity-60" /> {new URL(doc.url).hostname}
                        <span className="h-1 w-1 rounded-full bg-border" />
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-tighter uppercase",
                        doc.status === "INDEXED" 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      )}>
                        {doc.status}
                      </span>
                      <Link 
                        to={`/dashboard/documents/${doc.id}`} 
                        className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 uppercase"
                      >
                        Inspect <ArrowRight className="h-2 w-2" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center bg-card/20 rounded-3xl border border-dashed border-border/50">
                  <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                    <Database className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <h4 className="font-bold text-lg">No documents yet</h4>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
                    Connect your first URL to begin building your semantic knowledge base.
                  </p>
                  <Link to="/dashboard/documents" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl")}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Source
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Secondary Actions & Health */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Quick Stats Sidebar */}
          <Card className="border-border/50 shadow-sm overflow-hidden bg-gradient-to-b from-card to-background">
            <CardHeader className="p-5 border-b border-border/50">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Pulse Check</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                <div className="p-5 flex items-center justify-between group cursor-help">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <Zap className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">Cache Hit Rate</span>
                  </div>
                  <span className="text-sm font-bold">{data?.performance?.cacheHitRate ?? 0}%</span>
                </div>
                <div className="p-5 flex items-center justify-between group cursor-help">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">Turn History</span>
                  </div>
                  <span className="text-sm font-bold">{data?.totals?.sessions ?? 0} chats</span>
                </div>
                <div className="p-5 flex items-center justify-between group cursor-help">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                      <Activity className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">API Health</span>
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-500 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Operational</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-2">Knowledge Tips</h3>
            <div className="space-y-3">
              {[
                { 
                  title: "Multi-Source Queries", 
                  desc: "Select multiple sources in chat to bridge concepts across different websites.",
                  icon: Globe,
                  color: "bg-blue-500/5 text-blue-500"
                },
                { 
                  title: "Semantic Filtering", 
                  desc: "Use the intelligence layer to automatically filter out noise from large documents.",
                  icon: Zap,
                  color: "bg-amber-500/5 text-amber-500"
                },
                { 
                  title: "Crawl Scope", 
                  desc: "Site-wide crawls capture up to 50 relevant pages to ensure context depth.",
                  icon: Database,
                  color: "bg-purple-500/5 text-purple-500"
                }
              ].map((tip, i) => (
                <div key={i} className="p-4 rounded-2xl bg-card border border-border/40 hover:border-primary/20 transition-all group">
                  <div className={cn("p-2 w-fit rounded-lg mb-3 shadow-sm", tip.color)}>
                    <tip.icon className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">{tip.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Card */}
          <div className="rounded-[2rem] bg-gradient-to-br from-primary to-blue-600 p-8 text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 space-y-4">
              <MousePointerClick className="h-8 w-8 opacity-80" />
              <h4 className="text-xl font-bold leading-tight">Ready to expand your intelligence?</h4>
              <p className="text-sm text-white/80 leading-relaxed uppercase tracking-tighter font-medium">Add a new site to your database in seconds.</p>
              <Link to="/dashboard/documents" className="flex items-center justify-center w-full py-3 bg-white text-primary rounded-xl font-bold text-sm hover:bg-white/90 transition-colors shadow-lg">
                Quick Ingest
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
