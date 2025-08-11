import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { BookOpen, ArrowLeft, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ReframingJournalProps {
  onBack: () => void;
}

export default function ReframingJournal({ onBack }: ReframingJournalProps) {
  const { toast } = useToast();
  const [reframingAnswers, setReframingAnswers] = useState<string[]>(["", "", ""]);
  const [showInfo, setShowInfo] = useState(false);

  // Create journal entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async () => {
      const filledAnswers = reframingAnswers.filter(answer => answer.trim());
      if (filledAnswers.length === 0) {
        throw new Error("Please answer at least one re-framing question");
      }

      const content = reframingQuestions.map((question, index) => {
        if (reframingAnswers[index].trim()) {
          return `${question}\n${reframingAnswers[index]}\n`;
        }
        return '';
      }).filter(Boolean).join('\n');

      const response = await apiRequest("POST", "/api/journal-entries", {
        journalType: "reflection",
        emotionLevel: 3, // Default to neutral for reframing
        emotionType: "hopeful",
        content,
        bodyMapping: {},
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      toast({
        title: "Re-Framing Entry Saved",
        description: "Your re-framing entry has been saved successfully.",
      });
      setReframingAnswers(["", "", ""]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save re-framing entry",
        variant: "destructive",
      });
    },
  });

  const updateReframingAnswer = (index: number, value: string) => {
    const newAnswers = [...reframingAnswers];
    newAnswers[index] = value;
    setReframingAnswers(newAnswers);
  };

  const reframingQuestions = [
    "What negative thought are you experiencing?",
    "What evidence supports or challenges this thought?", 
    "How can you reframe this thought more positively?",
  ];

  return (
    <div className="space-y-6">
      {/* Header with navigation, title and info */}
      <div className="flex justify-between items-center pt-8">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="p-2"
          data-testid="back-to-journal-types"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <div className="text-center">
          <h2 className="text-xl font-serif font-semibold text-stone-600">Re-Framing Journal</h2>
          <p className="text-stone-400 text-sm">Transform negative thoughts into positive perspectives</p>
        </div>
        
        <Button
          onClick={() => setShowInfo(!showInfo)}
          variant="ghost"
          size="sm"
          className="p-2"
          data-testid="info-button"
        >
          <Info className="w-4 h-4" />
        </Button>
      </div>

      {/* Info Panel for Re-Framing Journal */}
      {showInfo && (
        <Card 
          className="rounded-organic stone-shadow border-0 relative"
          style={{ background: 'linear-gradient(135deg, hsl(260, 45%, 96%) 0%, hsl(260, 40%, 91%) 100%)' }}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-serif font-semibold text-stone-600 text-lg">About Re-Framing Journal</h3>
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
            <div className="space-y-3 text-sm text-stone-600">
              <p>The Re-Framing Journal helps transform negative thought patterns into positive, balanced perspectives.</p>
              <div className="space-y-2">
                <p><strong>How to use:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Identify negative or unhelpful thoughts</li>
                  <li>Challenge these thoughts with evidence and alternative views</li>
                  <li>Rewrite situations from a more balanced perspective</li>
                  <li>Practice builds resilience and emotional regulation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Re-framing Questions */}
      <Card className="rounded-organic stone-shadow border-0"
            style={{ background: "linear-gradient(135deg, hsl(260, 45%, 96%) 0%, hsl(260, 40%, 91%) 100%)" }}>
        <CardContent className="p-6">
          <div className="space-y-6">
            {reframingQuestions.map((question, index) => (
              <div key={index} style={{ background: "rgba(255, 255, 255, 0.8)" }} className="p-4 rounded-lg">
                <label className="block text-sm font-medium text-stone-600 mb-3">
                  {question}
                </label>
                <Textarea
                  value={reframingAnswers[index]}
                  onChange={(e) => updateReframingAnswer(index, e.target.value)}
                  className="w-full h-24 p-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent resize-none text-sm"
                  placeholder="Take your time to reframe..."
                  data-testid={`reframing-answer-${index}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Entry Button */}
      <Button
        onClick={() => createEntryMutation.mutate()}
        disabled={createEntryMutation.isPending || reframingAnswers.every(answer => !answer.trim())}
        className="w-full py-4 px-6 rounded-lg font-medium transition-all"
        style={{ 
          background: "linear-gradient(to right, hsl(260, 35%, 65%), hsl(260, 40%, 55%))",
          color: "white"
        }}
        data-testid="save-reframing-entry-button"
      >
        <BookOpen className="mr-2 h-4 w-4" />
        {createEntryMutation.isPending ? "Saving..." : "Save Re-Framing Entry"}
      </Button>
    </div>
  );
}