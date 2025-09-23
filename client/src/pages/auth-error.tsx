import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";

export default function AuthError() {
  return (
    <AuthShell
      eyebrow="Something went wrong"
      brandSubtitle="We hit a bump while keeping your account safe"
      footer={
        <>
          Need help?
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
            "linear-gradient(135deg, hsla(15, 45%, 92%, 0.95) 0%, hsla(45, 35%, 92%, 0.95) 100%)",
        }}
      >
        <CardHeader className="space-y-5 pb-2">
          <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center mx-auto stone-shadow">
            <AlertTriangle className="h-7 w-7 text-coral-400" />
          </div>
          <CardTitle className="font-serif text-center text-stone-700 text-2xl leading-snug">
            We couldn't complete that request
          </CardTitle>
          <CardDescription className="text-stone-500 text-center text-base leading-relaxed">
            Double-check your internet connection or try again in a moment. If the issue keeps appearing, let us know so we can help.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <Button
            asChild
            className="w-full h-12 rounded-full text-base font-medium stone-shadow"
            style={{
              background:
                "linear-gradient(135deg, hsl(260, 45%, 82%) 0%, hsl(25, 55%, 82%) 100%)",
              color: "hsl(25, 25%, 20%)",
            }}
          >
            <Link href="/login">Back to login</Link>
          </Button>
          <button
            type="button"
            className="w-full h-12 rounded-full border border-stone-200 bg-white/80 text-stone-500 text-base"
          >
            Try again
          </button>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
