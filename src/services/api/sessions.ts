import { serverInstance } from "@/services/axios";
import type { ChatSession, SessionThread, Pagination } from "@/types/session";

export async function createSession(body: {
  title?: string;
  siteKey?: string;
  documentId?: string;
}): Promise<ChatSession> {
  const { data } = await serverInstance.post<{ success: true; data: ChatSession }>(
    "/sessions",
    body,
  );
  return data.data;
}

export async function listSessions(params?: { page?: number; limit?: number }): Promise<{
  success: true;
  data: ChatSession[];
  pagination: Pagination;
}> {
  const { data } = await serverInstance.get<{
    success: true;
    data: ChatSession[];
    pagination: Pagination;
  }>("/sessions", { params: { page: 1, limit: 20, ...params } });
  return data;
}

export async function getSessionThread(id: string): Promise<SessionThread> {
  const { data } = await serverInstance.get<{ success: true; data: SessionThread }>(
    `/sessions/${id}`,
  );
  return data.data;
}

export async function updateSessionTitle(id: string, title: string): Promise<void> {
  await serverInstance.patch(`/sessions/${id}`, { title });
}

export async function deleteSession(id: string): Promise<void> {
  await serverInstance.delete(`/sessions/${id}`);
}

