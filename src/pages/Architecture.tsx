import { useEffect, useId, useMemo, useRef, useState } from "react";
import mermaid from "mermaid";
import { Download, Expand, Network, Shrink, Workflow } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { getStoredToken, useLogout } from "@/hooks/useAuth";

type DiagramMode = "simple" | "detailed";
type HighlightMode = "none" | "ingestion" | "query";

const buildSimpleDiagram = (highlight: HighlightMode) => {
  const dim = highlight !== "none";
  const highlightNodes =
    highlight === "ingestion"
      ? ["SourceMind", "Backend", "Queue", "Worker", "Stores", "Providers"]
      : highlight === "query"
        ? ["SourceMind", "Backend", "Stores", "Providers"]
        : [];

  const maybeDimNodes = (all: string[]) => {
    if (!dim) return "";
    const dimNodes = all.filter((n) => !highlightNodes.includes(n));
    return dimNodes.length ? `\n    class ${dimNodes.join(",")} dim;` : "";
  };

  return String.raw`flowchart TD
    %% Styling
    classDef frontend fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff;
    classDef backend fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef worker fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff;
    classDef db fill:#8b5cf6,stroke:#5b21b6,stroke-width:2px,color:#fff;
    classDef external fill:#ef4444,stroke:#b91c1c,stroke-width:2px,color:#fff;
    classDef queue fill:#f43f5e,stroke:#be123c,stroke-width:2px,color:#fff;
    classDef dim fill:#111827,stroke:#374151,stroke-width:1px,color:#9ca3af,opacity:0.35;

    SourceMind["SourceMind\n(Web App)"]:::frontend
    Backend["Backend (Express)\nAPI Gateway + Services"]:::backend
    Queue["Job Queue\n(BullMQ + Redis)"]:::queue
    Worker["Worker\n(Crawl → Chunk → Embed)"]:::worker
    Stores["Data Stores\n(Postgres + Vector DB + Cache)"]:::db
    Providers["Providers\n(LLM + Crawling)"]:::external

    SourceMind -->|1 Ask / Ingest| Backend
    Backend -->|2 Enqueue| Queue
    Queue -->|3 Process| Worker
    Worker -->|4 Store| Stores
    Backend -->|5 Retrieve| Stores
    Backend -->|6 Answer| Providers

    %% Tooltips
    click SourceMind "javascript:void(0)" "Web app UI where users ingest URLs and chat"
    click Backend "javascript:void(0)" "Single Express backend that handles API + RAG orchestration"
    click Stores "javascript:void(0)" "Postgres metadata + vector search + Redis cache"
    click Providers "javascript:void(0)" "LLM + crawling providers used during ingest/query"
    ${maybeDimNodes(["SourceMind", "Backend", "Queue", "Worker", "Stores", "Providers"])}
`;
};

