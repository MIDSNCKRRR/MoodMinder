import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ReflectionJournalProps {
  onBack: () => void;
}

export default function ReflectionJournal({ onBack }: ReflectionJournalProps) {
  const { toast } = useToast();
  const [reflectionAnswers, setReflectionAnswers] = useState<string[]>(["", "", ""]);

  // Create journal entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async () => {
      const filledAnswers = reflectionAnswers.filter(answer => answer.trim());
      if (filledAnswers.length === 0) {
        throw new Error("Please answer at least one reflection question");
      }

      const content = reflectionQuestions.map((question, index) => {
        if (reflectionAnswers[index].trim()) {
          return `${question}\n${reflectionAnswers[index]}\n`;
        }
        return '';
      }).filter(Boolean).join('\n');

      const response = await apiRequest("POST", "/api/journal-entries", {
        journalType: "reflection",
        emotionLevel: 3, // Default to neutral for reflection
        emotionType: "reflective",
        content,
        bodyMapping: {},
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      toast({
        title: "Reflection Saved",
        description: "Your reflection entry has been saved successfully.",
      });
      setReflectionAnswers(["", "", ""]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save reflection entry",
        variant: "destructive",
      });
    },
  });

  const updateReflectionAnswer = (index: number, value: string) => {
    const newAnswers = [...reflectionAnswers];
    newAnswers[index] = value;
    setReflectionAnswers(newAnswers);
  };

  const reflectionQuestions = [
    "What was the most meaningful part of your day?",
    "What challenge did you face and how did you handle it?",
    "What would you like to do differently tomorrow?",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-2">
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
            <h2 className="text-xl font-serif font-semibold text-stone-600">Daily Reflection</h2>
            <p className="text-stone-400 text-sm">Process your thoughts and experiences</p>
          </div>
        </div>
      </div>

      {/* Reflection Questions */}
      <Card className="bg-gradient-to-br from-lavender-100 to-lavender-200 rounded-organic stone-shadow border-0">
        <CardContent className="p-6">
          <div className="botanical-accent relative"></div>
          <h3 className="font-serif font-semibold text-stone-600 text-lg mb-4">Today's Reflection</h3>
          <p className="text-stone-500 text-sm mb-6">Take time to process and learn from your experiences</p>
          
          <div className="space-y-6">
            {reflectionQuestions.map((question, index) => (
              <div key={index} className="bg-white/80 p-4 rounded-stone">
                <label className="block text-sm font-medium text-stone-600 mb-3">
                  {question}
                </label>
                <Textarea
                  value={reflectionAnswers[index]}
                  onChange={(e) => updateReflectionAnswer(index, e.target.value)}
                  className="w-full h-24 p-3 border border-stone-200 rounded-stone focus:outline-none focus:ring-2 focus:ring-lavender-300 focus:border-transparent resize-none text-sm"
                  placeholder="Take your time to reflect..."
                  data-testid={`reflection-answer-${index}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mindful Moment */}
      <Card className="bg-white rounded-organic stone-shadow border border-stone-100">
        <CardContent className="p-6">
          <div className="bg-lavender-50 p-4 rounded-stone text-center">
            <BookOpen className="w-8 h-8 text-lavender-500 mx-auto mb-2" />
            <p className="text-stone-600 text-sm font-medium">
              "We do not learn from experience... we learn from reflecting on experience."
            </p>
            <p className="text-stone-400 text-xs mt-1">- John Dewey</p>
          </div>
        </CardContent>
      </Card>

      {/* Save Entry Button */}
      <Button
        onClick={() => createEntryMutation.mutate()}
        disabled={createEntryMutation.isPending || reflectionAnswers.every(answer => !answer.trim())}
        className="w-full bg-gradient-to-r from-lavender-300 to-lavender-400 text-white py-4 px-6 rounded-organic stone-shadow font-medium hover:from-lavender-400 hover:to-lavender-500 transition-all"
        data-testid="save-reflection-entry-button"
      >
        <BookOpen className="mr-2 h-4 w-4" />
        {createEntryMutation.isPending ? "Saving..." : "Save Reflection Entry"}
      </Button>
    </div>
  );
}