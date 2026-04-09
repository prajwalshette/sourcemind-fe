import { serverInstance } from "@/services/axios";

export async function getUsageStats() {
  const { data } = await serverInstance.get("/usage");
  return data;
}

export async function getDashboardStats() {
  const { data } = await serverInstance.get("/usage/dashboard");
  return data;
}
