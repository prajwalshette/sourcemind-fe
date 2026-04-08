export interface QuerySource {
  index: number; // 1-based, matches [Source 1], [Source 2] in the answer
  url: string;
  section: string | null;
  excerpt: string;
  score: number;
  relevanceScore?: number;
}

export interface QueryResult {
  answer: string;
  sources: QuerySource[];
  model: string;
  confidence: number;
  fromCache: boolean;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  langsmithRunUrl?: string;
  intelligence?: {
    used: boolean;
    chunksBeforeFilter: number;
    chunksAfterFilter: number;
    droppedChunks: number;
    compressionRatio: number;
    processingMs: number;
  };
  /** Present when backend used decompose + expansion pipeline */
  retrieval?: {
    subQuestions: string[];
    isCompound: boolean;
  };
}

export interface QueryBody {
  question: string;
  documentId?: string;
  sessionId?: string;
  /** Search across all pages of a site crawl (use instead of documentId) */
  siteKey?: string;
  topK?: number;
  useCache?: boolean;
  skipIntelligence?: boolean;
  domain?: string;
  useHybrid?: boolean;
  skipAudit?: boolean;
  /** Skip Gemini query expansion (default: expand when backend has GEMINI_API_KEY) */
  skipQueryExpansion?: boolean;
}

export interface QueryHistoryLog {
  id: string;
  question: string;
  answer: string;
  sources: unknown;
  confidence: number | null;
  latencyMs: number | null;
  model: string | null;
  fromCache: boolean | null;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
