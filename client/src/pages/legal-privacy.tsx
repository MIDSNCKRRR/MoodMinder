import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthShell } from "@/components/auth/auth-shell";

const sections = [
  {
    title: "1. Data we collect",
    body: "Account details (email, nickname) and the reflections you choose to save inside MoodMinder.",
  },
  {
    title: "2. How it's used",
    body: "Entries stay private to you unless you explicitly share them. Aggregated analytics help improve the app with anonymized trends only.",
  },
  {
    title: "3. Storage",
    body: "We store data securely in Supabase (PostgreSQL) with encryption at rest and in transit.",
  },
  {
    title: "4. AI features",
    body: "AI prompts are processed via OpenAI. We never use your content to train external models beyond standard retention safety windows.",
  },
  {
    title: "5. Cookies",
    body: "Session cookies keep you signed in. You can clear them anytime via logout or your browser settings.",
  },
  {
    title: "6. Deleting data",
    body: "You can export or delete your data from Settings → Privacy. Removing your account erases journal entries within 30 days.",
  },
  {
    title: "7. Contact",
    body: "Have a privacy question or request? Email privacy@softmoves.app.",
  },
];

export default function LegalPrivacy() {
  return (
    <AuthShell
      eyebrow="Privacy"
      brandSubtitle="How we protect your emotions and memories"
    >
      <Card
        className="rounded-organic stone-shadow border-0 bg-white/85 backdrop-blur-sm"
        style={{
          background:
            "linear-gradient(135deg, hsla(260, 40%, 95%, 0.95) 0%, hsla(120, 40%, 94%, 0.95) 100%)",
        }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="font-serif text-2xl text-stone-700">
            Privacy Policy
          </CardTitle>
          <p className="text-sm text-stone-400">Last updated: May 2024</p>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[360px] pr-4 text-sm leading-relaxed text-stone-600">
            <p className="mb-4">
              We take your stories seriously. This summary explains our current practices.
            </p>
            {sections.map((section) => (
              <section key={section.title} className="mb-4">
                <h2 className="font-medium text-stone-700 mb-1">{section.title}</h2>
                <p>{section.body}</p>
              </section>
            ))}
            <p className="text-stone-500 mt-6">
              We'll update this policy if we add new features or integrate additional services.
            </p>
          </ScrollArea>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
