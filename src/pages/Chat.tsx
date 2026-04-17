import { useMemo, useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DeleteChatModal } from "@/components/chat/DeleteChatModal";
import { SourceSelectorDropdown } from "@/components/chat/SourceSelectorDropdown";
import { Input } from "@/components/ui/input";
import { streamQuery } from "@/services/api/query";
import { useSources } from "@/hooks/useDocuments";
import {
  useCreateSession,
  useDeleteSession,
  useSessionsList,
  useSessionThread,
} from "@/hooks/useSessions";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  MessageSquare,
  Trash2,
  Send,
  Zap,
  Globe,
  FileText,
  Clock,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { QueryResult, QuerySource } from "@/types/query";
import { cn } from "@/lib/utils";

// Scope value: "" = all, "site:URL" = by site key, "doc:ID" = single document
const SCOPE_ALL = "";

export function Chat() {
  const [question, setQuestion] = useState("");
  const [scope, setScope] = useState<string>(SCOPE_ALL);
  const [skipIntelligence] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [optimisticTurn, setOptimisticTurn] = useState<null | {
    question: string;
    answer?: string;
    result?: QueryResult;
    scope?: string;
    isError?: boolean;
  }>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const qc = useQueryClient();
  const { data: sources = [] } = useSources();
  const sessionsQuery = useSessionsList({ page: 1, limit: 50 });
  const selectedSessionId = activeSessionId ?? sessionsQuery.data?.sessions?.[0]?.id ?? null;
  const threadQuery = useSessionThread(selectedSessionId);
  const createSessionMutation = useCreateSession();
  const deleteSessionMutation = useDeleteSession();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadQuery.data, optimisticTurn]);

  function parseScope(value: string): { documentId?: string; siteKey?: string } {
    if (value.startsWith("site:")) return { siteKey: value.slice(5) };
    if (value.startsWith("doc:")) return { documentId: value.slice(4) };
    return {};
  }

  async function ensureSession(): Promise<string> {
    if (selectedSessionId) return selectedSessionId;
    const { documentId, siteKey } = parseScope(scope);
    const session = await createSessionMutation.mutateAsync({
      documentId,
      siteKey,
    });
    setActiveSessionId(session.id);
    return session.id;
  }

  async function handleNewChat() {
    const { documentId, siteKey } = parseScope(scope);
    const session = await createSessionMutation.mutateAsync({ documentId, siteKey });
    setOptimisticTurn(null);
    setActiveSessionId(session.id);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    setQuestion("");
    setOptimisticTurn({ question: q, answer: "", scope });
    setIsStreaming(true);

    try {
      const sessionId = await ensureSession();
      const { documentId, siteKey } = parseScope(scope);

      const result = await streamQuery(
        {
          question: q,
          documentId,
          sessionId,
          siteKey,
          topK: 8,
          useCache: true,
          skipIntelligence: skipIntelligence || undefined,
          useHybrid: true,
        },
        {
          onToken: (text) => {
            setOptimisticTurn((prev) => {
              if (!prev) return prev;
              return { ...prev, answer: (prev.answer ?? "") + text };
            });
          },
        },
      );
      setOptimisticTurn({ question: q, answer: result.answer, result, scope });
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["sessions"] }),
        qc.invalidateQueries({ queryKey: ["sessionThread", sessionId] }),
      ]);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
            : err && typeof err === "object" && "message" in err
              ? String((err as { message?: unknown }).message ?? "Query failed")
              : "Query failed";
      setOptimisticTurn({
        question: q,
        answer: `Error: ${message ?? "Query failed"}`,
        isError: true,
        scope,
      });
    } finally {
      setIsStreaming(false);
    }
  };

  function tryShortLabel(url: string | null): string {
    if (!url) return "Unknown Source";
    try {
      const u = new URL(url);
      const path = u.pathname === "/" ? "" : u.pathname;
      return `${u.hostname}${path}`.slice(0, 40) + (url.length > 40 ? "…" : "");
    } catch {
      return url.slice(0, 35) + (url.length > 35 ? "…" : "");
    }
  }

  function orderSourcesWithMainFirst(sources: QuerySource[], msgScope?: string): QuerySource[] {
    if (!sources.length) return sources;
    const siteKey = msgScope?.startsWith("site:") ? msgScope.slice(5) : null;
    if (!siteKey) return sources;
    const main = sources.find((s) => s.url === siteKey || s.url.startsWith(siteKey + "/") || s.url.startsWith(siteKey + "?"));
    if (!main) return sources;
    const rest = sources.filter((s) => s !== main);
    const byPath = (a: QuerySource, b: QuerySource) => (a.url.length - b.url.length);
    return [main, ...rest.sort(byPath)];
  }

  function toggleSourcesExpanded(msgIndex: number) {
    setExpandedSources((prev) => {
      const next = new Set(prev);
      if (next.has(msgIndex)) next.delete(msgIndex);
      else next.add(msgIndex);
      return next;
    });
  }

  const displayTurns = useMemo(() => {
    const sessionTurns = threadQuery.data?.turns ?? [];
    const base = sessionTurns.map((t) => ({
      key: `t-${t.turnIndex}`,
      question: t.question,
      answer: t.answer,
      result: (t as any).result as QueryResult | undefined,
      scope: (t as any).scope as string | undefined,
      isOptimistic: false,
    }));

    if (optimisticTurn?.question) {
      const already = sessionTurns.some((t) => t.question === optimisticTurn.question && !!t.answer);
      if (!already) {
        base.push({
          key: "optimistic",
          question: optimisticTurn.question,
          answer: optimisticTurn.answer && optimisticTurn.answer.length > 0 ? optimisticTurn.answer : "…",
          result: optimisticTurn.result,
          scope: optimisticTurn.scope,
          isOptimistic: true,
        });
      }
    }
    return base;
  }, [optimisticTurn, threadQuery.data]);

  function openDeleteSessionModal(id: string) {
    setDeleteSessionId(id);
    setDeleteOpen(true);
  }

  async function confirmDeleteSession() {
    if (!deleteSessionId) return;
    await deleteSessionMutation.mutateAsync(deleteSessionId);
    setDeleteOpen(false);
    setDeleteSessionId(null);
    setOptimisticTurn(null);
    if (activeSessionId === deleteSessionId) setActiveSessionId(null);
  }

  return (
    <div className="flex flex-col h-[calc(100svh-4rem)] -m-6 lg:-m-8">

      {/* Container for Sidebar and Main Chat */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        
        {/* Sessions Sub-Sidebar */}
        <aside className="hidden lg:flex flex-col w-80 border-r border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="p-5 border-b border-border/40">
            <Button
              className="w-full h-11 justify-start gap-3 rounded-xl font-bold bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
              onClick={handleNewChat}
              disabled={createSessionMutation.isPending}
            >
              <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-primary-foreground/15 border border-primary-foreground/10 group-hover:bg-primary-foreground/25 transition-colors">
                <Plus className="h-4 w-4" />
              </div>
              <span>New conversation</span>
            </Button>
          </div>

          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {sessionsQuery.isLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-16 w-full rounded-xl bg-muted/40 animate-pulse" />)
            ) : (sessionsQuery.data?.sessions ?? []).map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  setOptimisticTurn(null);
                  setActiveSessionId(s.id);
                }}
                className={cn(
                  "group relative w-full rounded-xl p-3 text-left transition-all cursor-pointer border border-transparent hover:bg-muted/50",
                  s.id === selectedSessionId ? "bg-muted shadow-sm border-border/40" : "opacity-70 hover:opacity-100"
                )}
              >
                <p className="text-sm font-semibold truncate leading-tight pr-6">
                  {s.title || "New chat"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 truncate">
                   {s.turnCount} turns · {s.siteKey ? tryShortLabel(s.siteKey) : "All documents"}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteSessionModal(s.id);
                  }}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-background/20 relative">
          
          {/* Chat Header / Controls */}
          <header className="p-4 border-b border-border/50 bg-background/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 z-20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold">
                  {threadQuery.data?.session?.title || "AI Assistant"}
                </h3>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Streaming enabled
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <SourceSelectorDropdown
                scope={scope}
                sources={sources}
                onSelect={setScope}
                tryShortLabel={tryShortLabel}
              />
            </div>
          </header>

          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto px-4 py-3 lg:px-8 lg:py-5 space-y-6 min-h-0 scroll-smooth">
            {!selectedSessionId ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center border border-primary/10">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold">Ready to assist</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                    Pick an existing session or start a new one to ask questions across your indexed knowledge.
                  </p>
                </div>
                <Button 
                  variant="default" 
                  size="default" 
                  onClick={handleNewChat} 
                  className="rounded-xl px-8 font-bold h-11 gap-2 shadow-xl shadow-primary/10 hover:scale-105 active:scale-95 transition-all"
                >
                  <div className="flex items-center justify-center h-5 w-5 rounded-md bg-primary-foreground/15">
                    <Plus className="h-3.5 w-3.5" />
                  </div>
                  Create New Chat
                </Button>

              </div>
            ) : threadQuery.isLoading ? (
              <div className="space-y-6">
                {[1, 2].map(i => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
                      <div className="h-20 w-3/4 bg-muted animate-pulse rounded-2xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayTurns.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <p className="text-sm font-medium">No messages yet.</p>
                  <p className="text-xs">Ask your first question below.</p>
               </div>
            ) : displayTurns.map((t, idx) => (
              <div key={t.key} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* User Message */}
                <div className="flex justify-end pr-2 lg:pr-12">
                  <div className="relative group">
                    <div className="rounded-2xl rounded-tr-none bg-primary text-primary-foreground px-4 py-3 shadow-lg shadow-primary/10 max-w-xl text-sm leading-relaxed relative z-10">
                      {t.question}
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start gap-4 lg:pl-4 max-w-3xl">
                  <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className={cn(
                      "rounded-2xl rounded-tl-none px-5 py-4 text-sm leading-7 shadow-sm border border-border/40 backdrop-blur-sm",
                      t.isOptimistic && !t.answer ? "bg-muted/30 italic text-muted-foreground" : "bg-card/50"
                    )}>
                      <MarkdownText content={t.answer} />

                      {/* Sources Section */}
                      {t.result && t.result.sources?.length > 0 && (() => {
                        const ordered = orderSourcesWithMainFirst(t.result.sources, t.scope);
                        const isExpanded = expandedSources.has(idx);
                        const visibleCount = isExpanded ? ordered.length : Math.min(2, ordered.length);
                        return (
                          <div className="mt-6 pt-4 border-t border-border/50">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sources Cited</p>
                              {ordered.length > 2 && (
                                <button 
                                  onClick={() => toggleSourcesExpanded(idx)}
                                  className="text-[10px] font-bold text-primary hover:underline"
                                >
                                  {isExpanded ? "Show Less" : `View All (${ordered.length})`}
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {ordered.slice(0, visibleCount).map((s, j) => (
                                <a
                                  key={s.index ?? j}
                                  href={s.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex flex-col p-2 rounded-xl bg-background/40 border border-border/30 hover:border-primary/40 transition-all"
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    {isFileSource(s.url) ? (
                                      <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                                    ) : (
                                      <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
                                    )}
                                    <span className="text-[10px] font-semibold truncate group-hover:text-primary transition-colors">
                                      {isFileSource(s.url) ? shortFileId(s.url) : new URL(s.url).hostname}
                                    </span>
                                  </div>
                                  <p className="text-[9px] text-muted-foreground truncate opacity-60">
                                    {s.url}
                                  </p>
                                </a>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Metadata */}
                    {t.result && (
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium px-1">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {t.result.latencyMs}ms</span>
                        <span className="flex items-center gap-1 border-l border-border/50 pl-2">
                           {t.result.intelligence?.used ? "Intelligence: High" : "Intelligence: Fast"}
                        </span>
                        {t.result.fromCache && <span>· Cache HIT</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} className="h-4" />
          </div>

          {/* Input Area */}
          <footer className="px-4 pb-2 pt-0 lg:px-8 lg:pb-4 bg-transparent z-10">

            <div className="max-w-4xl mx-auto relative">
               <div className="absolute -inset-2 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-[2rem] blur-xl -z-10" />
               <form 
                onSubmit={handleSubmit} 
                className={cn(
                  "flex items-center gap-2 p-1.5 pl-5 rounded-fill bg-card border border-border/60 shadow-2xl backdrop-blur-xl transition-all",
                  isStreaming ? "border-primary/30 ring-1 ring-primary/10" : "hover:border-primary/40"
                )}
                style={{ borderRadius: "100px" }}
               >
                  <Input
                    placeholder={selectedSessionId ? "Type your question..." : "Create a session to begin..."}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="flex-1 bg-transparent border-none focus-visible:ring-0 shadow-none text-sm h-12"
                    disabled={isStreaming}
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={isStreaming || !question.trim()}
                    className={cn(
                      "h-10 w-10 min-w-10 rounded-full transition-transform",
                      isStreaming ? "animate-pulse" : "hover:scale-105 active:scale-95"
                    )}
                  >
                    {isStreaming ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
               </form>
               <p className="mt-2 text-[10px] text-center text-muted-foreground font-medium">
                  SourceMind AI may provide inaccurate info about people, places, or facts. Verified with RAG confidence.
               </p>
            </div>
          </footer>
        </div>
      </div>

      <DeleteChatModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={confirmDeleteSession}
        isDeleting={deleteSessionMutation.isPending}
        description="This will permanently delete this conversation history and citations."
      />
    </div>
  );
}

function MarkdownText({ content }: { content: string }) {
  return (
    <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted/50 prose-code:text-primary">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          strong: ({ children }) => <strong className="font-extrabold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic opacity-90">{children}</em>,
          code: ({ children }) => (
            <code className="rounded-md bg-muted/80 px-1.5 py-0.5 text-[0.85em] font-mono text-primary border border-border/20">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/40 pl-4 py-1 my-3 bg-primary/5 rounded-r-lg">
              {children}
            </blockquote>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function isFileSource(url: string) {
  return url.startsWith("file://");
}

function shortFileId(url: string) {
  const raw = url.replace(/^file:\/\//, "");
  const head = raw.slice(0, 18);
  return raw.length > 18 ? `${head}…` : head;
}

