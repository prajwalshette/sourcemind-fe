const origin = import.meta.env.VITE_APP_BASE_URL ?? "http://localhost:3000";
export const baseURL = origin;
export const apiBaseURL = `${origin.replace(/\/$/, "")}/api/v1`;
