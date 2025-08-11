import BodyJournalFlow from "@/components/body-journal/body-journal-flow";

// Body Journal with step-by-step mobile flow
interface EmotionJournalProps {
  onBack: () => void;
}

export default function EmotionJournal({ onBack }: EmotionJournalProps) {
  return <BodyJournalFlow onBack={onBack} />;
}