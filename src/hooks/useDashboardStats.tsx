import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/services/api/usage";

export interface DashboardStats {
  totals: {
    documents: number;
    chunks: number;
    queries: number;
    sessions: number;
  };
  recentDocuments: any[];
  activity: {
    date: string;
    docs: number;
    queries: number;
  }[];
  performance: {
    avgLatencyMs: number;
    cacheHitRate: number;
  };
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const res = await getDashboardStats();
      return res.data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
