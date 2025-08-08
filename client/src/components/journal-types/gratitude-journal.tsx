import IdentityJournalFlow from "@/components/identity-journal/identity-journal-flow";

// Identity Journal with step-by-step mobile flow
interface GratitudeJournalProps {
  onBack: () => void;
}

export default function GratitudeJournal({ onBack }: GratitudeJournalProps) {
  return <IdentityJournalFlow onBack={onBack} />;
}