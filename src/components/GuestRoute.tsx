import { Navigate } from "react-router-dom";
import { getStoredToken } from "@/hooks/useAuth";

/** Login / register — redirect to app when already authenticated */
export function GuestRoute({ children }: { children: React.ReactNode }) {
  if (getStoredToken()) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
