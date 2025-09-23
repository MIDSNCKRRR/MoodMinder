import { FormEvent, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { parseAuthError, usePasswordResetRequestMutation } from "@/hooks/use-auth";

export default function PasswordResetRequest() {
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const resetMutation = usePasswordResetRequestMutation();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (resetMutation.isPending) return;

    setFormError(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFormError("이메일을 입력해주세요.");
      return;
    }

    if (trimmedEmail !== email) {
      setEmail(trimmedEmail);
    }

    resetMutation.mutate(
      { email: trimmedEmail },
      {
        onSuccess: () => {
          setSuccessMessage("재설정 이메일을 전송했어요. 받은 편지함을 확인해 주세요.");
        },
        onError: (error) => {
          const parsed = parseAuthError(error);

          if (parsed.status === 404) {
            setFormError("등록되지 않은 이메일입니다. 회원가입을 먼저 진행해 주세요.");
            return;
          }

          setFormError(parsed.message);
        },
      },
    );
  };

  return (
    <AuthShell
      eyebrow="Reset password"
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="text-peach-400 font-medium">
            Back to login
          </Link>
        </>
      }
    >
      <Card
        className="rounded-organic stone-shadow border-0 bg-white/80 backdrop-blur-sm"
        style={{
          background:
            "linear-gradient(135deg, hsla(260, 40%, 94%, 0.95) 0%, hsla(120, 35%, 93%, 0.95) 100%)",
        }}
      >
        <form onSubmit={handleSubmit} noValidate>
          <CardHeader className="space-y-3 pb-2">
            <div className="inline-flex itemgs-center gap-2 px-4 py-2 rounded-full bg-white/70 text-sage-500 text-sm w-fit">
              <Mail className="h-4 w-4" />
              We'll email you a reset link
            </div>
            <CardTitle className="font-serif text-stone-700 text-[1.8rem] leading-snug">
              Let's get you back in
            </CardTitle>
            <CardDescription className="text-stone-500 text-base leading-relaxed">
              Enter the email tied to your account and we'll send step-by-step instructions.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="resetEmail" className="text-stone-500 text-sm uppercase tracking-wider">
                Email Address
              </Label>
              <Input
                id="resetEmail"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                className="h-12 rounded-full bg-white/70 border-stone-200 text-stone-600 placeholder:text-stone-300"
                required
              />
            </div>

            {formError && (
              <p className="text-sm text-coral-400" role="alert">
                {formError}
              </p>
            )}

            {successMessage && (
              <p className="text-sm text-sage-500" role="status">
                {successMessage}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-full text-base font-medium stone-shadow"
              style={{
                background:
                  "linear-gradient(135deg, hsl(120, 35%, 75%) 0%, hsl(260, 45%, 80%) 100%)",
                color: "hsl(25, 20%, 20%)",
              }}
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending ? "Sending..." : "Send reset link"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </AuthShell>
  );
}
