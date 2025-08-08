import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Heart, Sparkles, BookOpen, ChevronRight } from "lucide-react";
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
  const [selectedJournalType, setSelectedJournalType] = useState<JournalType | null>(null);

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
      bgColor: "linear-gradient(135deg, hsl(15, 55%, 93%) 0%, hsl(15, 50%, 78%) 100%)"
    },
    {
      id: "gratitude", 
      title: "Gratitude Journal",
      description: "Reflect on what you're thankful for",
      icon: Sparkles,
      color: "hsl(120, 4%, 50%)",
      bgColor: "linear-gradient(135deg, hsl(120, 12%, 91%) 0%, hsl(120, 10%, 83%) 100%)"
    },
    {
      id: "reflection",
      title: "Daily Reflection",
      description: "Process your thoughts and experiences",
      icon: BookOpen,
      color: "hsl(260, 25%, 70%)", 
      bgColor: "linear-gradient(135deg, hsl(260, 45%, 96%) 0%, hsl(260, 40%, 91%) 100%)"
    }
  ];

  const getRecentEntriesByType = (type: JournalType) => {
    return journalEntries
      .filter(entry => entry.journalType === type)
      .slice(0, 3);
  };

  return (
    <div className="px-6 space-y-6">
      {/* Navigation */}
      {selectedJournalType && (
        <div className="pt-8">
          <Button
            onClick={() => setSelectedJournalType(null)}
            variant="ghost"
            size="sm"
            className="p-2"
            data-testid="back-to-journal-types"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
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
                onClick={() => setSelectedJournalType(journalType.id)}
                data-testid={`journal-type-${journalType.id}`}
              >
                <CardContent className="p-6">
                  <div className="botanical-accent relative"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6" style={{ color: journalType.color }} />
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
