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
      {/* Header Card */}
      <Card 
        className="rounded-organic stone-shadow border-0"
        style={{
          background: "linear-gradient(135deg, hsl(261, 35%, 93%) 0%, hsl(261, 30%, 78%) 100%)",
        }}
      >
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-stone-900 font-serif">
              리프레이밍 결과
            </h2>
          </div>
          <p className="text-purple-700 text-sm">
            AI가 당신의 {emotion.name} 감정을 긍정적으로 재해석했습니다
          </p>
        </CardContent>
      </Card>

      {/* Original Answers Summary */}
      <Card 
        className="rounded-organic stone-shadow border-0"
        style={{
          background: "linear-gradient(135deg, hsl(261, 35%, 95%) 0%, hsl(261, 25%, 88%) 100%)",
        }}
      >
        <CardContent className="p-6">
          <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2 font-serif">
            <span className="w-3 h-3 bg-purple-400 rounded-full"></span>
            내가 작성한 답변 요약
          </h3>
          <div className="space-y-3">
            {answers.slice(0, 3).map((answer, index) => (
              <div key={index} className="text-sm text-stone-700 bg-white/70 p-4 rounded-stone border border-purple-200">
                "{answer.length > 100 ? answer.substring(0, 100) + '...' : answer}"
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reframed Sentences */}
      {isLoading ? (
        <Card 
          className="rounded-organic stone-shadow border-0"
          style={{
            background: "linear-gradient(135deg, hsl(261, 35%, 95%) 0%, hsl(261, 25%, 88%) 100%)",
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-3">
              <RefreshCw className="w-5 h-5 text-purple-600 animate-spin" />
              <span className="text-purple-700 font-medium">리프레이밍 생성 중...</span>
            </div>
            <div className="mt-4 space-y-3">
              <div className="h-12 bg-purple-100 rounded-stone animate-pulse"></div>
              <div className="h-12 bg-purple-100 rounded-stone animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card 
            className="rounded-organic stone-shadow border-0"
            style={{
              background: "linear-gradient(135deg, hsl(261, 35%, 95%) 0%, hsl(261, 25%, 88%) 100%)",
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-stone-900 flex items-center gap-2 font-serif">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  새로운 관점으로 바라보기
                </h3>
                <Button
                  onClick={onRegenerate}
                  variant="outline"
                  size="sm"
                  className="text-purple-600 border-purple-300 hover:bg-purple-50 rounded-stone"
                  data-testid="button-regenerate"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  다시 생성
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {reframedSentences.map((sentence, index) => (
              <Card 
                key={index} 
                className={`border-2 rounded-organic transition-all duration-300 cursor-pointer ${
                  selectedSentences[index] 
                    ? 'border-purple-400 shadow-lg scale-[1.02]' 
                    : 'border-purple-200 hover:border-purple-300 hover:shadow-sm'
                }`}
                style={{
                  background: selectedSentences[index] 
                    ? "linear-gradient(135deg, hsl(261, 45%, 95%) 0%, hsl(261, 40%, 90%) 100%)"
                    : "linear-gradient(135deg, hsl(261, 25%, 97%) 0%, hsl(261, 20%, 92%) 100%)"
                }}
                onClick={() => toggleSentenceSelection(index)}
                data-testid={`reframed-sentence-${index}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                      ${selectedSentences[index] 
                        ? 'border-purple-500 bg-purple-500 shadow-sm' 
                        : 'border-purple-300 bg-white'
                      }
                    `}>
                      {selectedSentences[index] && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-stone-800 leading-relaxed font-medium">
                        "{sentence}"
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {reframedSentences.length > 0 && (
              <div className="text-xs text-purple-600 text-center bg-white/60 p-3 rounded-stone border border-purple-200">
                저장하고 싶은 문장을 선택해주세요 (선택된 문장: {getSelectedSentences().length}개)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex items-center gap-2 rounded-stone border-purple-300 text-purple-700 hover:bg-purple-50"
          data-testid="button-back-to-questions"
        >
          <ArrowLeft className="w-4 h-4" />
          질문으로 돌아가기
        </Button>

        {!isLoading && reframedSentences.length > 0 && (
          <Button
            onClick={() => onSave(getSelectedSentences())}
            disabled={!canSave || getSelectedSentences().length === 0}
            className={`flex-1 h-12 text-sm font-medium rounded-stone transition-all shadow-md ${
              canSave && getSelectedSentences().length > 0
                ? 'text-white'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
            }`}
            style={canSave && getSelectedSentences().length > 0 ? {
              background: "linear-gradient(to right, hsl(261, 60%, 60%), hsl(261, 65%, 50%))"
            } : {}}
            data-testid="button-save-reframing"
          >
            <span className="truncate">
              저장하기 ({getSelectedSentences().length}개)
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}