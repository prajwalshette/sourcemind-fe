import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listDocuments,
  getSiteKeys,
  ingestUrl,
  getDocumentById,
  deleteDocument,
  reindexDocument,
} from "@/services/api/documents";
import type { ListDocumentsParams } from "@/types/document";

export function useDocuments(params: ListDocumentsParams = {}) {
  return useQuery({
    queryKey: [
      "documents",
      params.page ?? 1,
      params.limit ?? 20,
      params.status ?? "",
      params.siteKey ?? "",
      !!params.rootOnly,
    ],
    queryFn: async () => {
      const res = await listDocuments(params);
      return { documents: res.data, pagination: res.pagination };
    },
  });
}

export function useSiteKeys() {
  return useQuery({
    queryKey: ["siteKeys"],
    queryFn: async () => {
      const list = await getSiteKeys();
      return Array.isArray(list) ? list : [];
    },
  });
}

export function useDocument(id: string | null) {
  return useQuery({
    queryKey: ["document", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await getDocumentById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useIngestDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ingestUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useReindexDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reindexDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}
