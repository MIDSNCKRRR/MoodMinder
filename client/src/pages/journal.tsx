import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Heart,
  Sparkles,
  BookOpen,
  ChevronRight,
  Info,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import EmotionJournal from "@/components/journal-types/emotion-journal";
import GratitudeJournal from "@/components/journal-types/gratitude-journal";
import ReflectionJournal from "@/components/journal-types/reflection-journal";
import type { JournalEntry } from "@shared/schema";

type JournalType = "emotion" | "gratitude" | "reflection";

interface JournalTypeOption {
  id: JournalType;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

export default function Journal() {
  const [selectedJournalType, setSelectedJournalType] =
    useState<JournalType | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // Fetch journal entries
  const { data: journalEntries = [] } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
  });

  const journalTypes: JournalTypeOption[] = [
    {
      id: "emotion",
      title: "Body Journal",
      description: "Track your physical and emotional state",
      icon: Heart,
      color: "hsl(15, 40%, 58%)",
      bgColor:
        "linear-gradient(135deg, hsl(15, 55%, 93%) 0%, hsl(15, 50%, 78%) 100%)",
    },
    {
      id: "gratitude",
      title: "Identity Journal",
      description: "Explore your values and sense of self",
      icon: Sparkles,
      color: "hsl(120, 4%, 50%)",
      bgColor:
        "linear-gradient(135deg, hsl(120, 12%, 91%) 0%, hsl(120, 10%, 83%) 100%)",
    },
    {
      id: "reflection",
      title: "Re-Framing Journal",
      description: "Transform negative thoughts into positive perspectives",
      icon: BookOpen,
      color: "hsl(260, 25%, 70%)",
      bgColor:
        "linear-gradient(135deg, hsl(260, 45%, 96%) 0%, hsl(260, 40%, 91%) 100%)",
    },
  ];

  const getRecentEntriesByType = (type: JournalType) => {
    return journalEntries
      .filter((entry) => entry.journalType === type)
      .slice(0, 3);
  };

  const getJournalInfoTitle = (journalType: JournalType) => {
    switch (journalType) {
      case "emotion":
        return "About Body Journal";
      case "gratitude":
        return "About Identity Journal";
      case "reflection":
        return "About Re-Framing Journal";
      default:
        return "About This Journal";
    }
  };

  const getJournalInfoContent = (journalType: JournalType) => {
    switch (journalType) {
      case "emotion":
        return (
          <div className="space-y-3">
            <p>
              The Body Journal helps you start your day with emotional awareness
              and physical check-ins.
            </p>
            <div className="space-y-2">
              <p>
                <strong>How to use:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  Choose from 12 different emotions that best describe your
                  current state
                </li>
                <li>Map where you feel these emotions in your body</li>
                <li>
                  Write about your physical sensations and emotional state
                </li>
                <li>This practice helps build mind-body awareness</li>
              </ul>
            </div>
          </div>
        );
      case "gratitude":
        return (
          <div className="space-y-3">
            <p>
              The Identity Journal helps you explore your values, beliefs, and
              authentic sense of self.
            </p>
            <div className="space-y-2">
              <p>
                <strong>How to use:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  Reflect on your core values and what matters most to you
                </li>
                <li>
                  Explore different aspects of your identity and personality
                </li>
                <li>Write about your goals, dreams, and aspirations</li>
                <li>Regular practice builds self-awareness and confidence</li>
              </ul>
            </div>
          </div>
        );
      case "reflection":
        return (
          <div className="space-y-3">
            <p>
              The Re-Framing Journal helps transform negative thought patterns
              into positive, balanced perspectives.
            </p>
            <div className="space-y-2">
              <p>
                <strong>How to use:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Identify negative or unhelpful thoughts</li>
                <li>
                  Challenge these thoughts with evidence and alternative views
                </li>
                <li>Rewrite situations from a more balanced perspective</li>
                <li>Practice builds resilience and emotional regulation</li>
              </ul>
            </div>
          </div>
        );
      default:
        return <p>Learn more about this journaling practice.</p>;
    }
  };

  return (
    <div className="px-6 space-y-6">
      {/* Header with Info Button - only show on main journal selection page */}
      {!selectedJournalType && (
        <div className="pt-6 pb-1">
          <Card
            className="rounded-organic stone-shadow border-0"
            style={{
              background:
                "linear-gradient(135deg, hsl(140, 35%, 93%) 0%, hsl(140, 30%, 85%) 100%)",
            }}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex-1 text-center">
                  <h1 className="font-serif font-semibold text-lg text-stone-600 mb-1">
                    Journals
                  </h1>
                  {/* <p className="text-stone-500 text-xs">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p> */}
                </div>
                <Button
                  onClick={() => setShowInfo(!showInfo)}
                  variant="ghost"
                  size="sm"
                  className="p-2 text-stone-500 hover:text-stone-600 hover:bg-white/50"
                  data-testid="info-button"
                >
                  <Info className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Panel - different content based on context */}
      {showInfo && (
        <Card
          className="rounded-organic stone-shadow border-0 relative"
          style={{
            background:
              "linear-gradient(135deg, hsl(260, 45%, 96%) 0%, hsl(260, 40%, 91%) 100%)",
          }}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-serif font-semibold text-stone-600 text-lg">
                {selectedJournalType
                  ? getJournalInfoTitle(selectedJournalType)
                  : "About Your Journaling"}
              </h3>
              <Button
                onClick={() => setShowInfo(false)}
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                data-testid="close-info"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2 text-sm text-stone-600">
              {selectedJournalType ? (
                getJournalInfoContent(selectedJournalType)
              ) : (
                <>
                  <p>
                    <strong>Body Journal:</strong> Start your day by checking in
                    with your emotional and physical state. Choose from 12
                    different feelings and map where you feel them in your body.
                  </p>
                  <p>
                    <strong>Identity Journal:</strong> Explore your values,
                    beliefs, and authentic sense of self to build confidence and
                    self-awareness.
                  </p>
                  <p>
                    <strong>Re-Framing Journal:</strong> Transform negative
                    thought patterns into positive, balanced perspectives for
                    better emotional regulation.
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journal Type Selection */}
      {!selectedJournalType && (
        <div className="space-y-4">
          {journalTypes.map((journalType) => {
            const Icon = journalType.icon;
            const recentEntries = getRecentEntriesByType(journalType.id);

            return (
              <Card
                key={journalType.id}
                className="rounded-organic stone-shadow border-0 relative cursor-pointer hover:scale-[1.02] transition-all duration-300"
                style={{ background: journalType.bgColor }}
                onClick={() => {
                  setSelectedJournalType(journalType.id);
                  setShowInfo(false); // Hide info panel when selecting a journal
                }}
                data-testid={`journal-type-${journalType.id}`}
              >
                <CardContent className="p-6">
                  <div className="botanical-accent relative"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
                        <Icon
                          className="w-6 h-6"
                          style={{ color: journalType.color }}
                        />
                      </div>
                      <div>
                        <h3 className="font-serif font-semibold text-stone-600 text-lg">
                          {journalType.title}
                        </h3>
                        <p className="text-stone-500 text-sm">
                          {journalType.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-400" />
                  </div>

                  {/* Entry status */}
                  {recentEntries.length === 0 && (
                    <div className="bg-white/60 p-3 rounded-stone">
                      <p className="text-stone-400 text-sm italic">
                        No entries yet - tap to start writing
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Show specific journal type */}
      {selectedJournalType === "emotion" && (
        <EmotionJournal onBack={() => setSelectedJournalType(null)} />
      )}

      {selectedJournalType === "gratitude" && (
        <GratitudeJournal onBack={() => setSelectedJournalType(null)} />
      )}

      {selectedJournalType === "reflection" && (
        <ReflectionJournal onBack={() => setSelectedJournalType(null)} />
      )}
    </div>
  );
}
