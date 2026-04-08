import { serverInstance } from "@/services/axios";
import type { RegisterBody, LoginBody, AuthResponse, AuthUser } from "@/types/auth";

export async function register(body: RegisterBody) {
  const { data } = await serverInstance.post<{ success: true; data: AuthResponse }>(
    "/auth/register",
    body
  );
  return data;
}

export async function login(body: LoginBody) {
  const { data } = await serverInstance.post<{ success: true; data: AuthResponse }>(
    "/auth/login",
    body
  );
  return data;
}

export async function getMe() {
  const { data } = await serverInstance.get<{ success: true; data: AuthUser }>(
    "/auth/me"
  );
  return data;
}
