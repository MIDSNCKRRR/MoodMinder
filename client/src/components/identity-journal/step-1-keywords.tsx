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
  const [selectedCategory, setSelectedCategory] = useState<'adjectives' | 'characters'>('adjectives');

  const adjectiveWords = [
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

  const characterWords = [
    "큐레이터", "멍멍이", "외계인", "수녀", "탐험가", "고양이", "브로콜리", "알바생", 
    "DJ", "인플루언서", "여주인공", "마법사", "유튜버", "아이돌", "철학자", "가수 지망생", 
    "침대 귀신", "박제된 새", "청소요정", "그림자", "엉뚱한 학자", "감정 브로커", "식물 인간", 
    "유랑자", "낙서쟁이", "우체국 직원", "백업 요정", "일기장", "스포일러", "동굴 속 주인", 
    "낯선 손님", "손 편지", "침대 위 검객", "찜질방 마스터", "무소속 악단장", "구석 탐험가", 
    "골목대장", "파도 감별사", "이불 위 천사", "멀미하는 도전자", "표정 없는 배우", "정지된 댄서", 
    "실눈 고양이", "전직 마법소녀", "감정 셰프", "시간 수집가", "공기요정", "흐린 날 편집자", 
    "꿈해설사", "방구석 작가", "물속 거북이", "조용한 펑크가수", "일일 배역", "감정 사진사", 
    "유리 구슬", "메모광", "눈치쟁이", "흘러내리는 얼음", "감각 디렉터", "대기실의 연기자", 
    "머리카락 사제", "유통기한 지난 빛", "유선형 우울러", "미니멀 사무장", "내면 라디오", 
    "기억 전송자", "싸가지", "경찰", "악당", "천사", "치어리더", "카메라맨", "아나운서", 
    "비제이", "디자이너", "기획자", "우체부", "마시자사", "트레이너"
  ];

  const candidateWords = selectedCategory === 'adjectives' ? adjectiveWords : characterWords;

  // Auto-save keywords
  useEffect(() => {
    localStorage.setItem('identityJournal_keywords', JSON.stringify(selectedKeywords));
  }, [selectedKeywords]);

  const handleKeywordToggle = (keyword: string) => {
    const isCurrentCategoryWord = candidateWords.includes(keyword);
    
    if (selectedKeywords.includes(keyword)) {
      // Remove if already selected
      onKeywordsChange(selectedKeywords.filter(k => k !== keyword));
    } else {
      // Remove any existing word from the same category before adding new one
      const wordsFromOtherCategory = selectedKeywords.filter(k => {
        if (selectedCategory === 'adjectives') {
          return characterWords.includes(k);
        } else {
          return adjectiveWords.includes(k);
        }
      });
      
      // Keep words from other category and add the new word
      onKeywordsChange([...wordsFromOtherCategory, keyword]);
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
            Select one word from each category that resonates with your current sense of self
          </p>

          {/* Category Selector */}
          <div className="mb-6">
            <div className="flex rounded-stone bg-white/60 p-1 w-fit mx-auto">
              <button
                onClick={() => setSelectedCategory('adjectives')}
                className={`px-4 py-2 rounded-stone text-sm font-medium transition-all duration-300 ${
                  selectedCategory === 'adjectives'
                    ? 'bg-sage-700 text-sage-50 shadow-lg'
                    : 'bg-transparent text-stone-700 hover:bg-white/30 hover:text-sage-700'
                }`}
                data-testid="category-adjectives"
              >
                Adjectives
              </button>
              <button
                onClick={() => setSelectedCategory('characters')}
                className={`px-4 py-2 rounded-stone text-sm font-medium transition-all duration-300 ${
                  selectedCategory === 'characters'
                    ? 'bg-sage-700 text-sage-50 shadow-lg'
                    : 'bg-transparent text-stone-700 hover:bg-white/30 hover:text-sage-700'
                }`}
                data-testid="category-characters"
              >
                Characters
              </button>
            </div>
          </div>

          {/* Selected Keywords */}
          {selectedKeywords.length > 0 && (
            <div className="mb-6 p-4 bg-white/60 rounded-stone">
              <h4 className="text-sm font-medium text-stone-600 mb-3">
                Selected ({selectedKeywords.length}/2)
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedKeywords.map((keyword) => {
                  const isFromAdjectives = adjectiveWords.includes(keyword);
                  const categoryLabel = isFromAdjectives ? 'Adjective' : 'Character';
                  const categoryColor = isFromAdjectives ? 'bg-blue-200 text-blue-700' : 'bg-purple-200 text-purple-700';
                  
                  return (
                    <div
                      key={keyword}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-sage-200 text-sage-700 rounded-full text-sm font-medium"
                      data-testid={`selected-keyword-${keyword.toLowerCase()}`}
                    >
                      <span className={`px-2 py-0.5 rounded-full text-xs ${categoryColor}`}>
                        {categoryLabel}
                      </span>
                      <span>{keyword}</span>
                      <button
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="ml-1 text-sage-500 hover:text-sage-700 transition-colors"
                        data-testid={`remove-keyword-${keyword.toLowerCase()}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
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