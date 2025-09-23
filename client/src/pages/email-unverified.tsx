import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";

export default function EmailUnverified() {
  return (
    <AuthShell
      eyebrow="One more step"
      brandSubtitle="We've sent guidance to help you feel at home here"
      footer={
        <>
          Used the wrong email?
          <Link href="/signup" className="text-peach-400 font-medium ml-1">
            Sign up again
          </Link>
        </>
      }
    >
      <Card
        className="rounded-organic stone-shadow border-0 bg-white/85 backdrop-blur-sm"
        style={{
          background:
            "linear-gradient(135deg, hsla(45, 45%, 92%, 0.95) 0%, hsla(25, 45%, 90%, 0.95) 100%)",
        }}
      >
        <CardHeader className="space-y-4 pb-2">
          <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center mx-auto stone-shadow">
            <BadgeCheck className="h-7 w-7 text-sage-500" />
          </div>
          <CardTitle className="font-serif text-center text-stone-700 text-2xl leading-snug">
            Check your inbox to finish signing in
          </CardTitle>
          <CardDescription className="text-stone-500 text-center text-base leading-relaxed">
            We've sent a verification link to your email. Tap it to confirm and then return to log in. Didn't get it? Resend below.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            className="w-full h-12 rounded-full text-base font-medium stone-shadow"
            style={{
              background:
                "linear-gradient(135deg, hsl(120, 35%, 78%) 0%, hsl(260, 45%, 84%) 100%)",
              color: "hsl(25, 20%, 20%)",
            }}
          >
            Resend verification email
          </Button>
          <div className="text-center text-sm text-stone-400">
            <Link href="/login" className="text-peach-400 font-medium">
              I've already verified, take me to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
