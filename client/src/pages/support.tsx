import { Mail, MessageCircle, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthShell } from "@/components/auth/auth-shell";

export default function Support() {
  return (
    <AuthShell
      eyebrow="We're here for you"
      brandSubtitle="Reach out whenever you need a little extra help"
      footer={
        <p className="text-stone-400 text-xs">
          Support replies within 24 hours on weekdays.
        </p>
      }
    >
      <Card
        className="rounded-organic stone-shadow border-0 bg-white/85 backdrop-blur-sm"
        style={{
          background:
            "linear-gradient(135deg, hsla(260, 45%, 94%, 0.95) 0%, hsla(25, 50%, 92%, 0.95) 100%)",
        }}
      >
        <CardHeader className="space-y-4 pb-1 text-stone-600">
          <CardTitle className="font-serif text-2xl">
            Let's solve this together
          </CardTitle>
          <p className="text-base leading-relaxed text-stone-500">
            Tell us what's happening, and we'll follow up with care, tips, and the right next steps.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 text-stone-500">
          <div className="flex items-start gap-3 rounded-2xl bg-white/70 px-4 py-3">
            <LifeBuoy className="h-5 w-5 text-lavender-400" />
            <div>
              <p className="font-medium text-stone-600">Emergency resources</p>
              <p className="text-sm">
                If you need immediate help, head to the crisis support tab or contact your local emergency services.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3">
            <Mail className="h-5 w-5 text-sage-400" />
            <div className="flex-1">
              <p className="font-medium text-stone-600">Email us</p>
              <p className="text-sm">support@softmoves.app</p>
            </div>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-stone-200 bg-white/80 text-stone-500"
            >
              <a href="mailto:support@softmoves.app?subject=MoodMinder%20support%20request">
                Compose mail
              </a>
            </Button>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3">
            <MessageCircle className="h-5 w-5 text-peach-400" />
            <div className="flex-1">
              <p className="font-medium text-stone-600">Community chat</p>
              <p className="text-sm">Join our Discord to share tips with other MoodMinder travelers.</p>
            </div>
            <Button
              asChild
              className="rounded-full text-sm px-6"
              style={{
                background:
                  "linear-gradient(135deg, hsl(260, 45%, 82%) 0%, hsl(15, 60%, 80%) 100%)",
                color: "hsl(25, 20%, 18%)",
              }}
            >
              <a href="https://discord.gg/softmoves" target="_blank" rel="noopener noreferrer">
                Open Discord
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
