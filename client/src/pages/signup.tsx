import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Heart } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { parseAuthError, useSignupMutation } from "@/hooks/use-auth";

export default function Signup() {
  const [, navigate] = useLocation();
  const signupMutation = useSignupMutation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (signupMutation.isPending) return;

    setFormError(null);

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail) {
      setFormError("이메일을 입력해주세요.");
      return;
    }

    if (!password) {
      setFormError("비밀번호를 입력해주세요.");
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

    if (!acceptedTerms) {
      setFormError("약관에 동의해야 가입을 진행할 수 있습니다.");
      return;
    }

    if (trimmedEmail !== email) {
      setEmail(trimmedEmail);
    }

    if (trimmedName !== name) {
      setName(trimmedName);
    }

    signupMutation.mutate(
      {
        email: trimmedEmail,
        password,
        nickname: trimmedName || undefined,
      },
      {
        onSuccess: (data) => {
          if (data?.message?.toLowerCase().includes("confirm")) {
            navigate("/auth/email-unverified");
            return;
          }

          navigate("/");
        },
        onError: (error) => {
          const parsed = parseAuthError(error);

          if (parsed.status === 409) {
            setFormError("이미 가입된 이메일입니다. 로그인해 주세요.");
            return;
          }

          if (parsed.status === 400 && parsed.message.toLowerCase().includes("password")) {
            setFormError("비밀번호 조건을 다시 확인해주세요.");
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
      eyebrow="Start your journey"
      brandSubtitle="Let's build rituals that feel gentle and real"
      footer={
        <>
          <span>Already have an account?</span>{" "}
          <Link href="/login" className="text-peach-400 font-medium ml-1">
            Log in instead
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
      >
        <form onSubmit={handleSubmit} noValidate>
          <CardHeader className="space-y-3 pb-2">
            {/* <div className="flex items-center justify-between text-sage-500">
              <span className="inline-flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4" />
                mindful signup
              </span>
              <Heart className="h-4 w-4 opacity-60" />
            </div> */}
            <CardTitle className="font-serif text-stone-700 text-[1.8rem] leading-snug">
              Create a space for everyday feelings
            </CardTitle>
            <CardDescription className="text-stone-500 text-base leading-relaxed">
              We'll personalize MoodMinder with your name and gentle reminders.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-stone-500 text-sm uppercase tracking-wider">
                Preferred Name
              </Label>
              <Input
                id="displayName"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="How should we call you?"
                className="h-12 rounded-full bg-white/70 text-stone-600 placeholder:text-stone-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signupEmail" className="text-stone-500 text-sm uppercase tracking-wider">
                Email Address
              </Label>
              <Input
                id="signupEmail"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                className="h-12 rounded-full bg-white/70  text-stone-600 placeholder:text-stone-300"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signupPassword" className="text-stone-500 text-sm uppercase tracking-wider">
                Password
              </Label>
              <Input
                id="signupPassword"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Create a secure password"
                className="h-12 rounded-full bg-white/70  text-stone-600 placeholder:text-stone-300"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signupConfirmPassword" className="text-stone-500 text-sm uppercase tracking-wider">
                Confirm Password
              </Label>
              <Input
                id="signupConfirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Repeat your password"
                className="h-12 rounded-full bg-white/70 text-stone-600 placeholder:text-stone-300"
                required
              />
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-white/60 border px-4 py-3">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                className="mt-1 border-stone-300 data-[state=checked]:bg-stone-900 data-[state=checked]:border-stone-900 data-[state=checked]:text-white transition-colors"
                required
              />
              <Label
                htmlFor="terms"
                className="text-sm text-stone-500 leading-relaxed cursor-pointer"
              >
                I agree to the{" "}
                <Link href="/legal/terms" className="text-peach-400 font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/legal/privacy" className="text-peach-400 font-medium">
                  Privacy Policy
                </Link>.
              </Label>
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
                  // "linear-gradient(135deg, hsl(25, 60%, 82%) 0%, hsl(15, 65%, 74%) 100%)",
                  "linear-gradient(135deg, rgba(228, 241, 228, 0.95) 0%, rgba(232, 227, 242, 0.95) 100%)",
                color: "hsl(25, 20%, 20%)",
              }}
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? "Creating account..." : "Create account"}
            </Button>

            {/* <div className="relative text-center text-sm text-stone-400">
              <span className="px-3 bg-white/70 backdrop-blur-sm">or sign up with</span>
              <div className="absolute left-0 top-1/2 h-px w-full bg-stone-200 -z-10" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-stone-200 bg-white/70 text-stone-500 shadow-sm"
                disabled={signupMutation.isPending}
              >
                Supabase
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-stone-200 bg-white/70 text-stone-500 shadow-sm"
                disabled={signupMutation.isPending}
              >
                Continue with Apple
              </Button>
            </div> */}
          </CardContent>
        </form>
      </Card>
    </AuthShell>
  );
}
