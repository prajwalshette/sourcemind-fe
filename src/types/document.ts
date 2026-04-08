export type DocumentStatus = "PENDING" | "INDEXED" | "FAILED" | "REINDEXING";

export interface Document {
  id: string;
  url: string;
  title: string | null;
  status: DocumentStatus;
  siteKey: string | null;
  chunkCount: number | null;
  tokenCount: number | null;
  contentType: string | null;
  crawledAt: Date | null;
  indexedAt: Date | null;
  errorMessage: string | null;
  createdAt: Date;
}

export interface IngestBody {
  url: string;
  async?: boolean;
  webhookUrl?: string;
  crawlAllPages?: boolean;
  maxPages?: number;
}

export interface IngestResponse {
  documentId: string;
  chunkCount?: number;
  tokenCount?: number;
  status: string;
  title?: string;
}

export interface ListDocumentsParams {
  page?: number;
  limit?: number;
  status?: string;
  siteKey?: string;
  rootOnly?: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
