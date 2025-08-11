import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface KeywordScore {
  keyword: string;
  score: number;
}

interface Step4KeywordsProps {
  selectedKeywords: KeywordScore[];
  onKeywordsChange: (keywords: KeywordScore[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step4Keywords({
  selectedKeywords,
  onKeywordsChange,
  onNext,
  onBack,
}: Step4KeywordsProps) {
  const [selectedCategory, setSelectedCategory] = useState<"emotions" | "physical">("emotions");

  // Body-related keywords
  const emotionKeywords = [
    "Calm", "Anxious", "Energized", "Tired", "Happy", "Sad",
    "Focused", "Scattered", "Peaceful", "Restless", "Content", "Frustrated",
    "Motivated", "Overwhelmed", "Relaxed", "Tense", "Confident", "Insecure"
  ];

  const physicalKeywords = [
    "Strong", "Weak", "Flexible", "Stiff", "Light", "Heavy",
    "Balanced", "Unsteady", "Warm", "Cold", "Smooth", "Rough",
    "Open", "Closed", "Flowing", "Blocked", "Grounded", "Floating"
  ];

  const currentKeywords = selectedCategory === "emotions" ? emotionKeywords : physicalKeywords;

  // Auto-save keywords
  useEffect(() => {
    localStorage.setItem("bodyJournal_keywords", JSON.stringify(selectedKeywords));
  }, [selectedKeywords]);

  const getKeywordScore = (keyword: string): number => {
    const found = selectedKeywords.find(k => k.keyword === keyword);
    return found ? found.score : 3; // Default to middle score
  };

  const handleScoreChange = (keyword: string, score: number) => {
    const newKeywords = [...selectedKeywords];
    const existingIndex = newKeywords.findIndex(k => k.keyword === keyword);
    
    if (existingIndex >= 0) {
      newKeywords[existingIndex] = { keyword, score };
    } else {
      newKeywords.push({ keyword, score });
    }
    
    onKeywordsChange(newKeywords);
  };

  const removeKeyword = (keyword: string) => {
    const newKeywords = selectedKeywords.filter(k => k.keyword !== keyword);
    onKeywordsChange(newKeywords);
  };

  const isKeywordSelected = (keyword: string): boolean => {
    return selectedKeywords.some(k => k.keyword === keyword);
  };

  const getScoreLabel = (score: number): string => {
    switch (score) {
      case 1: return "전혀 일치하지 않음";
      case 2: return "조금 일치함";
      case 3: return "보통";
      case 4: return "많이 일치함";
      case 5: return "완전히 일치함";
      default: return "보통";
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Content */}
      <Card
        className="rounded-organic stone-shadow border-0"
        style={{
          background: "linear-gradient(135deg, hsl(15, 55%, 93%) 0%, hsl(15, 50%, 78%) 100%)",
        }}
      >
        <CardContent className="p-6">
          <h3 className="font-serif font-semibold text-stone-600 text-xl mb-2 text-center">
            오늘의 나와 일치하는 키워드
          </h3>
          <p className="text-stone-500 text-sm text-center mb-6">
            키워드를 선택하고 오늘의 나와 얼마나 일치하는지 점수를 매겨보세요
          </p>

          {/* Category Tabs */}
          <div className="flex rounded-stone bg-white/60 p-1 mb-6">
            <button
              onClick={() => setSelectedCategory("emotions")}
              className={`flex-1 py-2 px-4 rounded-stone text-sm font-medium transition-all ${
                selectedCategory === "emotions"
                  ? "bg-white shadow-sm text-stone-700"
                  : "text-stone-500 hover:text-stone-600"
              }`}
              data-testid="tab-emotions"
            >
              감정 키워드
            </button>
            <button
              onClick={() => setSelectedCategory("physical")}
              className={`flex-1 py-2 px-4 rounded-stone text-sm font-medium transition-all ${
                selectedCategory === "physical"
                  ? "bg-white shadow-sm text-stone-700"
                  : "text-stone-500 hover:text-stone-600"
              }`}
              data-testid="tab-physical"
            >
              신체 키워드
            </button>
          </div>

          {/* Keywords Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {currentKeywords.map((keyword) => (
              <button
                key={keyword}
                onClick={() => {
                  if (isKeywordSelected(keyword)) {
                    removeKeyword(keyword);
                  } else {
                    handleScoreChange(keyword, 3);
                  }
                }}
                className={`p-3 rounded-stone text-sm font-medium transition-all duration-300 ${
                  isKeywordSelected(keyword)
                    ? "bg-white/90 border-2 border-orange-300 text-orange-800 shadow-sm"
                    : "bg-white/60 border-2 border-transparent text-stone-600 hover:bg-white/80 hover:shadow-sm"
                }`}
                data-testid={`keyword-${keyword.toLowerCase()}`}
              >
                {keyword}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Keywords with Scores */}
      {selectedKeywords.length > 0 && (
        <Card
          className="rounded-organic stone-shadow border-0"
          style={{
            background: "linear-gradient(135deg, hsl(15, 45%, 95%) 0%, hsl(15, 40%, 88%) 100%)",
          }}
        >
          <CardContent className="p-6">
            <h4 className="font-semibold text-stone-700 text-lg mb-4 text-center">
              선택된 키워드 점수 조정 ({selectedKeywords.length}개)
            </h4>
            
            <div className="space-y-4">
              {selectedKeywords.map(({ keyword, score }) => (
                <div key={keyword} className="bg-white/70 p-4 rounded-stone">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-stone-700">{keyword}</span>
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="text-stone-400 hover:text-stone-600 text-sm"
                      data-testid={`remove-${keyword.toLowerCase()}`}
                    >
                      제거
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <Slider
                      value={[score]}
                      onValueChange={(value) => handleScoreChange(keyword, value[0])}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                      data-testid={`slider-${keyword.toLowerCase()}`}
                    />
                    
                    <div className="flex justify-between text-xs text-stone-500">
                      <span>1점</span>
                      <span className="font-medium text-orange-600">
                        {score}점 - {getScoreLabel(score)}
                      </span>
                      <span>5점</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex items-center gap-2 rounded-stone border-orange-300 text-orange-700 hover:bg-orange-50"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
          이전
        </Button>

        <Button
          onClick={onNext}
          disabled={selectedKeywords.length === 0}
          className={`flex-1 flex items-center justify-center gap-2 rounded-stone transition-all ${
            selectedKeywords.length > 0
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm"
              : "bg-stone-200 text-stone-400 cursor-not-allowed"
          }`}
          data-testid="button-complete"
        >
          <span>저널 완료</span>
          <Heart className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}