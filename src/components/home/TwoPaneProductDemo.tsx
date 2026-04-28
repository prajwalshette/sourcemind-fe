import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FileText, Github, Globe, MessageSquare, Send, Trash2, UploadCloud, Youtube, Zap } from "lucide-react";
import { SourceSelectorDropdown } from "@/components/chat/SourceSelectorDropdown";

type DemoMode = "website" | "file";
type Phase =
  | "idle"
  | "type_source"
  | "submit"
  | "index_pending"
  | "index_crawling"
  | "index_embedding"
  | "index_indexed"
  | "chat_input_typing"
  | "chat_send_click"
  | "chat_answer_stream";

type DocStatus = "PENDING" | "CRAWLING" | "EMBEDDING" | "INDEXED";

const websiteUrl = "https://docs.docker.com/get-started/";
const pdfName = "SourceMind-Product-Overview.pdf";
const question = "How do I install Docker Desktop on macOS?";
const answer =
  "Install Docker Desktop by downloading it from Docker’s official site, then run the installer and sign in if required. After installation, you can verify it with `docker --version` and start running containers locally.";

function useTypewriter(text: string, enabled: boolean, speedMs = 16) {
  const [value, setValue] = useState("");
  const iRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    iRef.current = 0;
    setValue("");
    const id = window.setInterval(() => {
      iRef.current += 1;
      setValue(text.slice(0, iRef.current));
      if (iRef.current >= text.length) window.clearInterval(id);
    }, speedMs);
    return () => window.clearInterval(id);
  }, [text, enabled, speedMs]);

  return value;
}

function StatusPill({ status }: { status: DocStatus }) {
  const cls =
    status === "INDEXED"
      ? "bg-green-500/10 text-green-600 dark:text-green-400"
      : status === "EMBEDDING"
        ? "bg-purple-500/10 text-purple-400"
        : status === "CRAWLING"
          ? "bg-amber-500/10 text-amber-500"
          : "bg-muted text-muted-foreground";
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", cls)}>
      {status}
    </span>
  );
}

function WindowChrome() {
  return (
    <div className="flex items-center gap-2 px-5 py-3 border-b border-border/40 bg-background/40 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-red-500/50 border border-red-500/30" />
        <span className="h-3 w-3 rounded-full bg-amber-500/50 border border-amber-500/30" />
        <span className="h-3 w-3 rounded-full bg-green-500/50 border border-green-500/30" />
      </div>
      <div className="flex-1" />
      <span className="text-[10px] font-semibold text-muted-foreground/70">SourceMind · Live demo</span>
    </div>
  );
}

function ClickHandIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* click rays */}
      <path
        d="M12 2.5v2.2M4.8 5.3l1.55 1.55M19.2 5.3l-1.55 1.55M2.5 12h2.2M19.3 12h2.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* pointing hand (simple outline) */}
      <path
        d="M10.2 11.2V6.9c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6v5.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.4 12.5V8.9c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6v4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.6 13.2v-2.2c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6v4.7c0 3.1-2.3 5.8-5.5 6.2l-1.2.2c-2.8.4-5.3-1.4-6.1-4.1l-1.1-3.8c-.25-.9.25-1.8 1.15-2.05.9-.25 1.8.25 2.05 1.15l.6 2.1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TwoPaneProductDemo() {
  const [mode, setMode] = useState<DemoMode>("website");
  const [phase, setPhase] = useState<Phase>("idle");
  const [isPlaying, setIsPlaying] = useState(true);
  const [started, setStarted] = useState(false);
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const [scope, setScope] = useState<string>("");
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState(false);
  const [pointerTarget, setPointerTarget] = useState<"add" | "tile" | "ingest" | "send" | "none">("add");
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: true,
  });

  const windowRef = useRef<HTMLDivElement>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const websiteTileRef = useRef<HTMLButtonElement>(null);
  const fileTileRef = useRef<HTMLButtonElement>(null);
  const ingestBtnRef = useRef<HTMLButtonElement>(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);
  const lastAutoActionRef = useRef<string>("");

  const targetSource = mode === "website" ? websiteUrl : pdfName;
  const typedSource = useTypewriter(targetSource, phase === "type_source" && isPlaying, 12);
  const typedQ = useTypewriter(question, phase === "chat_input_typing" && isPlaying, 16);
  const typedA = useTypewriter(answer, phase === "chat_answer_stream" && isPlaying, 10);

  // Start in a clean state (no panel) on mount
  useEffect(() => {
    setStarted(false);
    setAddPanelOpen(false);
    setPhase("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-start the demo (simulate a click)
  useEffect(() => {
    if (started) return;
    const id = window.setTimeout(() => {
      setStarted(true);
      setIsPlaying(true);
      setMode("website");
      setAddPanelOpen(true);
      setPhase("type_source");
    }, 900);
    return () => window.clearTimeout(id);
  }, [started]);

  // Make the pointer "click" actually execute actions (once per step)
  useEffect(() => {
    if (!isPlaying) return;

    // Click 1: Add Source
    if (!started && pointerTarget === "add") {
      const key = "auto:add";
      if (lastAutoActionRef.current === key) return;
      lastAutoActionRef.current = key;
      setStarted(true);
      setMode("website");
      setAddPanelOpen(true);
      setPhase("type_source");
      return;
    }

    // Click 2: select tile (website/pdf) — we just ensure mode is correct for this cycle
    if (started && addPanelOpen && pointerTarget === "tile" && phase === "type_source") {
      const key = `auto:tile:${mode}`;
      if (lastAutoActionRef.current === key) return;
      lastAutoActionRef.current = key;
      setMode((m) => m); // no-op, but marks this step as "clicked"
      return;
    }

    // Click 3: Ingest Source (advance immediately when typing done)
    if (
      started &&
      addPanelOpen &&
      pointerTarget === "ingest" &&
      phase === "type_source" &&
      typedSource.length >= targetSource.length
    ) {
      const key = `auto:ingest:${mode}`;
      if (lastAutoActionRef.current === key) return;
      lastAutoActionRef.current = key;
      setPhase("submit");
    }

    // Click 4: Send (after question typed in input)
    if (
      started &&
      !addPanelOpen &&
      pointerTarget === "send" &&
      phase === "chat_input_typing" &&
      typedQ.length >= question.length
    ) {
      const key = `auto:send:${mode}`;
      if (lastAutoActionRef.current === key) return;
      lastAutoActionRef.current = key;
      setPhase("chat_send_click");
      // small delay for "click" feel then start streaming answer
      window.setTimeout(() => setPhase("chat_answer_stream"), 250);
    }
  }, [
    addPanelOpen,
    isPlaying,
    mode,
    phase,
    pointerTarget,
    question.length,
    started,
    targetSource.length,
    typedQ.length,
    typedSource.length,
  ]);

  // Pointer choreography (visual clicks)
  useEffect(() => {
    if (!started) {
      setPointerTarget("add");
      return;
    }

    if (addPanelOpen) {
      if (phase === "type_source") {
        // Click a tile first, then click ingest once typing is complete.
        setPointerTarget(typedSource.length >= targetSource.length ? "ingest" : "tile");
        return;
      }
      setPointerTarget("ingest");
      return;
    }

    if (phase === "chat_input_typing") {
      // wait until typing completes then click send
      setPointerTarget(typedQ.length >= question.length ? "send" : "none");
      return;
    }
    if (phase === "chat_send_click") {
      setPointerTarget("send");
      return;
    }

    // Hide pointer during indexing + chat.
    setPointerTarget("none");
  }, [addPanelOpen, phase, question.length, started, targetSource.length, typedQ.length, typedSource.length]);

  // Compute pointer position relative to demo window
  useEffect(() => {
    const root = windowRef.current;
    if (!root) return;

    const pickEl = () => {
      if (pointerTarget === "add") return addBtnRef.current;
      if (pointerTarget === "tile") return mode === "website" ? websiteTileRef.current : fileTileRef.current;
      if (pointerTarget === "ingest") return ingestBtnRef.current;
      if (pointerTarget === "send") return sendBtnRef.current;
      return null;
    };

    const el = pickEl();
    if (!el || pointerTarget === "none") {
      setPointerPos((p) => ({ ...p, visible: false }));
      return;
    }

    const place = () => {
      const rootRect = root.getBoundingClientRect();
      const r = el.getBoundingClientRect();

      // Place pointer slightly above-right of element center.
      const x = r.left - rootRect.left + r.width * 0.65;
      const y = r.top - rootRect.top + r.height * 0.35;

      setPointerPos({ x, y, visible: true });
    };

    // Defer to ensure layout is committed (useful when panels animate in)
    const raf = requestAnimationFrame(place);
    const onResize = () => place();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [mode, pointerTarget]);

  const status: DocStatus = useMemo(() => {
    if (
      phase === "index_indexed" ||
      phase === "chat_input_typing" ||
      phase === "chat_send_click" ||
      phase === "chat_answer_stream"
    )
      return "INDEXED";
    if (phase === "index_embedding") return "EMBEDDING";
    if (phase === "index_crawling") return "CRAWLING";
    if (phase === "index_pending" || phase === "submit") return "PENDING";
    return "PENDING";
  }, [phase]);

  const doc = useMemo(() => {
    const isSite = mode === "website";
    const url = isSite ? websiteUrl : `file://${pdfName}`;
    const title = isSite ? "Docker Docs — Get started" : "SourceMind Product Overview";

    const chunkCount =
      phase === "index_indexed" ||
      phase === "chat_input_typing" ||
      phase === "chat_send_click" ||
      phase === "chat_answer_stream"
        ? 128
        : phase === "index_embedding"
          ? 76
          : phase === "index_crawling"
            ? 12
            : 0;

    const tokenCount =
      phase === "index_indexed" ||
      phase === "chat_input_typing" ||
      phase === "chat_send_click" ||
      phase === "chat_answer_stream"
        ? 84210
        : phase === "index_embedding"
          ? 40210
          : phase === "index_crawling"
            ? 3110
            : 0;

    return { id: "demo-1", url, title, status, chunkCount, tokenCount };
  }, [mode, phase, status]);

  const sourcesForDropdown = useMemo(
    () => [
      { key: websiteUrl, sourceType: "WEBSITE" as const, title: "Docker Docs — Get started" },
      { key: `file://${pdfName}`, sourceType: "FILE" as const, title: "SourceMind Product Overview", fileType: "PDF" },
    ],
    [mode],
  );

  function tryShortLabel(url: string | null): string {
    if (!url) return "Unknown Source";
    if (url.startsWith("file://")) return url.replace(/^file:\/\//, "").slice(0, 24) + "…";
    try {
      const u = new URL(url);
      const path = u.pathname === "/" ? "" : u.pathname;
      const label = `${u.hostname}${path}`;
      return label.length > 40 ? `${label.slice(0, 40)}…` : label;
    } catch {
      return url.slice(0, 35) + (url.length > 35 ? "…" : "");
    }
  }

  // Scripted timeline (like a product-video)
  useEffect(() => {
    if (!isPlaying) return;
    if (!started) return;

    const schedule = (next: Phase, ms: number) => window.setTimeout(() => setPhase(next), ms);

    if (phase === "submit") {
      const id = schedule("index_pending", 650);
      return () => window.clearTimeout(id);
    }
    if (phase === "index_pending") {
      setAddPanelOpen(false);
      setSelected(true);
      setExpanded(true);
      setScope(`site:${mode === "website" ? websiteUrl : `file://${pdfName}`}`);
      const id = schedule("index_crawling", 900);
      return () => window.clearTimeout(id);
    }
    if (phase === "index_crawling") {
      const id = schedule("index_embedding", 1100);
      return () => window.clearTimeout(id);
    }
    if (phase === "index_embedding") {
      const id = schedule("index_indexed", 1100);
      return () => window.clearTimeout(id);
    }
    if (phase === "index_indexed") {
      const id = schedule("chat_input_typing", 700);
      return () => window.clearTimeout(id);
    }
  }, [isPlaying, phase, started, mode]);

  // Auto-rotate: Website run → PDF run → repeat
  useEffect(() => {
    if (!isPlaying) return;
    if (phase !== "chat_answer_stream") return;
    if (typedA.length < answer.length) return;
    if (!started) return;

    const id = window.setTimeout(() => {
      setScope("");
      setExpanded(false);
      setSelected(false);
      setMode((m) => (m === "website" ? "file" : "website"));
      setPhase("type_source");
      setAddPanelOpen(true);
    }, 1400);

    return () => window.clearTimeout(id);
  }, [answer.length, isPlaying, phase, typedA.length, started]);

  return (
    <section className="py-24 border-b border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
            <Zap className="mr-2 h-4 w-4" /> See it working (UI demo)
          </div>
        </div>

        {/* Window container */}
        <div
          ref={windowRef}
          className="relative rounded-[2rem] border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden shadow-2xl shadow-primary/5"
        >
          <WindowChrome />

          {/* Two sections (like real app): Sources + Chat */}
          <div className="p-5 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Sources */}
            <div className="rounded-3xl border border-border/50 bg-background/30 overflow-hidden flex flex-col min-h-[560px]">
              <div className="p-4 border-b border-border/40 bg-background/30 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sources</p>
                  <p className="text-sm font-semibold mt-1">Indexed sources</p>
                </div>
                <Button
                  type="button"
                  className={cn("rounded-full", !started && "animate-pulse")}
                  ref={addBtnRef}
                  onClick={() => {
                    setStarted(true);
                    setIsPlaying(true);
                    setAddPanelOpen(true);
                    setPhase("type_source");
                  }}
                >
                  Add Source
                </Button>
              </div>

              <div className="p-4 space-y-4 flex-1 min-h-0">
                {/* Inline Add Source panel (no overlay modal) */}
                {addPanelOpen && (
                  <div className="rounded-3xl border border-border/60 bg-card p-4 lg:p-5 shadow-xl shadow-black/10 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold flex items-center gap-2">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-muted">
                            <UploadCloud className="h-4 w-4 text-primary" />
                          </span>
                          Add Source
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Demo panel (no API calls). Click ingest to start indexing.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => {
                          setAddPanelOpen(false);
                          setIsPlaying(true);
                          setPhase("submit");
                        }}
                      >
                        Close
                      </Button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setMode("website");
                          setPhase("type_source");
                        }}
                        ref={websiteTileRef}
                        className={cn(
                          "group relative overflow-hidden rounded-3xl border bg-card p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/5",
                          mode === "website" ? "border-primary/30 ring-2 ring-primary/20" : "border-border hover:border-primary/20",
                        )}
                      >
                        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-muted transition-all duration-300 group-hover:bg-primary/10 group-hover:scale-110">
                          <Globe className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="text-sm font-semibold text-foreground">Website</div>
                        <div className="text-xs text-muted-foreground">URL crawl</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMode("file");
                          setPhase("type_source");
                        }}
                        ref={fileTileRef}
                        className={cn(
                          "group relative overflow-hidden rounded-3xl border bg-card p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/5",
                          mode === "file" ? "border-primary/30 ring-2 ring-primary/20" : "border-border hover:border-primary/20",
                        )}
                      >
                        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-muted transition-all duration-300 group-hover:bg-primary/10 group-hover:scale-110">
                          <FileText className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="text-sm font-semibold text-foreground">Files</div>
                        <div className="text-xs text-muted-foreground">Upload docs</div>
                      </button>

                      <button
                        type="button"
                        disabled
                        className={cn(
                          "group relative overflow-hidden rounded-3xl border bg-card p-4 text-left transition-all duration-300 border-border",
                          "opacity-60 cursor-not-allowed",
                        )}
                      >
                        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-muted transition-all duration-300">
                          <Youtube className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="text-sm font-semibold text-foreground">YouTube</div>
                        <div className="text-xs text-muted-foreground">Video link</div>
                        <div className="absolute right-4 top-4">
                          <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                            Coming soon
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        disabled
                        className={cn(
                          "group relative overflow-hidden rounded-3xl border bg-card p-4 text-left transition-all duration-300 border-border",
                          "opacity-60 cursor-not-allowed",
                        )}
                      >
                        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-muted transition-all duration-300">
                          <Github className="h-5 w-5 text-foreground" />
                        </div>
                        <div className="text-sm font-semibold text-foreground">GitHub</div>
                        <div className="text-xs text-muted-foreground">Repo index</div>
                        <div className="absolute right-4 top-4">
                          <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                            Coming soon
                          </span>
                        </div>
                      </button>
                    </div>

                    <div className="mt-5 space-y-2">
                      <label className="text-sm font-bold text-foreground">
                        {mode === "website" ? "Website URL" : "PDF file"}
                      </label>
                      <Input
                        value={phase === "type_source" ? typedSource : ""}
                        readOnly
                        className="rounded-xl border-border/80 focus-visible:ring-primary h-11 font-mono text-[12px]"
                        placeholder={mode === "website" ? "https://example.com" : "Choose a file…"}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => {
                          setAddPanelOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        className="rounded-xl font-bold"
                        ref={ingestBtnRef}
                        onClick={() => {
                          setIsPlaying(true);
                          setPhase("submit");
                        }}
                      >
                        Ingest Source
                      </Button>
                    </div>
                  </div>
                )}

                {!addPanelOpen && (
                  <div className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-left text-sm text-muted-foreground">
                          <th className="w-10 p-3">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => setSelected((v) => !v)}
                              aria-label="Select source"
                              className="h-4 w-4 rounded border-input"
                            />
                          </th>
                          <th className="p-3">Source URL</th>
                          <th className="p-3">Title</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Chunks / Tokens</th>
                          <th className="p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className={cn("group transition-colors border-b border-border hover:bg-muted/10", expanded && "border-l-2 border-l-primary bg-muted/30")}>
                          <td className="w-10 p-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => setSelected((v) => !v)}
                                aria-label={`Select ${doc.title}`}
                                className="h-4 w-4 rounded border-input"
                              />
                              <button
                                type="button"
                                onClick={() => setExpanded((v) => !v)}
                                className="rounded p-1 text-muted-foreground transition-transform duration-200 hover:bg-muted"
                                aria-label="Expand"
                              >
                                <span className={cn("inline-block transition-transform", expanded && "rotate-90")}>›</span>
                              </button>
                            </div>
                          </td>
                          <td className="p-3 text-sm">
                            <a
                              href={doc.url.startsWith("file://") ? "#" : doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="break-all text-primary underline"
                              onClick={(e) => {
                                if (doc.url.startsWith("file://")) e.preventDefault();
                              }}
                            >
                              {doc.url}
                            </a>
                          </td>
                          <td className="p-3 text-sm">{doc.title}</td>
                          <td className="p-3">
                            <StatusPill status={doc.status} />
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {doc.chunkCount} / {doc.tokenCount.toLocaleString()}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" disabled className="rounded-xl">
                                Reindex
                              </Button>
                              <Button variant="destructive" size="sm" disabled className="rounded-xl">
                                <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                              </Button>
                            </div>
                          </td>
                        </tr>

                        {expanded && (
                          <tr className="border-b border-border bg-muted/20">
                            <td colSpan={6} className="p-0">
                              <div className="ml-12 m-3 mb-6 rounded-lg border border-border/50 bg-muted/40 shadow-inner">
                                <div className="flex items-center justify-between border-b border-border/50 bg-muted/60 p-2 px-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                  <span>Crawled sub-pages</span>
                                  <span className="rounded-full border bg-background px-2 py-0.5">2 pages</span>
                                </div>
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-border/50 text-left text-[10px] tracking-wider text-muted-foreground/70 uppercase">
                                      <th className="p-3 py-2 font-semibold">Discovery URL</th>
                                      <th className="w-24 p-3 py-2 text-center font-semibold">Status</th>
                                      <th className="w-32 p-3 py-2 text-center font-semibold whitespace-nowrap">Chunks / Tokens</th>
                                      <th className="w-40 p-3 py-2 text-right font-semibold">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {[
                                      `${websiteUrl}install/`,
                                      `${websiteUrl}overview/`,
                                    ].map((u) => (
                                      <tr key={u} className="border-b border-border/20 transition-colors last:border-0 hover:bg-muted/50">
                                        <td className="max-w-2xl truncate p-3 py-2 font-mono text-[11px] text-muted-foreground">
                                          <a href={u} target="_blank" rel="noopener noreferrer" className="text-primary/80 hover:underline">
                                            {u}
                                          </a>
                                        </td>
                                        <td className="w-24 p-3 py-2 text-center">
                                          <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-green-500/10 text-green-600 dark:text-green-400">
                                            {phase === "index_indexed" || phase === "chat_answer_stream" ? "INDEXED" : "PENDING"}
                                          </span>
                                        </td>
                                        <td className="w-32 p-3 py-2 text-center font-mono text-[11px] text-muted-foreground">
                                          {phase === "index_indexed" || phase === "chat_answer_stream" ? "12 / 8400" : "0 / 0"}
                                        </td>
                                        <td className="w-40 p-3 py-2 text-right">
                                          <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" disabled className="h-7 px-2 text-[10px] transition-colors">
                                              Reindex
                                            </Button>
                                            <Button variant="ghost" size="sm" disabled className="h-7 px-2 text-[10px] font-medium text-destructive">
                                              Delete
                                            </Button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chat */}
            <div className="rounded-3xl border border-border/50 bg-background/30 overflow-hidden flex flex-col min-h-[560px]">
              <header className="p-4 border-b border-border/50 bg-background/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 z-20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">AI Assistant</h3>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          phase === "chat_answer_stream" ? "bg-green-500 animate-pulse" : "bg-muted-foreground",
                        )}
                      />{" "}
                      {phase === "chat_answer_stream" ? "Streaming enabled" : "Waiting for indexing"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <SourceSelectorDropdown
                    scope={scope}
                    sources={sourcesForDropdown}
                    onSelect={setScope}
                    tryShortLabel={tryShortLabel}
                  />
                </div>
              </header>

              <div className="p-4 space-y-4 flex-1 min-h-0">
                <div className="space-y-4 flex-1 min-h-0">
                  {/* User bubble */}
                  <div
                    className={cn(
                      "flex justify-end",
                      phase === "chat_send_click" || phase === "chat_answer_stream" ? "opacity-100" : "opacity-40",
                    )}
                  >
                    <div className="rounded-2xl rounded-tr-none bg-primary text-primary-foreground px-4 py-3 shadow-lg shadow-primary/10 max-w-xl text-sm leading-relaxed">
                      {phase === "chat_send_click" || phase === "chat_answer_stream" ? question : "Waiting for indexing…"}
                    </div>
                  </div>

                  {/* AI bubble */}
                  <div className={cn("flex justify-start gap-3", phase === "chat_answer_stream" ? "opacity-100" : "opacity-40")}>
                    <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="rounded-2xl rounded-tl-none px-5 py-4 text-sm leading-7 shadow-sm border border-border/40 backdrop-blur-sm bg-card/50">
                        <p className="text-sm leading-relaxed">
                          {typedA || (phase === "chat_answer_stream" ? "…" : "Index a source to start asking questions.")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="flex items-center gap-2 p-2 pl-4 rounded-full bg-card border border-border/60 shadow-xl backdrop-blur-xl">
                  <Input
                    value={phase === "chat_input_typing" ? typedQ : ""}
                    readOnly
                    placeholder={phase === "chat_input_typing" ? "Type your question..." : "Index a source to begin..."}
                    className="flex-1 bg-transparent border-none focus-visible:ring-0 shadow-none text-sm h-10"
                  />
                  <Button
                    ref={sendBtnRef}
                    size="icon"
                    className={cn("h-9 w-9 rounded-full", phase === "chat_send_click" ? "ring-2 ring-primary/30" : "")}
                    disabled
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Pointer overlay */}
          {pointerPos.visible && (
            <div
              className={cn(
                "pointer-events-none absolute z-50 transition-[left,top,opacity,transform] duration-300 ease-out",
                pointerTarget === "none" && "opacity-0",
              )}
              style={{ left: pointerPos.x, top: pointerPos.y }}
            >
              <div className="text-white/90 drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)] animate-[demoClick_1.2s_ease-in-out_infinite]">
                <ClickHandIcon className="h-10 w-10" />
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes demoClick {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.95; }
          45% { transform: translate(2px, 2px) scale(0.92); opacity: 1; }
          55% { transform: translate(0px, 0px) scale(1); opacity: 1; }
        }
      `}</style>
    </section>
  );
}

