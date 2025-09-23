import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";

export default function AccountLocked() {
  return (
    <AuthShell
      eyebrow="Account on pause"
      brandSubtitle="We're keeping things secure while you catch your breath"
      footer={
        <>
          Need urgent access?
          <Link href="/support" className="text-peach-400 font-medium ml-1">
            Reach out to support
          </Link>
        </>
      }
    >
      <Card
        className="rounded-organic stone-shadow border-0 bg-white/85 backdrop-blur-sm"
        style={{
          background:
            "linear-gradient(135deg, hsla(15, 40%, 92%, 0.95) 0%, hsla(0, 55%, 92%, 0.95) 100%)",
        }}
      >
        <CardHeader className="space-y-4 pb-2">
          <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center mx-auto stone-shadow">
            <ShieldAlert className="h-7 w-7 text-coral-400" />
          </div>
          <CardTitle className="font-serif text-center text-stone-700 text-2xl leading-snug">
            Your account is temporarily locked
          </CardTitle>
          <CardDescription className="text-stone-500 text-center text-base leading-relaxed">
            For your safety, we've paused logins after repeated attempts. Try again in 15 minutes or reset your password to regain access.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <Button
            asChild
            className="w-full h-12 rounded-full text-base font-medium stone-shadow"
            style={{
              background:
                "linear-gradient(135deg, hsl(15, 70%, 72%) 0%, hsl(25, 55%, 78%) 100%)",
              color: "hsl(25, 25%, 20%)",
            }}
          >
            <Link href="/password-reset">Reset password</Link>
          </Button>
          <div className="text-center text-sm text-stone-400">
            <Link href="/login" className="text-peach-400 font-medium">
              Try logging in again later
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
