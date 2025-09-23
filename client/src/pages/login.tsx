import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Leaf } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { parseAuthError, useLoginMutation } from "@/hooks/use-auth";

export default function Login() {
  const [, navigate] = useLocation();
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loginMutation.isPending) return;

    setFormError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFormError("이메일을 입력해주세요.");
      return;
    }

    if (trimmedEmail !== email) {
      setEmail(trimmedEmail);
    }

    if (!password) {
      setFormError("비밀번호를 입력해주세요.");
      return;
    }

    loginMutation.mutate(
      { email: trimmedEmail, password },
      {
        onSuccess: () => {
          navigate("/");
        },
        onError: (error) => {
          const parsed = parseAuthError(error);

          if (parsed.status === 429) {
            navigate("/auth/account-locked");
            return;
          }

          if (parsed.status === 401) {
            setFormError("이메일 또는 비밀번호를 다시 확인해주세요.");
            return;
          }

          if (parsed.message.toLowerCase().includes("confirm")) {
            navigate("/auth/email-unverified");
            return;
          }

          setFormError(parsed.message);
        },
      },
    );
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      footer={
        <>
          <span>New to Soft Moves?</span>{" "}
          <Link href="/signup" className="text-peach-400 font-medium ml-1">
            Create an account
          </Link>
        </>
      }
    >
      <Card
        className="rounded-organic stone-shadow border-0 bg-white/80 backdrop-blur-sm"

                style={{
          background:
            "linear-gradient(135deg, hsla(120, 30%, 92%, 0.95) 0%, hsla(260, 35%, 92%, 0.95) 100%)",
        }}
        // style={{
        //   background:
        //     "linear-gradient(135deg, hsla(25, 35%, 90%, 0.95) 0%, hsla(25, 30%, 85%, 0.95) 100%)",
        // }}
      >
        <form onSubmit={handleSubmit} noValidate>
          <CardHeader className="space-y-3 pb-2">
           
            <CardTitle className="font-serif text-stone-700 text-[1.85rem] leading-tight">
              Let's reconnect<br /> with your innerself
            </CardTitle>
            {/* <CardDescription className="text-stone-500 text-base leading-relaxed">
              Sign in to log today's emotions and keep your mindful streak alive.
            </CardDescription> */}
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-stone-500 text-sm uppercase tracking-wider">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-12 rounded-full bg-white/60 text-stone-600 placeholder:text-stone-300"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-stone-500 text-sm uppercase tracking-wider">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="h-12 rounded-full bg-white/60 text-stone-600 placeholder:text-stone-300"
                required
              />
              <div className="flex justify-end">
                <Link
                  href="/password-reset"
                  className="text-sm text-peach-400 hover:text-peach-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {formError && (
              <p className="text-sm text-coral-400" role="alert">
                {formError}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-full text-base font-medium stone-shadow"
              style={{
              background:
              "linear-gradient(135deg, rgba(228, 241, 228, 0.95) 0%, rgba(232, 227, 242, 0.95) 100%)",
              color: "hsl(25, 20%, 20%)",
              }}
                disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging in..." : "Log In"}
            </Button>
      
          </CardContent>
        </form>
      </Card>
    </AuthShell>
  );
}
