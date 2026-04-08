import { useState, useCallback, useRef, useEffect, Fragment } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  useDocuments,
  useIngestDocument,
  useDeleteDocument,
  useReindexDocument,
} from "@/hooks/useDocuments"
import type { Document } from "@/types/document"
import { ChevronRight, ChevronDown } from "lucide-react"

function ChildDocumentsList({
  siteKey,
  onDelete,
  onReindex,
  isDeleting,
  isReindexing,
}: {
  siteKey: string
  onDelete: (id: string) => void
  onReindex: (id: string) => void
  isDeleting: boolean
  isReindexing: boolean
}) {
  const { data, isLoading } = useDocuments({ siteKey, limit: 100 })
  const documents = data?.documents ?? []

  if (isLoading)
    return (
      <div className="ml-12 p-4 text-sm text-muted-foreground italic">
        Loading child pages...
      </div>
    )
  if (documents.length === 0)
    return (
      <div className="ml-12 p-4 text-sm text-muted-foreground italic">
        No child pages discovered yet.
      </div>
    )

  return (
    <div className="m-3 mb-6 ml-12 rounded-lg border border-border/50 bg-muted/40 shadow-inner">
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/60 p-2 px-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        <span>Crawled Sub-pages</span>
        <span className="rounded-full border bg-background px-2 py-0.5">
          {documents.length} pages
        </span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50 text-left text-[10px] tracking-wider text-muted-foreground/70 uppercase">
            <th className="p-3 py-2 font-semibold">Discovery URL</th>
            <th className="w-24 p-3 py-2 text-center font-semibold">Status</th>
            <th className="w-32 p-3 py-2 text-center font-semibold whitespace-nowrap">
              Chunks / Tokens
            </th>
            <th className="w-40 p-3 py-2 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((child) => (
            <tr
              key={child.id}
              className="border-b border-border/20 transition-colors last:border-0 hover:bg-muted/50"
            >
              <td className="max-w-2xl truncate p-3 py-2 font-mono text-[11px] text-muted-foreground">
                <a
                  href={child.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary/80 hover:underline"
                >
                  {child.url}
                </a>
              </td>
              <td className="w-24 p-3 py-2 text-center">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    child.status === "INDEXED"
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : child.status === "FAILED"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {child.status}
                </span>
              </td>
              <td className="w-32 p-3 py-2 text-center font-mono text-[11px] text-muted-foreground">
                {child.chunkCount ?? 0} / {child.tokenCount ?? 0}
              </td>
              <td className="w-40 p-3 py-2 text-right">
                <div className="flex justify-end gap-2">
                  {child.status === "INDEXED" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-[10px] transition-colors hover:bg-primary/10 hover:text-primary"
                      onClick={() => onReindex(child.id)}
                      disabled={isReindexing}
                    >
                      Reindex
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[10px] font-medium text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDelete(child.id)}
                    disabled={isDeleting}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DocumentRow({
  doc,
  selected,
  expanded,
  onToggleSelect,
  onToggleExpand,
  onDelete,
  onReindex,
  isDeleting,
  isReindexing,
}: {
  doc: Document
  selected: boolean
  expanded: boolean
  onToggleSelect: (id: string) => void
  onToggleExpand: (id: string) => void
  onDelete: (id: string) => void
  onReindex: (id: string) => void
  isDeleting: boolean
  isReindexing: boolean
}) {
  return (
    <tr
      className={`group transition-colors ${expanded ? "border-l-2 border-l-primary bg-muted/30" : "border-b border-border hover:bg-muted/10"}`}
    >
      <td className="w-10 p-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(doc.id)}
            aria-label={`Select ${doc.title || doc.url}`}
            className="h-4 w-4 rounded border-input"
          />
          <button
            onClick={() => onToggleExpand(doc.id)}
            className="rounded p-1 text-muted-foreground transition-transform duration-200 hover:bg-muted"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </td>
      <td className="p-3 text-sm">
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-primary underline"
        >
          {doc.url}
        </a>
      </td>
      <td className="p-3 text-sm">{doc.title ?? "—"}</td>
      <td className="p-3">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            doc.status === "INDEXED"
              ? "bg-green-500/20 text-green-700 dark:text-green-400"
              : doc.status === "FAILED"
                ? "bg-destructive/20 text-destructive"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {doc.status}
        </span>
      </td>
      <td className="p-3 text-sm text-muted-foreground">
        {doc.chunkCount ?? "—"} / {doc.tokenCount ?? "—"}
      </td>
      <td className="flex gap-2 p-3">
        {doc.status === "INDEXED" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReindex(doc.id)}
            disabled={isReindexing}
          >
            Reindex
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(doc.id)}
          disabled={isDeleting}
        >
          Delete
        </Button>
      </td>
    </tr>
  )
}

export function Documents() {
  const [url, setUrl] = useState("")
  const [crawlAllPages, setCrawlAllPages] = useState(false)
  const [maxPages, setMaxPages] = useState<number>(50)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const { data, isLoading } = useDocuments({
    page: 1,
    limit: 50,
    rootOnly: true,
  })
  const ingest = useIngestDocument()
  const remove = useDeleteDocument()
  const reindex = useReindexDocument()

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback((docs: Document[]) => {
    const ids = docs.map((d) => d.id)
    setSelectedIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id))
      if (allSelected) {
        const next = new Set(prev)
        ids.forEach((id) => next.delete(id))
        return next
      }
      return new Set([...prev, ...ids])
    })
  }, [])

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    try {
      await ingest.mutateAsync({
        url: url.trim(),
        async: true,
        crawlAllPages: crawlAllPages || undefined,
        maxPages: crawlAllPages ? maxPages : undefined,
      })
      setUrl("")
      alert("Ingestion started. Document will be processed in the background.")
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : "Ingest failed"
      alert(message ?? "Ingest failed")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document?")) return
    try {
      await remove.mutateAsync(id)
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    } catch {
      alert("Delete failed")
    }
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    if (!confirm(`Delete ${ids.length} selected document(s)?`)) return
    try {
      for (const id of ids) {
        await remove.mutateAsync(id)
      }
      setSelectedIds(new Set())
    } catch {
      alert("One or more deletes failed.")
    }
  }

  const handleReindex = async (id: string) => {
    try {
      await reindex.mutateAsync(id)
      alert("Reindex queued.")
    } catch {
      alert("Reindex failed")
    }
  }

  const documents = data?.documents ?? []
  const pagination = data?.pagination
  const selectAllRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = selectAllRef.current
    if (!el || documents.length === 0) return
    const some = documents.some((d) => selectedIds.has(d.id))
    const all = documents.every((d) => selectedIds.has(d.id))
    el.indeterminate = some && !all
  }, [selectedIds, documents])

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Documents
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Ingest URLs to index their content for RAG queries.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add URL</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter a URL to ingest. Processing runs in the background.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleIngest} className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/page"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={ingest.isPending}>
                {ingest.isPending ? "Adding…" : "Ingest"}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={crawlAllPages}
                  onChange={(e) => setCrawlAllPages(e.target.checked)}
                />
                <span>Crawl whole site</span>
              </label>

              <label className="flex items-center gap-2">
                <span className="text-muted-foreground">Max pages</span>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={maxPages}
                  disabled={!crawlAllPages}
                  onChange={(e) => setMaxPages(Number(e.target.value))}
                  className="h-9 w-24 rounded-lg border border-input bg-transparent px-3 text-sm disabled:opacity-50"
                />
              </label>
              <span className="text-muted-foreground">
                Uses Crawl4AI Tier 1 (fallback Firecrawl).
              </span>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Indexed documents</CardTitle>
          {pagination && (
            <p className="text-sm text-muted-foreground">
              {pagination.total} total
            </p>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : documents.length === 0 ? (
            <p className="text-muted-foreground">
              No documents yet. Add a URL above.
            </p>
          ) : (
            <div className="space-y-3">
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={remove.isPending}
                  >
                    Delete selected ({selectedIds.size})
                  </Button>
                  <button
                    type="button"
                    onClick={() => setSelectedIds(new Set())}
                    className="text-sm text-muted-foreground underline hover:text-foreground"
                  >
                    Clear selection
                  </button>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left text-sm text-muted-foreground">
                      <th className="w-10 p-3">
                        <input
                          ref={selectAllRef}
                          type="checkbox"
                          checked={
                            documents.length > 0 &&
                            documents.every((d) => selectedIds.has(d.id))
                          }
                          onChange={() => toggleSelectAll(documents)}
                          aria-label="Select all on page"
                          className="h-4 w-4 rounded border-input"
                        />
                      </th>
                      <th className="p-3">URL</th>
                      <th className="p-3">Title</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Chunks / Tokens</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <Fragment key={doc.id}>
                        <DocumentRow
                          doc={doc}
                          selected={selectedIds.has(doc.id)}
                          expanded={expandedIds.has(doc.id)}
                          onToggleSelect={toggleSelect}
                          onToggleExpand={toggleExpand}
                          onDelete={handleDelete}
                          onReindex={handleReindex}
                          isDeleting={remove.isPending}
                          isReindexing={reindex.isPending}
                        />
                        {expandedIds.has(doc.id) && (
                          <tr className="border-b border-border bg-muted/20">
                            <td colSpan={6} className="p-0">
                              <ChildDocumentsList
                                siteKey={doc.url}
                                onDelete={handleDelete}
                                onReindex={handleReindex}
                                isDeleting={remove.isPending}
                                isReindexing={reindex.isPending}
                              />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
