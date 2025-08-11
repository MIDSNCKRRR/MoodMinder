import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Emotion {
  id: string;
  name: string;
  english: string;
}

interface Step1EmotionSelectionProps {
  emotions: Emotion[];
  selectedEmotion: Emotion | null;
  onEmotionSelect: (emotion: Emotion) => void;
  onNext?: () => void;
  canProceed?: boolean;
}

export function Step1EmotionSelection({ 
  emotions, 
  selectedEmotion, 
  onEmotionSelect,
  onNext,
  canProceed = false
}: Step1EmotionSelectionProps) {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card 
        className="rounded-organic stone-shadow border-0"
        style={{
          background: "linear-gradient(135deg, hsl(261, 35%, 93%) 0%, hsl(261, 30%, 78%) 100%)",
        }}
      >
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-semibold text-stone-900 mb-3 font-serif">
            오늘 어떤 감정을 탐구해볼까요?
          </h2>
          <p className="text-purple-700 text-sm">
            지금 가장 강하게 느끼는 감정을 선택해주세요
          </p>
        </CardContent>
      </Card>

      {/* Emotion Selection Grid */}
      <Card 
        className="rounded-organic stone-shadow border-0"
        style={{
          background: "linear-gradient(135deg, hsl(261, 35%, 95%) 0%, hsl(261, 25%, 88%) 100%)",
        }}
      >
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {emotions.map((emotion) => {
              const isSelected = selectedEmotion?.id === emotion.id;
              
              return (
                <button
                  key={emotion.id}
                  onClick={() => onEmotionSelect(emotion)}
                  className={`
                    p-4 rounded-stone text-center transition-all duration-300 border-2
                    ${isSelected 
                      ? 'bg-white/90 border-purple-400 text-purple-800 shadow-lg scale-105' 
                      : 'bg-white/60 border-purple-200 text-stone-700 hover:border-purple-300 hover:bg-white/80 hover:shadow-sm'
                    }
                  `}
                  data-testid={`emotion-${emotion.id}`}
                >
                  <div className="space-y-1">
                    <div className="text-lg font-semibold">
                      {emotion.name}
                    </div>
                    <div className="text-xs text-stone-500">
                      {emotion.english}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedEmotion && (
        <div className="flex items-center gap-3">
          <Card className="flex-1 rounded-organic border-0" style={{
            background: "linear-gradient(135deg, hsl(261, 40%, 95%) 0%, hsl(261, 35%, 90%) 100%)",
          }}>
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <div className="text-purple-800 font-semibold">
                  선택된 감정: {selectedEmotion.name}
                </div>
                <div className="text-purple-600 text-sm">
                  이 감정에 대해 깊이 탐구해보겠습니다
                </div>
              </div>
            </CardContent>
          </Card>
          
          {onNext && (
            <Button
              onClick={onNext}
              disabled={!canProceed}
              className="flex items-center gap-2 px-6 py-3 rounded-stone text-white font-medium transition-all shadow-sm"
              style={{
                background: "linear-gradient(to right, hsl(261, 60%, 60%), hsl(261, 65%, 50%))"
              }}
              data-testid="button-next-inline"
            >
              <span>다음</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}