import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Emotion {
  id: string;
  name: string;
  english: string;
}

interface Step2QuestionsProps {
  emotion: Emotion;
  questions: string[];
  answers: string[];
  onAnswersChange: (answers: string[]) => void;
  onNext?: () => void;
  canProceed?: boolean;
}

const questionDescriptions = [
  '(예: 친구가 원하는 일을 시작하는 걸 보며 마음이 불편했어.)',
  '• 무엇이 나를 불편하게 했을까?\n• 그 감정 아래 숨겨진 나의 바람이나 결핍은 무엇일까?',
  '• 나는 어떤 선택을 할 수 있을까?\n• 그 욕망을 실현하기 위한 작은 첫걸음은?',
  '새로운 관점으로 상황을 다시 표현해보세요'
];

export function Step2Questions({ 
  emotion, 
  questions, 
  answers, 
  onAnswersChange,
  onNext,
  canProceed = false
}: Step2QuestionsProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    onAnswersChange(newAnswers);
  };

  const canGoNext = () => {
    return answers[currentQuestion]?.trim().length > 0;
  };

  const canGoPrevious = () => {
    return currentQuestion > 0;
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1 && canGoNext()) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious()) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-stone-900">
          {emotion.name} 탐구하기
        </h2>
        <div className="bg-sage-50 rounded-stone p-3 border border-sage-200">
          <div className="text-sage-800 text-sm font-medium">
            질문 {currentQuestion + 1} / {questions.length}
          </div>
        </div>
      </div>

      {/* Question Progress Dots */}
      <div className="flex justify-center gap-2">
        {questions.map((_, index) => (
          <div
            key={index}
            className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${index === currentQuestion 
                ? 'bg-sage-600' 
                : index < currentQuestion 
                  ? 'bg-sage-300' 
                  : 'bg-stone-200'
              }
            `}
            data-testid={`question-dot-${index}`}
          />
        ))}
      </div>

      {/* Current Question */}
      <div className="space-y-4">
        <div className="bg-white rounded-stone p-6 border border-stone-200 shadow-sm">
          <h3 className="text-lg font-medium text-stone-900 mb-3">
            {questions[currentQuestion]}
          </h3>
          
          {questionDescriptions[currentQuestion] && (
            <div className="mb-4 p-3 bg-stone-50 rounded text-sm text-stone-600 whitespace-pre-line">
              {questionDescriptions[currentQuestion]}
            </div>
          )}

          <Textarea
            value={answers[currentQuestion] || ''}
            onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
            placeholder="여기에 답변을 작성해주세요..."
            className="min-h-[120px] resize-none"
            data-testid={`question-textarea-${currentQuestion}`}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          onClick={handlePrevious}
          disabled={!canGoPrevious()}
          className={`flex items-center gap-2 font-medium border ${
            canGoPrevious() 
              ? 'bg-white border-sage-300 text-sage-700 hover:bg-sage-50 shadow-sm' 
              : 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
          }`}
          data-testid="button-previous-question"
        >
          <ArrowLeft className="w-4 h-4" />
          이전 질문
        </Button>

        {/* 다음 질문 버튼 - 마지막 질문이 아닐 때 */}
        {currentQuestion < questions.length - 1 && (
          <Button
            onClick={handleNext}
            disabled={!canGoNext()}
            className={`flex-1 flex items-center justify-center gap-2 font-medium transition-colors ${
              canGoNext() 
                ? 'bg-sage-600 hover:bg-sage-700 text-white shadow-sm' 
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
            data-testid="button-next-question"
          >
            <span>다음 질문</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}

        {/* 리프레이밍 생성 버튼 - 마지막 질문일 때 */}
        {currentQuestion >= questions.length - 1 && (
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className={`flex-1 font-medium transition-colors ${
              canProceed 
                ? 'bg-sage-600 hover:bg-sage-700 text-white shadow-sm' 
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
            data-testid="button-complete-questions"
          >
            리프레이밍 생성하기
          </Button>
        )}
      </div>

    </div>
  );
}