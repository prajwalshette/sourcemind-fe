import { useState, useRef, useEffect, useCallback } from "react";
import { Globe, ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SourceSelectorDropdownProps {
  scope: string;
  siteKeys: string[];
  onSelect: (value: string) => void;
  tryShortLabel: (url: string | null) => string;
}

export function SourceSelectorDropdown({
  scope,
  siteKeys,
  onSelect,
  tryShortLabel,
}: SourceSelectorDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const isAll = scope === "";
  const activeSiteKey = scope.startsWith("site:") ? scope.slice(5) : null;

  const filtered = siteKeys.filter(
    (sk) =>
      search === "" ||
      sk.toLowerCase().includes(search.toLowerCase()) ||
      tryShortLabel(sk).toLowerCase().includes(search.toLowerCase())
  );

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setSearch("");
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open, closeDropdown]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  function getFavicon(url: string) {
    try {
      const { origin } = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${origin}&sz=32`;
    } catch {
      return null;
    }
  }

  function getLabel() {
    if (isAll) return "All Sources";
    if (activeSiteKey) return tryShortLabel(activeSiteKey);
    return "Select Source";
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group flex items-center gap-2 h-8 pl-3 pr-2.5 rounded-full border text-[11px] font-semibold transition-all duration-200 select-none cursor-pointer",
          open
            ? "border-primary/60 bg-primary/10 text-primary shadow-sm shadow-primary/20 ring-1 ring-primary/20"
            : "border-border/50 bg-background/50 text-foreground hover:border-primary/40 hover:bg-muted/40"
        )}
      >
        {/* Status dot */}
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0 transition-colors",
            isAll ? "bg-muted-foreground" : "bg-green-500"
          )}
        />
        <span className="max-w-[140px] truncate">{getLabel()}</span>

        {/* Clear button — shown only when a specific source is active */}
        {!isAll && (
          <span
            role="button"
            aria-label="Clear source filter"
            onClick={(e) => {
              e.stopPropagation();
              onSelect("");
              closeDropdown();
            }}
            className="ml-0.5 p-0.5 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <X className="h-3 w-3" />
          </span>
        )}

        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className={cn(
            "absolute right-0 top-[calc(100%+8px)] z-50 w-72 rounded-2xl border border-border/60",
            "bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20",
            "animate-in fade-in slide-in-from-top-2 duration-150"
          )}
        >
          {/* Header */}
          <div className="px-3 pt-3 pb-2 border-b border-border/40">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
              Filter by Source
            </p>
            {/* Search — only visible when there are more than 3 sources */}
            {siteKeys.length > 3 && (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search sources…"
                  className="w-full h-7 pl-7 pr-3 rounded-lg bg-muted/40 border border-border/30 text-[11px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>
            )}
          </div>

          {/* Options list */}
          <div className="p-2 space-y-0.5 max-h-64 overflow-y-auto">
            {/* All Sources option */}
            <button
              type="button"
              onClick={() => { onSelect(""); closeDropdown(); }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-150",
                isAll ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"
              )}
            >
              <span className="h-6 w-6 rounded-lg bg-muted/60 border border-border/40 flex items-center justify-center shrink-0">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold">All Sources</p>
                <p className="text-[10px] text-muted-foreground">Search across everything</p>
              </div>
              {isAll && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
            </button>

            {/* Section label */}
            {filtered.length > 0 && (
              <div className="pt-1 pb-0.5 px-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Indexed Sites
                </p>
              </div>
            )}

            {/* Site options */}
            {filtered.length === 0 && search !== "" ? (
              <p className="text-center text-[11px] text-muted-foreground py-4 opacity-60">
                No matching sites
              </p>
            ) : (
              filtered.map((sk) => {
                const isActive = activeSiteKey === sk;
                const favicon = getFavicon(sk);
                const label = tryShortLabel(sk);
                let hostname = sk;
                try { hostname = new URL(sk).hostname; } catch {}
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => { onSelect(`site:${sk}`); closeDropdown(); }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-150",
                      isActive
                        ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                        : "hover:bg-muted/50 text-foreground"
                    )}
                  >
                    <span className="h-6 w-6 rounded-lg bg-muted/60 border border-border/40 flex items-center justify-center shrink-0 overflow-hidden">
                      {favicon ? (
                        <img
                          src={favicon}
                          alt=""
                          className="h-4 w-4 object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold truncate">{label}</p>
                      <p className="text-[10px] text-muted-foreground truncate opacity-70">{hostname}</p>
                    </div>
                    {isActive && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border/30">
            <p className="text-[9px] text-muted-foreground/50 font-medium">
              {siteKeys.length} source{siteKeys.length !== 1 ? "s" : ""} indexed
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
