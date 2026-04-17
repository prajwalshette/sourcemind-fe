import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Network, LayoutDashboard, FileText, MessageSquare, LogOut, Menu, X, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout, getStoredUser } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function Layout() {
  const user = getStoredUser();
  const logout = useLogout();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Sources", path: "/dashboard/sources", icon: FileText },
    { label: "AI Chat", path: "/dashboard/chat", icon: MessageSquare },
  ];

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        onClick={() => setIsSidebarOpen(false)}
        title={isCollapsed ? item.label : undefined}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group overflow-hidden shrink-0 relative",
          isActive 
            ? "bg-primary text-primary-foreground shadow-[0_0_20px_-5px_rgba(var(--primary-rgb),0.5)]" 
            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
          isCollapsed && "justify-center px-0 w-12 mx-auto"
        )}
      >
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
        )}
        <item.icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
        {!isCollapsed && <span className="flex-1 truncate relative z-10">{item.label}</span>}
        {!isCollapsed && isActive && <ChevronRight className="h-4 w-4 opacity-50 shrink-0 relative z-10" />}
      </Link>
    );
  };

  return (
    <div className="h-svh flex bg-background text-foreground overflow-hidden">
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 bg-card border-r border-border/50 transition-all duration-300 ease-in-out transform lg:translate-x-0 lg:static flex flex-col overflow-x-hidden",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "lg:w-20" : "lg:w-72"
      )}>
        <div className={cn("flex flex-col h-full relative transition-all duration-300", isCollapsed ? "p-4" : "p-6")}>
          {/* Logo */}
          <div className={cn("flex items-center gap-3 mb-12", isCollapsed ? "justify-center" : "")}>
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
              <Network className="h-6 w-6 text-primary" />
            </div>
            {!isCollapsed && <span className="font-bold text-xl tracking-tight truncate">SourceMind</span>}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden ml-auto shrink-0" 
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Desktop Collapse Toggle */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute top-8 -right-3 h-6 w-6 rounded-full border border-border bg-card items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all shadow-sm z-10"
          >
            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </button>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            <p className={cn(
              "px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-4 truncate",
              isCollapsed && "text-center px-0 opacity-0"
            )}>
              {isCollapsed ? "" : "Main Menu"}
            </p>
            {navItems.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </nav>

          {/* Bottom Sidebar - User / Actions */}
          <div className={cn("mt-auto pt-6 border-t border-border/50 space-y-4", isCollapsed && "border-none px-0")}>
            <div className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl bg-muted/30 border border-border/40 backdrop-blur-sm overflow-hidden",
              isCollapsed && "justify-center px-0 border-none bg-transparent"
            )}>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center border border-primary/10 shrink-0">
                <span className="font-bold text-primary text-xs shrink-0">
                  {user?.email?.[0].toUpperCase() ?? "U"}
                </span>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-foreground">
                    {user?.email?.split("@")[0] ?? "User"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {user?.email ?? "Not logged in"}
                  </p>
                </div>
              )}
            </div>
            <Button 
              variant="ghost" 
              onClick={logout}
              title={isCollapsed ? "Log Out" : undefined}
              className={cn(
                "w-full justify-start gap-3 px-4 py-3 text-red-500 hover:text-red-600 hover:bg-red-500/5 rounded-xl transition-colors group",
                isCollapsed && "justify-center px-0"
              )}
            >
              <LogOut className={cn("h-5 w-5 transition-transform group-hover:-translate-x-1 shrink-0")} />
              {!isCollapsed && <span className="text-sm font-medium truncate">Log Out</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

        {/* Mobile Menu Trigger (Floating) */}
        {!isSidebarOpen && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 left-4 z-40 lg:hidden bg-background/50 backdrop-blur-md border border-border/40 rounded-full shadow-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <main className="flex-1 overflow-y-auto p-6 lg:p-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