const buildDetailedDiagram = (highlight: HighlightMode) => {
  const dim = highlight !== "none";
  const highlightNodes =
    highlight === "ingestion"
      ? [
          "SourceMind",
          "Gateway",
          "Controllers",
          "InfraService",
          "BullMQ",
          "Dispatcher",
          "Crawler",
          "FileParser",
          "Chunker",
          "Embedder",
          "Redis",
          "Postgres",
          "Qdrant",
          "Crawl4AIEngine",
        ]
      : highlight === "query"
        ? ["SourceMind", "Gateway", "Controllers", "APIService", "AIService", "Redis", "Qdrant", "LLM"]
        : [];

  const maybeDimNodes = (all: string[]) => {
    if (!dim) return "";
    const dimNodes = all.filter((n) => !highlightNodes.includes(n));
    return dimNodes.length ? `\n    class ${dimNodes.join(",")} dim;` : "";
  };

  return String.raw`flowchart TD
    %% Styling
    classDef frontend fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff;
    classDef backend fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef worker fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff;
    classDef db fill:#8b5cf6,stroke:#5b21b6,stroke-width:2px,color:#fff;
    classDef external fill:#ef4444,stroke:#b91c1c,stroke-width:2px,color:#fff;
    classDef queue fill:#f43f5e,stroke:#be123c,stroke-width:2px,color:#fff;
    classDef dim fill:#111827,stroke:#374151,stroke-width:1px,color:#9ca3af,opacity:0.35;

    %% Client Layer
    subgraph ClientLayer ["Client Layer"]
        SourceMind["SourceMind\n(Web App)"]:::frontend
    end

    %% Backend Layer
    subgraph BackendAPI ["Backend (Express)"]
        Gateway["API Gateway\n(Auth, Rate limiting)"]:::backend
        Controllers["Controllers\n(Validation)"]:::backend
        
        subgraph DomainServices ["Core Services"]
            APIService["API / Business Logic"]:::backend
            AIService["AI & RAG Service\n(LangChain)"]:::backend
            InfraService["Infrastructure\n(File Upload: Multer)"]:::backend
        end
        
        Gateway --> Controllers
        Controllers --> APIService
        Controllers --> AIService
        Controllers --> InfraService
    end

    %% Message Broker Layer
    subgraph MessageBroker ["Message Broker"]
        Redis[(Redis\nData Store & Cache)]:::queue
        BullMQ["Job Queue\n(BullMQ)"]:::queue
        
        BullMQ <--> Redis
    end

    %% Worker Layer
    subgraph WorkerProcessing ["Background Processing / Workers"]
        Dispatcher["Job Dispatcher"]:::worker
        Crawler["URL Scraper\n(Crawl4AI Core)"]:::worker
        FileParser["File Parser\n(PDF, DOCX, CSV)"]:::worker
        Chunker["Text Chunker\n(LangChain TextSplitters)"]:::worker
        Embedder["Embedding Engine\n(BGE-Small / Local)"]:::worker
        
        Dispatcher --> Crawler
        Dispatcher --> FileParser
        Crawler --> Chunker
        FileParser --> Chunker
        Chunker --> Embedder
    end

    %% Data Storage Layer
    subgraph DataStorage ["Data Storage Layer"]
        Postgres[(PostgreSQL 16\nvia Prisma)]:::db
        Qdrant[(Vector DB\nQdrant)]:::db
    end

    %% External Services
    subgraph External ["External & Third-Party"]
        Crawl4AIEngine["Crawl4AI\n(Docker Container on :11235)"]:::external
        LLM["LLM API\n(LangChain / Ollama / OpenAI)"]:::external
    end

    %% Connections
    SourceMind <-->|REST over HTTPS| Gateway
    
    %% API to Databases / Brokers
    DomainServices <-->|Read/Write Structured Data| Postgres
    AIService <-->|Semantic Search / Retrieval| Qdrant
    InfraService -->|Enqueue Ingestion Jobs| BullMQ
    AIService <-->|Prompt Generation| LLM
    
    %% Worker Connections
    BullMQ -->|Pop Jobs| WorkerProcessing
    Crawler <-->|Remote Scraping| Crawl4AIEngine
    Embedder -->|Upsert Dense Vectors| Qdrant
    WorkerProcessing -->|Update Document Status| Postgres

    %% Numbered flow callouts
    SourceMind -->|1 Ingest / Ask| Gateway
    InfraService -->|2 Enqueue| BullMQ
    WorkerProcessing -->|3 Chunk + Embed| Embedder
    Embedder -->|4 Store| Qdrant
    AIService -->|5 Retrieve| Qdrant
    AIService -->|6 Answer| LLM

    %% Tooltips (hover)
    click SourceMind "javascript:void(0)" "Web app UI where users ingest URLs and chat"
    click Gateway "javascript:void(0)" "Express API layer (auth, rate limit, routing)"
    click BullMQ "javascript:void(0)" "Background ingestion job queue"
    click Qdrant "javascript:void(0)" "Vector DB for semantic similarity search"
    click Redis "javascript:void(0)" "Cache + queue backing store"
    click Postgres "javascript:void(0)" "Stores metadata, statuses, logs"
    click LLM "javascript:void(0)" "LLM provider used to generate final answers"
    ${maybeDimNodes([
      "SourceMind",
      "Gateway",
      "Controllers",
      "APIService",
      "AIService",
      "InfraService",
      "Redis",
      "BullMQ",
      "Dispatcher",
      "Crawler",
      "FileParser",
      "Chunker",
      "Embedder",
      "Postgres",
      "Qdrant",
      "Crawl4AIEngine",
      "LLM",
    ])}
`;
};

