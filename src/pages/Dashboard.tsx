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
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocuments } from "@/hooks/useDocuments";
import { getStoredUser } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

export function Dashboard() {
  const user = getStoredUser();
  const { data, isLoading } = useDocuments({ limit: 5 });
  
  const stats = [
    { 
      label: "Total Documents", 
      value: data?.pagination?.total ?? 0, 
      icon: FileText, 
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    { 
      label: "Active Sources", 
      value: new Set(data?.documents?.map(d => d.siteKey)).size || 0, 
      icon: Globe, 
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    { 
      label: "Capabilities", 
      value: "4+", 
      icon: Zap, 
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
  ];

  return (
    <div className="space-y-10 pb-10">
      {/* Welcome Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-card border border-border/50 p-8 lg:p-12 shadow-xl shadow-primary/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary tracking-wide uppercase">
            <Zap className="h-3 w-3" /> System Operational
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
            Welcome back, <span className="text-primary">{user?.email?.split("@")[0] ?? "User"}</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Your semantic intelligence is ready. Ingest new information or query your existing knowledge base.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/dashboard/documents" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 shadow-lg shadow-primary/20")}>
              <PlusCircle className="mr-2 h-5 w-5" /> Ingest URL
            </Link>
            <Link to="/dashboard/chat" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-8 bg-background/50 backdrop-blur-sm")}>
              <MessageSquare className="mr-2 h-5 w-5" /> Start Chat
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border/50 shadow-lg shadow-black/5 hover:border-primary/20 transition-all group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <div className={cn("p-2 rounded-xl group-hover:scale-110 transition-transform", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "---" : stat.value}</div>
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Real-time status update
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Recent Documents
            </h3>
            <Link to="/dashboard/documents" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-20 w-full animate-pulse bg-muted rounded-2xl" />
              ))
            ) : data?.documents?.length ? (
              data.documents.map((doc) => (
                <div 
                  key={doc.id} 
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all hover:shadow-md"
                >
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border border-border/50",
                    doc.status === "INDEXED" ? "bg-green-500/5" : "bg-amber-500/5"
                  )}>
                    {doc.status === "INDEXED" ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                      {doc.title || doc.url}
                    </p>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      <Globe className="h-3 w-3" /> {new URL(doc.url).hostname}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase">Status</p>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      doc.status === "INDEXED" ? "text-green-500" : "text-amber-500"
                    )}>
                      {doc.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 rounded-2xl border border-dashed border-border bg-muted/20 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">No documents yet.</p>
                <p className="text-xs text-muted-foreground/60 mb-6">Ingest your first URL to get started.</p>
                <Link to="/dashboard/documents" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add URL
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips / Explore */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold tracking-tight px-2">Quick Tips</h3>
          <div className="space-y-4">
            {[
              { 
                title: "Semantic Queries", 
                desc: "Try asking 'How does X work?' instead of keyword searching.",
                icon: MessageSquare
              },
              { 
                title: "Source Isolation", 
                desc: "Scope your chat to specific documents for cleaner results.",
                icon: Zap
              },
              { 
                title: "Real-time Indexing", 
                desc: "Documents are processed into vectors instantly upon ingestion.",
                icon: Globe
              }
            ].map((tip, i) => (
              <div key={i} className="p-5 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
                <div className="p-2 w-fit rounded-lg bg-background border border-border/40 mb-3">
                  <tip.icon className="h-4 w-4 text-primary" />
                </div>
                <h4 className="font-bold text-sm mb-1">{tip.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
