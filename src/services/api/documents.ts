import { serverInstance } from "@/services/axios";
import type {
  Document,
  IngestBody,
  IngestResponse,
  ListDocumentsParams,
  Pagination,
} from "@/types/document";

export async function ingestUrl(body: IngestBody) {
  const { data } = await serverInstance.post<
    | { success: true; data: IngestResponse; message?: string }
    | { success: true; message: string; data: { documentId: string; status: string } }
  >("/documents/ingest", body);
  return data;
}

export async function listDocuments(params: ListDocumentsParams = {}) {
  const { data } = await serverInstance.get<{
    success: true;
    data: Document[];
    pagination: Pagination;
  }>("/documents", { params: { page: 1, limit: 20, ...params } });
  return data;
}

export async function getSiteKeys(): Promise<string[]> {
  const { data } = await serverInstance.get<{ success: true; data: string[] }>(
    "/documents/site-keys"
  );
  return data?.data ?? [];
}

export async function getDocumentById(id: string) {
  const { data } = await serverInstance.get<{ success: true; data: Document }>(
    `/documents/${id}`
  );
  return data;
}

export async function deleteDocument(id: string) {
  const { data } = await serverInstance.delete<{
    success: true;
    message: string;
  }>(`/documents/${id}`);
  return data;
}

export async function reindexDocument(id: string) {
  const { data } = await serverInstance.post<{
    success: true;
    message: string;
    data: { documentId: string };
  }>(`/documents/${id}/reindex`);
  return data;
}
