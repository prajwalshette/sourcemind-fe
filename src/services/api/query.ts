import { serverInstance } from "@/services/axios";
import { apiBaseURL } from "@/config";
import type {
  QueryBody,
  QueryResult,
  QueryHistoryLog,
  Pagination,
  QuerySource,
} from "@/types/query";

export async function query(body: QueryBody): Promise<QueryResult> {
  const { data } = await serverInstance.post<{
    success: true;
    data: QueryResult;
  }>("/query", body);
  if (!data?.data) {
    throw new Error("Invalid API response: missing data");
  }
  return data.data;
}

export type StreamMetaPayload = {
  sources: QuerySource[];
  intelligence: NonNullable<QueryResult["intelligence"]>;
  retrieval?: QueryResult["retrieval"];
};

/**
 * POST /query/stream — SSE: events `meta`, `token`, `done`, optional `error`.
 */
export async function streamQuery(
  body: QueryBody,
  handlers: {
    onMeta?: (data: StreamMetaPayload) => void;
    onToken?: (text: string) => void;
  } = {},
): Promise<QueryResult> {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${apiBaseURL}/query/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    localStorage.clear();
    window.location.replace("/login");
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const err = (await res.json()) as { message?: string };
      if (err?.message) message = err.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let result: QueryResult | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";

    for (const block of blocks) {
      const lines = block.split("\n").filter((l) => l.length > 0);
      let eventName = "message";
      const dataLines: string[] = [];
      for (const line of lines) {
        if (line.startsWith("event:")) {
          eventName = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          dataLines.push(line.slice(5).trim());
        }
      }
      if (dataLines.length === 0) continue;
      const dataStr = dataLines.join("");
      let parsed: unknown;
      try {
        parsed = JSON.parse(dataStr);
      } catch {
        continue;
      }

      if (eventName === "meta") {
        handlers.onMeta?.(parsed as StreamMetaPayload);
      } else if (eventName === "token") {
        const t = (parsed as { text?: string })?.text;
        if (t) handlers.onToken?.(t);
      } else if (eventName === "done") {
        const wrap = parsed as { success?: boolean; data?: QueryResult };
        if (wrap?.success && wrap.data) result = wrap.data;
      } else if (eventName === "error") {
        const msg = (parsed as { message?: string })?.message ?? "Stream error";
        throw new Error(msg);
      }
    }
  }

  if (!result) {
    throw new Error("Stream ended before completion");
  }
  return result;
}

export async function getQueryHistory(params: {
  page?: number;
  limit?: number;
  documentId?: string;
}) {
  const { data } = await serverInstance.get<{
    success: true;
    data: QueryHistoryLog[];
    pagination: Pagination;
  }>("/query/history", { params: { page: 1, limit: 20, ...params } });
  return data;
}
