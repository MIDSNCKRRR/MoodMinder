import { useState, useEffect } from "react";
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Step3JournalProps {
  journalContent: string;
  onJournalChange: (content: string) => void;
  onBack: () => void;
  selectedEmotion: number;
  selectedBodyFeelings: Record<string, string>;
  onComplete: () => void;
}

export default function Step3Journal({
  journalContent,
  onJournalChange,
  onBack,
  selectedEmotion,
  selectedBodyFeelings,
  onComplete,
}: Step3JournalProps) {
  const { toast } = useToast();

  // Auto-save journal content
  useEffect(() => {
    localStorage.setItem("bodyJournal_content", journalContent);
  }, [journalContent]);

  const emotionCategories = [
    { id: 1, emoji: "😭", label: "Overwhelmed", type: "overwhelmed" },
    { id: 2, emoji: "😰", label: "Anxious", type: "anxious" },
    { id: 3, emoji: "😔", label: "Sad", type: "sad" },
    { id: 4, emoji: "😐", label: "Neutral", type: "neutral" },
    { id: 5, emoji: "😊", label: "Content", type: "content" },
    { id: 6, emoji: "😄", label: "Happy", type: "happy" },
    { id: 7, emoji: "🤗", label: "Loving", type: "loving" },
    { id: 8, emoji: "😌", label: "Peaceful", type: "peaceful" },
    { id: 9, emoji: "💪", label: "Energized", type: "energized" },
    // { id: 10, emoji: "🔥", label: "Excited", type: "excited" },
    // { id: 11, emoji: "😴", label: "Tired", type: "tired" },
    // { id: 12, emoji: "🧘", label: "Mindful", type: "mindful" },
  ];

  const getEmotionType = (level: number): string => {
    const category = emotionCategories.find((cat) => cat.id === level);
    return category?.type || "neutral";
  };

  // Map feeling ID to emoji for body feelings display
  const getEmotionEmoji = (feelingId: string): string => {
    const feelingEmojis: Record<string, string> = {
      tense: "😬",
      relaxed: "😌", 
      warm: "🔥",
      cool: "❄️",
      fluttery: "🦋",
      racing: "💓",
      calm: "🌊",
      buzzing: "⚡"
    };
    return feelingEmojis[feelingId] || "❓";
  };

  const createEntryMutation = useMutation({
    mutationFn: async () => {
      // Get emotion data using the same mapping as body-journal-flow
      const getEmotionData = (emotionId: number) => {
        const emotionCategories = [
          { id: 1, label: "Joy", type: "joy", level: 5 },
          { id: 2, label: "Trust", type: "trust", level: 4 },
          { id: 3, label: "Fear", type: "fear", level: 2 },
          { id: 4, label: "Surprise", type: "surprise", level: 3 },
          { id: 5, label: "Sadness", type: "sadness", level: 2 },
          { id: 6, label: "Disgust", type: "disgust", level: 1 },
          { id: 7, label: "Anger", type: "anger", level: 1 },
          { id: 8, label: "Anticipation", type: "anticipation", level: 4 },
        ];
        const emotion = emotionCategories.find(e => e.id === emotionId);
        return emotion || { type: "neutral", level: 3 };
      };

      const emotionData = getEmotionData(selectedEmotion);
      
      await apiRequest("POST", "/api/journal-entries", {
        userId: "temp-user",
        journalType: "body",
        emotionLevel: emotionData.level,
        emotionType: emotionData.type,
        content: journalContent,
        bodyMapping: {
          feelings: selectedBodyFeelings,
          emotionCategory: selectedEmotion,
          intensity: 50, // Default intensity since we don't have it in this flow
          timestamp: new Date().toISOString()
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      toast({
        title: "Body Journal Saved",
        description: "Your body journal entry has been saved successfully.",
      });
      // Clear temporary saved data
      localStorage.removeItem("bodyJournal_emotion");
      localStorage.removeItem("bodyJournal_bodyFeelings");
      localStorage.removeItem("bodyJournal_content");
      onComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save body journal entry",
        variant: "destructive",
      });
    },
  });

  const selectedEmotionData = emotionCategories.find(
    (cat) => cat.id === selectedEmotion,
  );

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="rounded-organic stone-shadow border-0 bg-white/90">
        <CardContent className="p-4">
          <h4 className="font-medium text-stone-600 text-sm mb-3">
            Your selections:
          </h4>
          <div className="space-y-3 text-sm text-stone-500">
            <div className="flex items-center gap-2">
              <span className="font-medium">Primary emotion:</span>
              <div className="flex items-center gap-1">
                <span className="text-lg">{selectedEmotionData?.emoji}</span>
                <span>{selectedEmotionData?.label}</span>
              </div>
            </div>
            {Object.keys(selectedBodyFeelings).length > 0 && (
              <div className="space-y-2">
                <div className="font-medium">
                  Body feelings ({Object.keys(selectedBodyFeelings).length}):
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {Object.entries(selectedBodyFeelings).map(([bodyPart, feeling]) => (
                    <div key={bodyPart} className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-full">
                      <span className="capitalize font-medium">{bodyPart.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span>•</span>
                      <span className="text-stone-600">{getEmotionEmoji(feeling)} {feeling}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Journal Entry */}
      <Card
        className="rounded-organic stone-shadow border-0"
        style={{
          background:
            "linear-gradient(135deg, hsl(15, 55%, 93%) 0%, hsl(15, 50%, 78%) 100%)",
        }}
      >
        <CardContent className="p-6">
          <h3 className="font-serif font-semibold text-stone-600 text-xl mb-2 text-center">
            Share your thoughts...
          </h3>
          <p className="text-stone-500 text-sm text-center mb-6">
            Write about your feelings and physical sensations
          </p>

          <Textarea
            value={journalContent}
            onChange={(e) => onJournalChange(e.target.value)}
            className="w-full h-40 p-4 border border-stone-200 rounded-stone focus:outline-none focus:ring-2 focus:ring-coral-300 focus:border-transparent resize-none bg-white/80"
            placeholder="What's on your mind today? How are you feeling? What happened that made you feel this way?"
            data-testid="body-journal-textarea"
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          className="px-6 py-3 rounded-stone font-medium"
          data-testid="back-to-body-mapping"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button
          onClick={() => createEntryMutation.mutate()}
          disabled={createEntryMutation.isPending || !journalContent.trim()}
          className="px-6 py-3 rounded-stone font-medium transition-all"
          style={{
            background:
              "linear-gradient(to right, hsl(15, 60%, 70%), hsl(15, 65%, 60%))",
            color: "white",
          }}
          data-testid="save-body-journal"
        >
          <Heart className="mr-2 h-4 w-4" />
          {createEntryMutation.isPending ? "Saving..." : "Save Entry"}
        </Button>
      </div>
    </div>
  );
}
