import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LockKeyhole } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { parseAuthError, usePasswordResetConfirmMutation } from "@/hooks/use-auth";

export default function PasswordResetConfirm() {
  const [, navigate] = useLocation();
  const confirmMutation = usePasswordResetConfirmMutation();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (confirmMutation.isPending) return;

    setFormError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFormError("이메일을 입력해주세요.");
      return;
    }

    if (!verificationCode.trim()) {
      setFormError("메일로 받은 인증 코드를 입력해주세요.");
      return;
    }

    if (!password) {
      setFormError("새 비밀번호를 입력해주세요.");
      return;
    }

    if (password.length < 8) {
      setFormError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (trimmedEmail !== email) {
      setEmail(trimmedEmail);
    }

    confirmMutation.mutate(
      {
        email: trimmedEmail,
        verificationCode: verificationCode.trim(),
        password,
        confirmPassword,
      },
      {
        onSuccess: () => {
          navigate("/login");
        },
        onError: (error) => {
          const parsed = parseAuthError(error);

          if (parsed.status === 400) {
            setFormError("인증 코드가 유효하지 않거나 만료되었습니다.");
            return;
          }

          if (parsed.status === 401) {
            setFormError("다시 인증 메일을 요청하고 새 코드를 입력해주세요.");
            return;
          }

          setFormError(parsed.message);
        },
      },
    );
  };

  return (
    <AuthShell
      eyebrow="Secure your account"
      brandSubtitle="Choose a password that feels strong yet memorable"
      footer={
        <>
          Need a new email link?
          <Link href="/password-reset" className="text-peach-400 font-medium ml-1">
            Resend instructions
          </Link>
        </>
      }
    >
      <Card
        className="rounded-organic stone-shadow border-0 bg-white/80 backdrop-blur-sm"
        style={{
          background:
            "linear-gradient(135deg, hsla(25, 40%, 93%, 0.95) 0%, hsla(15, 45%, 88%, 0.95) 100%)",
        }}
      >
        <form onSubmit={handleSubmit} noValidate>
          <CardHeader className="space-y-3 pb-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 text-coral-400 text-sm w-fit">
              <LockKeyhole className="h-4 w-4" />
              Update password
            </div>
            <CardTitle className="font-serif text-stone-700 text-[1.8rem] leading-snug">
              Set a fresh password
            </CardTitle>
            <CardDescription className="text-stone-500 text-base leading-relaxed">
              Paste the verification code from your email and choose a new password to secure your space.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
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
                placeholder="you@example.com"
                className="h-12 rounded-full bg-white/70 border-stone-200 text-stone-600 placeholder:text-stone-300"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="verificationCode" className="text-stone-500 text-sm uppercase tracking-wider">
                Verification Code
              </Label>
              <Input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value)}
                placeholder="Enter the 6-digit code"
                className="h-12 rounded-full bg-white/70 border-stone-200 text-stone-600 placeholder:text-stone-300"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-stone-500 text-sm uppercase tracking-wider">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Create a secure password"
                className="h-12 rounded-full bg-white/70 border-stone-200 text-stone-600 placeholder:text-stone-300"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-stone-500 text-sm uppercase tracking-wider">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Repeat your password"
                className="h-12 rounded-full bg-white/70 border-stone-200 text-stone-600 placeholder:text-stone-300"
                required
              />
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
                  "linear-gradient(135deg, hsl(260, 45%, 80%) 0%, hsl(120, 40%, 76%) 100%)",
                color: "hsl(25, 20%, 20%)",
              }}
              disabled={confirmMutation.isPending}
            >
              {confirmMutation.isPending ? "Saving..." : "Save new password"}
            </Button>

            <div className="text-center text-sm text-stone-400">
              <Link href="/login" className="text-peach-400 font-medium">
                Return to login
              </Link>
            </div>
          </CardContent>
        </form>
      </Card>
    </AuthShell>
  );
}
