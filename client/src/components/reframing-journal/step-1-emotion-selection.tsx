import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-stone-900">
          오늘 어떤 감정을 탐구해볼까요?
        </h2>
        <p className="text-stone-600 text-sm">
          지금 가장 강하게 느끼는 감정을 선택해주세요
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {emotions.map((emotion) => {
          const isSelected = selectedEmotion?.id === emotion.id;
          
          return (
            <button
              key={emotion.id}
              onClick={() => onEmotionSelect(emotion)}
              className={`
                p-4 rounded-stone text-center transition-all duration-300 border-2
                ${isSelected 
                  ? 'bg-sage-100 border-sage-400 text-sage-800 shadow-md' 
                  : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300 hover:shadow-sm'
                }
              `}
              data-testid={`emotion-${emotion.id}`}
            >
              <div className="space-y-1">
                <div className="text-lg font-medium">
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

      {selectedEmotion && (
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-sage-50 rounded-stone p-4 border border-sage-200">
            <div className="text-center space-y-2">
              <div className="text-sage-800 font-medium">
                선택된 감정: {selectedEmotion.name}
              </div>
              <div className="text-sage-600 text-sm">
                이 감정에 대해 깊이 탐구해보겠습니다
              </div>
            </div>
          </div>
          
          {onNext && (
            <Button
              onClick={onNext}
              disabled={!canProceed}
              className="bg-sage-600 hover:bg-sage-700 text-white flex items-center gap-2 px-6 py-3"
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