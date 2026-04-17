import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIngestDocument, useIngestFiles } from "@/hooks/useDocuments";
import { Globe, FileText, UploadCloud, X, Youtube, Github } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabType = "website" | "file" | "youtube" | "github";

export function AddSourceModal({ open, onOpenChange }: AddSourceModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("website");
  
  // Website state
  const [url, setUrl] = useState("");
  const [crawlAllPages, setCrawlAllPages] = useState(false);
  const [maxPages, setMaxPages] = useState(50);
  
  // File state
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // Hooks
  const ingestWebsite = useIngestDocument();
  const ingestFiles = useIngestFiles();

  const disabledTabs: Partial<Record<TabType, boolean>> = {
    youtube: true,
    github: true,
  };

  const handleClose = () => {
    setUrl("");
    setCrawlAllPages(false);
    setMaxPages(50);
    setFiles([]);
    onOpenChange(false);
  };

  const submitWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    try {
      await ingestWebsite.mutateAsync({
        url: url.trim(),
        async: true,
        crawlAllPages: crawlAllPages || undefined,
        maxPages: crawlAllPages ? maxPages : undefined,
      });
      handleClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const submitFiles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;
    
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    
    try {
      await ingestFiles.mutateAsync(formData);
      handleClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl overflow-hidden border-border/60 bg-card p-0">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/70 text-muted-foreground backdrop-blur transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
              <UploadCloud className="h-5 w-5 text-primary" />
            </span>
            Add Source
          </DialogTitle>
          <DialogDescription>
            Import a website or upload document files into your knowledge base.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Selection */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("website")}
              className={cn(
                "group relative overflow-hidden rounded-3xl border bg-card p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/5",
                activeTab === "website"
                  ? "border-primary/30 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/20"
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
              onClick={() => setActiveTab("file")}
              className={cn(
                "group relative overflow-hidden rounded-3xl border bg-card p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/5",
                activeTab === "file"
                  ? "border-primary/30 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/20"
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
              disabled={!!disabledTabs.youtube}
              onClick={() => setActiveTab("youtube")}
              className={cn(
                "group relative overflow-hidden rounded-3xl border bg-card p-4 text-left transition-all duration-300",
                "border-border",
                disabledTabs.youtube
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20",
                activeTab === "youtube" && !disabledTabs.youtube
                  ? "border-primary/30 ring-2 ring-primary/20"
                  : ""
              )}
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-muted transition-all duration-300 group-hover:bg-primary/10 group-hover:scale-110">
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
              disabled={!!disabledTabs.github}
              onClick={() => setActiveTab("github")}
              className={cn(
                "group relative overflow-hidden rounded-3xl border bg-card p-4 text-left transition-all duration-300",
                "border-border",
                disabledTabs.github
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20",
                activeTab === "github" && !disabledTabs.github
                  ? "border-primary/30 ring-2 ring-primary/20"
                  : ""
              )}
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-muted transition-all duration-300 group-hover:bg-primary/10 group-hover:scale-110">
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
        </div>

        <div className="mt-6 px-6 pb-6">
          {activeTab === "website" ? (
            <form onSubmit={submitWebsite} className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Website URL</label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="rounded-xl border-border/80 focus-visible:ring-primary h-11"
                  required
                />
              </div>

              <div className="space-y-4 pt-1">
                <label className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group">
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      type="checkbox"
                      checked={crawlAllPages}
                      onChange={(e) => setCrawlAllPages(e.target.checked)}
                      className="w-4 h-4 rounded border-primary text-primary focus:ring-primary disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold group-hover:text-primary transition-colors">Crawl Entire Website</span>
                    <span className="text-xs text-muted-foreground">Automatically find and ingest sub-pages</span>
                  </div>
                </label>

                <div
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20 transition-all overflow-hidden",
                    crawlAllPages ? "opacity-100 max-h-20" : "opacity-50 max-h-20 pointer-events-none"
                  )}
                >
                  <span className="text-sm font-medium">Max pages to fetch</span>
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    value={maxPages}
                    onChange={(e) => setMaxPages(Number(e.target.value))}
                    disabled={!crawlAllPages}
                    className="w-24 text-center rounded-lg h-9"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={ingestWebsite.isPending || !url.trim()}
                className="w-full h-11 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
              >
                {ingestWebsite.isPending ? "Ingesting..." : "Ingest Website"}
              </Button>
            </form>
          ) : activeTab === "file" ? (
            <form onSubmit={submitFiles} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div
                className={cn(
                  "relative group flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all duration-300",
                  isDragging
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-border/60 hover:border-primary/50 hover:bg-muted/30"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                  <UploadCloud className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-sm font-bold text-foreground mb-1">Click or drag files here</h4>
                <p className="text-xs text-muted-foreground text-center">
                  Supports PDF, DOCX, CSV, XLSX, TXT, MD config <br className="hidden md:block"/> Max 10 files per upload.
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.csv,.xlsx,.txt,.md"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {files.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
                  {files.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 pl-3 rounded-lg border border-border/50 bg-background shadow-sm animate-in fade-in zoom-in duration-200"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-xs font-medium truncate">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="p-1 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="submit"
                disabled={ingestFiles.isPending || files.length === 0}
                className="w-full h-11 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
              >
                {ingestFiles.isPending ? "Uploading..." : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
              </Button>
            </form>
          ) : activeTab === "youtube" ? (
            <div className="rounded-3xl border border-border bg-muted/20 p-6">
              <div className="flex items-start gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                  <Youtube className="h-6 w-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground">YouTube</h4>
                    <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                      Coming soon
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    YouTube ingestion isn’t enabled yet. This will let you paste a video URL and index the transcript.
                  </p>
                  <Button
                    type="button"
                    disabled
                    className="mt-4 rounded-xl"
                    variant="outline"
                  >
                    Add YouTube Source
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-muted/20 p-6">
              <div className="flex items-start gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                  <Github className="h-6 w-6 text-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground">GitHub</h4>
                    <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                      Coming soon
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    GitHub repo ingestion isn’t enabled yet. This will let you index a repository’s README and files for deep technical querying.
                  </p>
                  <Button
                    type="button"
                    disabled
                    className="mt-4 rounded-xl"
                    variant="outline"
                  >
                    Add GitHub Source
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
