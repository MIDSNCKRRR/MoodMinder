import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthShell } from "@/components/auth/auth-shell";

const sections = [
  {
    title: "1. Purpose",
    body: "MoodMinder helps you understand emotional patterns and is not a substitute for professional medical advice.",
  },
  {
    title: "2. Eligibility",
    body: "By creating an account you confirm you are at least 16 years old or have guardian consent to use the service.",
  },
  {
    title: "3. Your Responsibilities",
    body: "You agree to provide accurate information, keep your password secure, and use MoodMinder in accordance with local laws.",
  },
  {
    title: "4. Content",
    body: "You own your journal entries. We never share them publicly and only use them to power features you opt into.",
  },
  {
    title: "5. Service Changes",
    body: "We may update or discontinue parts of the app. We'll communicate major changes in advance whenever possible.",
  },
  {
    title: "6. Termination",
    body: "We reserve the right to suspend or terminate accounts that violate these terms or compromise community safety.",
  },
  {
    title: "7. Contact",
    body: "Questions about these terms? Email legal@softmoves.app and we'll respond within 7 business days.",
  },
];

export default function LegalTerms() {
  return (
    <AuthShell
      eyebrow="Legal"
      brandSubtitle="The promises we make to keep MoodMinder safe"
    >
      <Card
        className="rounded-organic stone-shadow border-0 bg-white/85 backdrop-blur-sm"
        style={{
          background:
            "linear-gradient(135deg, hsla(25, 45%, 94%, 0.95) 0%, hsla(45, 40%, 94%, 0.95) 100%)",
        }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="font-serif text-2xl text-stone-700">
            Terms of Service
          </CardTitle>
          <p className="text-sm text-stone-400">Last updated: May 2024</p>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[360px] pr-4 text-sm leading-relaxed text-stone-600">
            <p className="mb-4">
              Please read these terms carefully. Using MoodMinder means you accept them.
            </p>
            {sections.map((section) => (
              <section key={section.title} className="mb-4">
                <h2 className="font-medium text-stone-700 mb-1">{section.title}</h2>
                <p>{section.body}</p>
              </section>
            ))}
            <p className="text-stone-500 mt-6">
              If we make material updates to these terms, we'll notify you by email and in-app banners.
            </p>
          </ScrollArea>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
