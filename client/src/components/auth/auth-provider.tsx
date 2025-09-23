import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

interface AuthUser {
  id: string;
  email?: string;
  [key: string]: unknown;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  refetchUser: () => Promise<AuthUser | null | undefined>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchCurrentUser(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (res.status === 401) {
    return null;
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  const data = await res.json();
  return data?.user ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const query = useQuery({
    queryKey: ["current-user"],
    queryFn: fetchCurrentUser,
    staleTime: 0,
    retry: false,
  });

  const value: AuthContextValue = {
    user: query.data ?? null,
    isLoading: query.isLoading,
    refetchUser: async () => {
      const result = await query.refetch();
      return result.data;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
