import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Step1EmotionProps {
  selectedEmotion: number;
  onEmotionChange: (emotion: number) => void;
  onNext: () => void;
}

export default function Step1Emotion({ selectedEmotion, onEmotionChange, onNext }: Step1EmotionProps) {
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

  // Auto-save emotion selection
  useEffect(() => {
    localStorage.setItem('bodyJournal_emotion', selectedEmotion.toString());
  }, [selectedEmotion]);

  return (
    <div className="space-y-6">
      {/* Step Content */}
      <Card 
        className="rounded-organic stone-shadow border-0"
        style={{ background: 'linear-gradient(135deg, hsl(15, 55%, 93%) 0%, hsl(15, 50%, 78%) 100%)' }}
      >
        <CardContent className="p-6">
          <h3 className="font-serif font-semibold text-stone-600 text-xl mb-2 text-center">
            How are you feeling right now?
          </h3>
          <p className="text-stone-500 text-sm text-center mb-6">
            Take a moment to check in with yourself
          </p>
          
          {/* Emotion Categories Grid */}
          <div className="grid grid-cols-3 gap-3">
            {emotionCategories.map((category) => (
              <div 
                key={category.id} 
                className={`text-center p-4 rounded-stone cursor-pointer transition-all duration-300 ${
                  selectedEmotion === category.id 
                    ? "bg-white/90 scale-105 shadow-lg ring-2 ring-coral-300" 
                    : "bg-white/50 hover:bg-white/70"
                }`}
                onClick={() => onEmotionChange(category.id)}
                data-testid={`emotion-${category.id}`}
              >
                <div className="text-3xl mb-2">{category.emoji}</div>
                <span className="text-xs text-stone-600 font-medium">
                  {category.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-end">
        <Button
          onClick={onNext}
          className="px-6 py-3 rounded-stone font-medium transition-all"
          style={{ 
            background: "linear-gradient(to right, hsl(15, 60%, 70%), hsl(15, 65%, 60%))",
            color: "white"
          }}
          data-testid="next-to-body-mapping"
        >
          Next Step
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}