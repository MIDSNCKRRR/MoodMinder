import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Heart, ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import EmotionFace from "@/components/emotion-face";
import BodyMap from "@/components/body-map";

interface EmotionJournalProps {
  onBack: () => void;
}

export default function EmotionJournal({ onBack }: EmotionJournalProps) {
  const { toast } = useToast();
  const [selectedEmotion, setSelectedEmotion] = useState<number>(4);
  const [journalContent, setJournalContent] = useState("");
  const [selectedBodyAreas, setSelectedBodyAreas] = useState<string[]>([]);

  // Create journal entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async () => {
      if (!journalContent.trim()) {
        throw new Error("Please write something before saving");
      }

      const response = await apiRequest("POST", "/api/journal-entries", {
        journalType: "emotion",
        emotionLevel: selectedEmotion,
        emotionType: getEmotionType(selectedEmotion),
        content: journalContent.trim(),
        bodyMapping: selectedBodyAreas.reduce((acc, area) => ({ ...acc, [area]: true }), {}),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      toast({
        title: "Entry Saved",
        description: "Your emotion journal entry has been saved successfully.",
      });
      setJournalContent("");
      setSelectedBodyAreas([]);
      setSelectedEmotion(4);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save journal entry",
        variant: "destructive",
      });
    },
  });

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
    { id: 10, emoji: "🔥", label: "Excited", type: "excited" },
    { id: 11, emoji: "😴", label: "Tired", type: "tired" },
    { id: 12, emoji: "🧘", label: "Mindful", type: "mindful" },
  ];

  const getEmotionType = (level: number): string => {
    const category = emotionCategories.find(cat => cat.id === level);
    return category?.type || "neutral";
  };

  const getEmotionLabel = (level: number): string => {
    const category = emotionCategories.find(cat => cat.id === level);
    return category?.label || "Neutral";
  };

  const handleBodyAreaSelect = (area: string) => {
    setSelectedBodyAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

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
          <h2 className="text-xl font-serif font-semibold text-stone-600">Body Journal</h2>
          <p className="text-stone-400 text-sm">Track your physical and emotional state</p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="p-2"
          data-testid="info-button"
        >
          <Info className="w-4 h-4" />
        </Button>
      </div>

      {/* Emotion Tracking Section */}
      <Card 
        className="rounded-organic stone-shadow border-0"
        style={{ background: 'linear-gradient(135deg, hsl(15, 55%, 93%) 0%, hsl(15, 50%, 78%) 100%)' }}
      >
        <CardContent className="p-6">
          <h3 className="font-serif font-semibold text-stone-600 text-lg mb-4">How are you feeling right now?</h3>
          
          {/* Emotion Categories Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {emotionCategories.map((category) => (
              <div 
                key={category.id} 
                className={`text-center p-3 rounded-stone cursor-pointer transition-all duration-300 ${
                  selectedEmotion === category.id 
                    ? "bg-white/80 scale-105 shadow-md" 
                    : "bg-white/40 hover:bg-white/60"
                }`}
                onClick={() => setSelectedEmotion(category.id)}
                data-testid={`emotion-${category.id}`}
              >
                <div className="text-2xl mb-1">{category.emoji}</div>
                <span className="text-xs text-stone-600 font-medium">
                  {category.label}
                </span>
              </div>
            ))}
          </div>

          {/* Body Mapping Feature */}
          <div className="bg-white/80 p-4 rounded-stone relative">
            <h4 className="font-medium text-stone-600 mb-3">Where do you feel it in your body?</h4>
            <BodyMap 
              selectedAreas={selectedBodyAreas}
              onAreaSelect={handleBodyAreaSelect}
            />
            <p className="text-xs text-stone-400 text-center mt-2">
              Tap areas where you feel emotional sensations
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Journal Entry Text Area */}
      <Card className="bg-white rounded-organic stone-shadow border border-stone-100">
        <CardContent className="p-6">
          <label className="block font-medium text-stone-600 mb-3">Share your thoughts...</label>
          <Textarea
            value={journalContent}
            onChange={(e) => setJournalContent(e.target.value)}
            className="w-full h-32 p-4 border border-stone-200 rounded-stone focus:outline-none focus:ring-2 focus:ring-coral-300 focus:border-transparent resize-none"
            placeholder="What's on your mind today? How are you feeling? What happened that made you feel this way?"
            data-testid="emotion-journal-textarea"
          />
        </CardContent>
      </Card>

      {/* Save Entry Button */}
      <Button
        onClick={() => createEntryMutation.mutate()}
        disabled={createEntryMutation.isPending || !journalContent.trim()}
        className="w-full bg-gradient-to-r from-coral-300 to-coral-400 text-white py-4 px-6 rounded-organic stone-shadow font-medium hover:from-coral-400 hover:to-coral-500 transition-all"
        data-testid="save-emotion-entry-button"
      >
        <Heart className="mr-2 h-4 w-4" />
        {createEntryMutation.isPending ? "Saving..." : "Save Emotion Entry"}
      </Button>
    </div>
  );
}