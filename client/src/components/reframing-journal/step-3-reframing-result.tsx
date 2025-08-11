import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Sparkles, RefreshCw, Check } from 'lucide-react';

interface Emotion {
  id: string;
  name: string;
  english: string;
}

interface Step3ReframingResultProps {
  emotion: Emotion;
  answers: string[];
  reframedSentences: string[];
  isLoading: boolean;
  onBack: () => void;
  onRegenerate: () => void;
  onSave: (selectedSentences: string[]) => void;
  canSave: boolean;
}

export function Step3ReframingResult({
  emotion,
  answers,
  reframedSentences,
  isLoading,
  onBack,
  onRegenerate,
  onSave,
  canSave
}: Step3ReframingResultProps) {
  const [selectedSentences, setSelectedSentences] = useState<boolean[]>([true, true]);

  const toggleSentenceSelection = (index: number) => {
    const newSelection = [...selectedSentences];
    newSelection[index] = !newSelection[index];
    setSelectedSentences(newSelection);
  };

  const getSelectedSentences = () => {
    return reframedSentences.filter((_, index) => selectedSentences[index]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-6 h-6 text-sage-600" />
          <h2 className="text-xl font-semibold text-stone-900">
            리프레이밍 결과
          </h2>
        </div>
        <p className="text-stone-600 text-sm">
          AI가 당신의 {emotion.name} 감정을 긍정적으로 재해석했습니다
        </p>
      </div>

      {/* Original Answers Summary */}
      <Card className="bg-stone-50 border-stone-200">
        <CardContent className="p-4">
          <h3 className="font-medium text-stone-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-stone-400 rounded-full"></span>
            내가 작성한 답변 요약
          </h3>
          <div className="space-y-2">
            {answers.slice(0, 3).map((answer, index) => (
              <div key={index} className="text-sm text-stone-700 bg-white p-3 rounded-lg border border-stone-200">
                "{answer.length > 100 ? answer.substring(0, 100) + '...' : answer}"
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reframed Sentences */}
      {isLoading ? (
        <Card className="border-sage-200 bg-sage-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-3">
              <RefreshCw className="w-5 h-5 text-sage-600 animate-spin" />
              <span className="text-sage-700 font-medium">리프레이밍 생성 중...</span>
            </div>
            <div className="mt-4 space-y-3">
              <div className="h-12 bg-sage-100 rounded-lg animate-pulse"></div>
              <div className="h-12 bg-sage-100 rounded-lg animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sage-600" />
              새로운 관점으로 바라보기
            </h3>
            <Button
              onClick={onRegenerate}
              variant="outline"
              size="sm"
              className="text-sage-600 border-sage-300 hover:bg-sage-50"
              data-testid="button-regenerate"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 생성
            </Button>
          </div>

          {reframedSentences.map((sentence, index) => (
            <Card 
              key={index} 
              className={`border-2 transition-all duration-300 cursor-pointer ${
                selectedSentences[index] 
                  ? 'border-sage-400 bg-sage-50 shadow-md' 
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
              onClick={() => toggleSentenceSelection(index)}
              data-testid={`reframed-sentence-${index}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                    ${selectedSentences[index] 
                      ? 'border-sage-500 bg-sage-500' 
                      : 'border-stone-300 bg-white'
                    }
                  `}>
                    {selectedSentences[index] && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-stone-800 leading-relaxed">
                      "{sentence}"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {reframedSentences.length > 0 && (
            <div className="text-xs text-stone-500 text-center">
              저장하고 싶은 문장을 선택해주세요 (선택된 문장: {getSelectedSentences().length}개)
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex items-center gap-2"
          data-testid="button-back-to-questions"
        >
          <ArrowLeft className="w-4 h-4" />
          질문으로 돌아가기
        </Button>

        {!isLoading && reframedSentences.length > 0 && (
          <Button
            onClick={() => onSave(getSelectedSentences())}
            disabled={!canSave || getSelectedSentences().length === 0}
            className="flex-1 bg-sage-600 hover:bg-sage-700 text-white h-12 text-base font-medium shadow-md"
            data-testid="button-save-reframing"
          >
            선택한 문장 저장하기 ({getSelectedSentences().length}개)
          </Button>
        )}
      </div>
    </div>
  );
}