import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface Step1EmotionProps {
  selectedEmotion: number;
  emotionIntensity: number;
  onEmotionChange: (emotion: number) => void;
  onIntensityChange: (intensity: number) => void;
  onNext: () => void;
}

export default function Step1Emotion({ selectedEmotion, emotionIntensity, onEmotionChange, onIntensityChange, onNext }: Step1EmotionProps) {
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

  // Auto-save emotion selection and intensity
  useEffect(() => {
    localStorage.setItem('bodyJournal_emotion', selectedEmotion.toString());
    localStorage.setItem('bodyJournal_intensity', emotionIntensity.toString());
  }, [selectedEmotion, emotionIntensity]);

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
          <div className="grid grid-cols-3 gap-3 mb-8">
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

          {/* Intensity Slider */}
          <div className="bg-white/60 p-6 rounded-stone border border-stone-200">
            <div className="text-center mb-4">
              <h4 className="font-medium text-stone-600 mb-2">
                How strong is this feeling?
              </h4>
              <div className="text-2xl font-bold" style={{ color: "hsl(15, 65%, 60%)" }}>
                {emotionIntensity}%
              </div>
            </div>
            
            <div className="space-y-4">
              <Slider
                value={[emotionIntensity]}
                onValueChange={([value]) => onIntensityChange(value)}
                max={100}
                min={0}
                step={5}
                className="w-full"
                data-testid="emotion-intensity-slider"
              />
              
              <div className="flex justify-between text-xs text-stone-500">
                <span>Very Mild (0%)</span>
                <span>Moderate (50%)</span>
                <span>Very Strong (100%)</span>
              </div>
            </div>
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