import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { register as registerApi, login as loginApi, getMe } from "@/services/api/auth";
import type { RegisterBody, LoginBody } from "@/types/auth";

const AUTH_TOKEN_KEY = "authToken";
const USER_KEY = "user";

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuthStorage(token: string, user: { id: string; email: string; role: string }) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthStorage() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await getMe();
      return res.data;
    },
    enabled: !!getStoredToken(),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: LoginBody) => {
      const res = await loginApi(body);
      setAuthStorage(res.data.token, res.data.user);
      return res.data;
    },
    onSuccess: () => {
      queryClient.setQueryData(["me"], (data: unknown) => data);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: RegisterBody) => {
      const res = await registerApi(body);
      setAuthStorage(res.data.token, res.data.user);
      return res.data;
    },
    onSuccess: () => {
      queryClient.setQueryData(["me"], (data: unknown) => data);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return () => {
    clearAuthStorage();
    queryClient.clear();
    window.location.href = "/login";
  };
}
