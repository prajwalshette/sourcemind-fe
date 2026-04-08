import { useMutation, useQuery } from "@tanstack/react-query";
import { query as queryApi, getQueryHistory } from "@/services/api/query";
import type { QueryBody } from "@/types/query";

export function useRagQuery() {
  return useMutation({
    mutationFn: async (body: QueryBody) => {
      return queryApi(body);
    },
  });
}

export function useQueryHistory(params: {
  page?: number;
  limit?: number;
  documentId?: string;
}) {
  return useQuery({
    queryKey: ["queryHistory", params.page ?? 1, params.limit ?? 20, params.documentId ?? ""],
    queryFn: async () => {
      const res = await getQueryHistory(params);
      return { logs: res.data, pagination: res.pagination };
    },
  });
}
