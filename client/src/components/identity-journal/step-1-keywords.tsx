import { useState, useEffect } from "react";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Step1KeywordsProps {
  selectedKeywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
  onNext: () => void;
}

export default function Step1Keywords({ selectedKeywords, onKeywordsChange, onNext }: Step1KeywordsProps) {
  const candidateWords = [
    // Personal Qualities
    "Creative", "Analytical", "Empathetic", "Curious", "Resilient",
    "Adventurous", "Calm", "Energetic", "Patient", "Spontaneous",
    "Organized", "Flexible", "Optimistic", "Realistic", "Intuitive",
    
    // Values & Beliefs
    "Authentic", "Honest", "Loyal", "Independent", "Collaborative",
    "Compassionate", "Ambitious", "Humble", "Confident", "Mindful",
    "Progressive", "Traditional", "Spiritual", "Rational", "Idealistic",
    
    // Roles & Identities
    "Leader", "Supporter", "Teacher", "Learner", "Creator",
    "Protector", "Innovator", "Peacemaker", "Challenger", "Nurturer",
    "Explorer", "Builder", "Healer", "Storyteller", "Connector",
    
    // Growth & Change
    "Growing", "Transforming", "Discovering", "Healing", "Evolving",
    "Searching", "Becoming", "Questioning", "Accepting", "Releasing",
    "Embracing", "Expanding", "Deepening", "Awakening", "Integrating"
  ];

  // Auto-save keywords
  useEffect(() => {
    localStorage.setItem('identityJournal_keywords', JSON.stringify(selectedKeywords));
  }, [selectedKeywords]);

  const handleKeywordToggle = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      onKeywordsChange(selectedKeywords.filter(k => k !== keyword));
    } else {
      onKeywordsChange([...selectedKeywords, keyword]);
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    onKeywordsChange(selectedKeywords.filter(k => k !== keyword));
  };

  const isSelected = (keyword: string) => selectedKeywords.includes(keyword);
  const canProceed = selectedKeywords.length > 0;

  return (
    <div className="space-y-6">
      {/* Step Content */}
      <Card 
        className="rounded-organic stone-shadow border-0"
        style={{ background: 'linear-gradient(135deg, hsl(120, 12%, 91%) 0%, hsl(120, 10%, 83%) 100%)' }}
      >
        <CardContent className="p-6">
          <h3 className="font-serif font-semibold text-stone-600 text-xl mb-2 text-center">
            Choose words that reflect who you are today
          </h3>
          <p className="text-stone-500 text-sm text-center mb-6">
            Select keywords that resonate with your current sense of self
          </p>

          {/* Selected Keywords */}
          {selectedKeywords.length > 0 && (
            <div className="mb-6 p-4 bg-white/60 rounded-stone">
              <h4 className="text-sm font-medium text-stone-600 mb-3">
                Selected ({selectedKeywords.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedKeywords.map((keyword) => (
                  <div
                    key={keyword}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-sage-200 text-sage-700 rounded-full text-sm font-medium"
                    data-testid={`selected-keyword-${keyword.toLowerCase()}`}
                  >
                    <span>{keyword}</span>
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="ml-1 text-sage-500 hover:text-sage-700 transition-colors"
                      data-testid={`remove-keyword-${keyword.toLowerCase()}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords Grid */}
          <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
            {candidateWords.map((keyword) => (
              <div
                key={keyword}
                className={`
                  p-3 rounded-stone text-center cursor-pointer transition-all duration-300 text-sm font-medium
                  ${isSelected(keyword)
                    ? "bg-white/90 scale-105 shadow-lg ring-2 ring-sage-300 text-sage-700"
                    : "bg-white/50 hover:bg-white/70 text-stone-600"
                  }
                `}
                onClick={() => handleKeywordToggle(keyword)}
                data-testid={`keyword-${keyword.toLowerCase()}`}
              >
                <div className="flex items-center justify-center gap-2">
                  {isSelected(keyword) && (
                    <div className="w-2 h-2 bg-sage-500 rounded-full" />
                  )}
                  <span>{keyword}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="px-6 py-3 rounded-stone font-medium transition-all"
          style={{
            background: "linear-gradient(to right, hsl(120, 30%, 60%), hsl(120, 35%, 50%))",
            color: "white",
          }}
          data-testid="next-to-reflection"
        >
          Next Step
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}