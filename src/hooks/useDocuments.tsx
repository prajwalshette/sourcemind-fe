import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listDocuments,
  getSources,
  ingestUrl,
  ingestFiles,
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
    // Prevent accidental request storms in dev (StrictMode double-invokes,
    // window-focus refetch, retries on 429, etc.)
    staleTime: 15_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, err: unknown) => {
      const status =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined;
      if (status === 429) return false;
      return failureCount < 2;
    },
  });
}

export function useSources() {
  return useQuery({
    queryKey: ["sources"],
    queryFn: async () => {
      const list = await getSources();
      return Array.isArray(list) ? list : [];
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, err: unknown) => {
      const status =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined;
      if (status === 429) return false;
      return failureCount < 2;
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

export function useIngestFiles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ingestFiles,
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
