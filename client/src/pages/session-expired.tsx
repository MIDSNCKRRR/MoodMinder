import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";

export default function SessionExpired() {
  return (
    <AuthShell
      eyebrow="Session timed out"
      brandSubtitle="Let's pick up right where you left off"
      footer={
        <>
          Trouble signing back in?
          <Link href="/support" className="text-peach-400 font-medium ml-1">
            Contact support
          </Link>
        </>
      }
    >
      <Card
        className="rounded-organic stone-shadow border-0 bg-white/85 backdrop-blur-sm"
        style={{
          background:
            "linear-gradient(135deg, hsla(260, 45%, 92%, 0.95) 0%, hsla(120, 35%, 90%, 0.95) 100%)",
        }}
      >
        <CardHeader className="space-y-4 pb-2">
          <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center mx-auto stone-shadow">
            <Clock className="h-7 w-7 text-lavender-400" />
          </div>
          <CardTitle className="font-serif text-center text-stone-700 text-2xl leading-snug">
            Your mindful session has ended
          </CardTitle>
          <CardDescription className="text-stone-500 text-center text-base leading-relaxed">
            For security reasons we signed you out after a period of inactivity. Log in again to continue tracking your emotions.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <Button
            asChild
            className="w-full h-12 rounded-full text-base font-medium stone-shadow"
            style={{
              background:
                "linear-gradient(135deg, hsl(260, 45%, 84%) 0%, hsl(120, 40%, 82%) 100%)",
              color: "hsl(25, 20%, 20%)",
            }}
          >
            <Link href="/login">Log in again</Link>
          </Button>
          <div className="text-center text-sm text-stone-400">
            <Link href="/password-reset" className="text-peach-400 font-medium">
              Forgot your password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