export function Architecture() {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [zoom, setZoom] = useState(1);
  const [mode, setMode] = useState<DiagramMode>("simple");
  const [highlight, setHighlight] = useState<HighlightMode>("none");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const id = useId();
  const isLoggedIn = !!getStoredToken();
  const logout = useLogout();
  const svgRef = useRef<string>("");

  const theme = useMemo<"default" | "dark">(() => {
    const root = typeof document !== "undefined" ? document.documentElement : null;
    const prefersDark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    const hasDarkClass = root?.classList?.contains("dark") ?? false;
    return hasDarkClass || prefersDark ? "dark" : "default";
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme,
          securityLevel: "loose",
        });

        const diagram = mode === "simple" ? buildSimpleDiagram(highlight) : buildDetailedDiagram(highlight);
        const { svg } = await mermaid.render(`arch-${id}-${mode}-${highlight}`, diagram);
        if (!cancelled) {
          svgRef.current = svg;
          setSvg(svg);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to render Mermaid diagram.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, theme, mode, highlight]);

  const clampZoom = (value: number) => Math.min(3, Math.max(0.5, value));
  const zoomIn = () => setZoom((z) => clampZoom(Number((z + 0.1).toFixed(2))));
  const zoomOut = () => setZoom((z) => clampZoom(Number((z - 0.1).toFixed(2))));
  const resetZoom = () => setZoom(1);

  const downloadSvg = () => {
    const content = svgRef.current;
    if (!content) return;
    const blob = new Blob([content], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sourcemind-architecture-${mode}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const normalizeSvgForExport = (rawSvg: string) => {
    try {
      const doc = new DOMParser().parseFromString(rawSvg, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      if (!svgEl) return rawSvg;

      if (!svgEl.getAttribute("xmlns")) {
        svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      }
      if (!svgEl.getAttribute("xmlns:xlink")) {
        svgEl.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
      }

      // Ensure explicit width/height so <img> decoding is reliable.
      const hasSize = svgEl.getAttribute("width") && svgEl.getAttribute("height");
      const viewBox = svgEl.getAttribute("viewBox");
      if (!hasSize && viewBox) {
        const parts = viewBox.split(/\s+/).map(Number);
        const vbW = parts.length === 4 ? parts[2] : undefined;
        const vbH = parts.length === 4 ? parts[3] : undefined;
        if (vbW && vbH) {
          svgEl.setAttribute("width", String(Math.ceil(vbW)));
          svgEl.setAttribute("height", String(Math.ceil(vbH)));
        }
      }

      return new XMLSerializer().serializeToString(svgEl);
    } catch {
      return rawSvg;
    }
  };

  const downloadPng = async () => {
    const content = svgRef.current;
    if (!content) return;

    try {
      const normalized = normalizeSvgForExport(content);
      const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(normalized)}`;

      const img = new Image();
      img.decoding = "async";
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("SVG image decode failed"));
        img.src = dataUrl;
      });

      const width = Math.max(1400, img.naturalWidth || img.width || 1400);
      const height = Math.max(900, img.naturalHeight || img.height || 900);

      const canvas = document.createElement("canvas");
      const exportScale = 2;
      canvas.width = width * exportScale;
      canvas.height = height * exportScale;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(exportScale, exportScale);
      ctx.fillStyle = "#0b0f19";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `sourcemind-architecture-${mode}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error(e);
      alert("PNG export failed in this browser. Please download SVG instead.");
    }
  };

  const DiagramCard = ({ fullscreen }: { fullscreen: boolean }) => (
    <div className={cn("rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 lg:p-8", fullscreen && "h-full")}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={mode === "simple" ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setMode("simple")}
            >
              Simple
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "detailed" ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setMode("detailed")}
            >
              Detailed
            </Button>

            <span className="mx-1 text-muted-foreground/50">|</span>

            <Button
              type="button"
              size="sm"
              variant={highlight === "ingestion" ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setHighlight((h) => (h === "ingestion" ? "none" : "ingestion"))}
            >
              Ingestion flow
            </Button>
            <Button
              type="button"
              size="sm"
              variant={highlight === "query" ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setHighlight((h) => (h === "query" ? "none" : "query"))}
            >
              Query flow
            </Button>
          </div>

          <div className="rounded-2xl border border-border/40 bg-background/40 p-4 space-y-2">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Workflow className="h-4 w-4 text-primary" /> How to read this
            </p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Follow the numbered arrows: <span className="font-semibold text-foreground">1 → 6</span>.</li>
              <li>Use <span className="font-semibold text-foreground">Ingestion / Query</span> to focus on one flow.</li>
              <li>Hover key boxes for a short explanation.</li>
            </ul>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Client
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Backend
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-pink-500" /> Queue/Cache
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Worker
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Data stores
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> External
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-start lg:justify-end">
          <Button type="button" variant="outline" size="sm" className="rounded-full px-3" onClick={zoomOut} aria-label="Zoom out">
            −
          </Button>
          <div className="text-xs font-semibold tabular-nums text-muted-foreground min-w-16 text-center">
            {Math.round(zoom * 100)}%
          </div>
          <Button type="button" variant="outline" size="sm" className="rounded-full px-3" onClick={zoomIn} aria-label="Zoom in">
            +
          </Button>
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={resetZoom}>
            Reset
          </Button>

          <span className="mx-1 text-muted-foreground/50">|</span>

          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={downloadSvg}>
            <Download className="h-4 w-4 mr-2" /> SVG
          </Button>
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={downloadPng}>
            <Download className="h-4 w-4 mr-2" /> PNG
          </Button>

          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setIsFullscreen((v) => !v)}>
            {isFullscreen ? <Shrink className="h-4 w-4 mr-2" /> : <Expand className="h-4 w-4 mr-2" />}
            {isFullscreen ? "Exit" : "Full screen"}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="space-y-3 mt-6">
          <p className="text-sm font-semibold text-red-500">Couldn’t render the diagram.</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      ) : svg ? (
        <div
          className={cn("w-full overflow-auto mt-6", fullscreen && "h-[calc(100%-14rem)]")}
          onWheel={(e) => {
            if (!(e.ctrlKey || e.metaKey)) return;
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoom((z) => clampZoom(Number((z + delta).toFixed(2))));
          }}
        >
          <div className="min-w-fit w-full flex justify-center pb-2">
            <div
              className="inline-block origin-top transition-transform duration-150 ease-out [&_svg]:h-auto [&_svg]:max-w-none [&_svg]:block [&_svg]:mx-auto"
              style={{ transform: `scale(${zoom})` }}
              // Mermaid returns trusted SVG we generate locally at runtime.
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground mt-6">Rendering diagram…</div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-svh bg-background">
      {/* Navigation (match Home) */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight text-foreground">SourceMind</span>
          </Link>
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
                <Link
                  to="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
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
        {/* Hero (match Home vibe) */}
        <section className="relative overflow-hidden py-16 lg:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/20 via-background to-background -z-10" />
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
                Production Architecture
              </h1>
              <p className="text-muted-foreground sm:text-lg leading-relaxed">
                Frontend, backend, workers, and data stores.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16">
          <DiagramCard fullscreen={false} />
        </section>
      </main>

      {isFullscreen && (
        <div className="fixed inset-0 z-60 bg-background/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6 h-full">
            <DiagramCard fullscreen />
          </div>
        </div>
      )}
    </div>
  );
}

