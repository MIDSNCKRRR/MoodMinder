import { dataTagSymbol, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  userId: string;
  expiresAt?: number | null;
}

interface SignupPayload {
  email: string;
  password: string;
  nickname?: string;
}

interface SignupResponse {
  userId?: string;
  expiresAt?: number | null;
  message?: string;
}

interface PasswordResetRequestPayload {
  email: string;
}

interface PasswordResetConfirmPayload {
  email: string;
  verificationCode: string;
  password: string;
  confirmPassword: string;
}

export interface ParsedAuthError {
  status?: number;
  message: string;
}

export function parseAuthError(error: unknown): ParsedAuthError {
  if (error instanceof Error) {
    const match = error.message.match(/^(\d+):\s*(.*)$/);
    if (match) {
      const [, status, msg] = match;
      return {
        status: Number(status),
        message: msg?.trim() || "Something went wrong",
      };
    }
    return { message: error.message };
  }

  return { message: "Unexpected error occurred" };
}

export function useLoginMutation() {
  const { toast } = useToast();

  return useMutation<LoginResponse, unknown, LoginPayload>({
    mutationFn: async (payload) => {
      const res = await apiRequest("POST", "/api/auth/login", payload);
      const data = (await res.json()) as LoginResponse;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      queryClient.invalidateQueries();
      toast({
        title: "Welcome back",
        description: "You're logged in. Let's continue your routine.",
      });
    },
  });
}

export function useSignupMutation() {
  const { toast } = useToast();

  return useMutation<SignupResponse, unknown, SignupPayload>({
    mutationFn: async (payload) => {
      const res = await apiRequest("POST", "/api/auth/signup", payload);
      const data = (await res.json()) as SignupResponse;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      queryClient.invalidateQueries();
      if (data.userId) {
        toast({
          title: "Account created",
          description: "You're all set. Let's explore how you feel today.",
        });
      } else {
        toast({
          title: "Almost there",
          description: "Check your email to confirm your account.",
        });
      }
    },
  });
}

export function usePasswordResetRequestMutation() {
  const { toast } = useToast();

  return useMutation<unknown, unknown, PasswordResetRequestPayload>({
    mutationFn: async (payload) => {
      const res = await apiRequest("POST", "/api/auth/password-reset", payload);
      if (res.headers.get("content-type")?.includes("application/json")) {
        return res.json();
      }
      return res.text();
    },
    onSuccess: () => {
      toast({
        title: "Reset email sent",
        description: "Check your inbox for the next steps.",
      });
    },
  });
}

export function usePasswordResetConfirmMutation() {
  const { toast } = useToast();

  return useMutation<unknown, unknown, PasswordResetConfirmPayload>({
    mutationFn: async (payload) => {
      const res = await apiRequest(
        "POST",
        "/api/auth/password-reset/confirm",
        payload,
      );
      if (res.headers.get("content-type")?.includes("application/json")) {
        return res.json();
      }
      return res.text();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Use your new password to log back in.",
      });
    },
  });
}

export function useLogoutMutation() {
  const { toast } = useToast();

  return useMutation<void, unknown>({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["current-user"], null);
      queryClient.invalidateQueries();
      toast({
        title: "Logged out",
        description: "See you next time.",
      });
    },
  });
}
