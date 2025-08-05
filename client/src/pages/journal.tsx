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
      title: "Emotion Journal",
      description: "Track your feelings and emotional patterns",
      icon: Heart,
      color: "text-coral-500",
      bgColor: "bg-gradient-to-br from-coral-100 to-coral-200"
    },
    {
      id: "gratitude", 
      title: "Gratitude Journal",
      description: "Reflect on what you're thankful for",
      icon: Sparkles,
      color: "text-sage-500",
      bgColor: "bg-gradient-to-br from-sage-100 to-sage-200"
    },
    {
      id: "reflection",
      title: "Daily Reflection",
      description: "Process your thoughts and experiences",
      icon: BookOpen,
      color: "text-lavender-500", 
      bgColor: "bg-gradient-to-br from-lavender-100 to-lavender-200"
    }
  ];

  const getRecentEntriesByType = (type: JournalType) => {
    return journalEntries
      .filter(entry => entry.journalType === type)
      .slice(0, 3);
  };

  return (
    <div className="px-6 space-y-6">
      {/* Status Bar */}
      <div className="flex justify-between items-center pt-8 text-stone-400 text-sm">
        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <div className="flex space-x-1">
          <div className="w-4 h-2 bg-stone-300 rounded-sm"></div>
          <div className="w-4 h-2 bg-stone-300 rounded-sm"></div>
          <div className="w-6 h-2 bg-stone-300 rounded-sm"></div>
        </div>
      </div>

      {/* Journal Header */}
      <div className="text-center pt-4">
        <div className="flex items-center justify-center space-x-3">
          {selectedJournalType && (
            <Button
              onClick={() => setSelectedJournalType(null)}
              variant="ghost"
              size="sm"
              className="p-2"
              data-testid="back-to-journal-types"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="text-center">
            <h1 className="text-2xl font-serif font-semibold text-stone-600">Journal</h1>
            <p className="text-stone-400 text-sm mt-1">Choose your journaling style</p>
          </div>
        </div>
      </div>

      {/* Journal Type Selection */}
      {!selectedJournalType && (
        <div className="space-y-4">
          {journalTypes.map((journalType) => {
            const Icon = journalType.icon;
            const recentEntries = getRecentEntriesByType(journalType.id);
            
            return (
              <Card 
                key={journalType.id}
                className={`${journalType.bgColor} rounded-organic stone-shadow border-0 relative cursor-pointer hover:scale-[1.02] transition-all duration-300`}
                onClick={() => setSelectedJournalType(journalType.id)}
                data-testid={`journal-type-${journalType.id}`}
              >
                <CardContent className="p-6">
                  <div className="botanical-accent relative"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
                        <Icon className={`w-6 h-6 ${journalType.color}`} />
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
                  
                  {/* Recent entries preview */}
                  <div className="bg-white/60 p-3 rounded-stone">
                    <p className="text-xs font-medium text-stone-500 mb-2">
                      Recent entries: {recentEntries.length}
                    </p>
                    {recentEntries.length > 0 ? (
                      <p className="text-stone-600 text-sm line-clamp-2">
                        {recentEntries[0].content.substring(0, 100)}...
                      </p>
                    ) : (
                      <p className="text-stone-400 text-sm italic">
                        No entries yet - tap to start writing
                      </p>
                    )}
                  </div>
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
