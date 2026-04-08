import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSession as createSessionApi,
  deleteSession as deleteSessionApi,
  getSessionThread as getSessionThreadApi,
  listSessions as listSessionsApi,
  updateSessionTitle as updateSessionTitleApi,
} from "@/services/api/sessions";

export function useSessionsList(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["sessions", params?.page ?? 1, params?.limit ?? 20],
    queryFn: async () => {
      const res = await listSessionsApi(params);
      return { sessions: res.data, pagination: res.pagination };
    },
  });
}

export function useSessionThread(sessionId: string | null) {
  return useQuery({
    queryKey: ["sessionThread", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      return getSessionThreadApi(sessionId);
    },
    enabled: !!sessionId,
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSessionApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useUpdateSessionTitle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (opts: { id: string; title: string }) => {
      await updateSessionTitleApi(opts.id, opts.title);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      qc.invalidateQueries({ queryKey: ["sessionThread", vars.id] });
    },
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteSessionApi(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

