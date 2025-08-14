import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Mic } from 'lucide-react';
import { VoiceQuestionFlow } from '@/components/voice/voice-question-flow';

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
  onBackToEmotionSelection?: () => void;
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
  canProceed = false,
  onBackToEmotionSelection
}: Step2QuestionsProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isVoiceMode, setIsVoiceMode] = useState(false);

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

  const handleVoiceAnswersComplete = (voiceAnswers: string[]) => {
    onAnswersChange(voiceAnswers);
    setIsVoiceMode(false);
  };

  const handleBackToTextMode = () => {
    setIsVoiceMode(false);
  };

  // Voice mode rendering
  if (isVoiceMode) {
    return (
      <VoiceQuestionFlow
        emotion={emotion}
        questions={questions}
        onAnswersComplete={handleVoiceAnswersComplete}
        onBack={handleBackToTextMode}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card 
        className="rounded-organic stone-shadow border-0"
        style={{
          background: "linear-gradient(135deg, hsl(261, 35%, 93%) 0%, hsl(261, 30%, 78%) 100%)",
        }}
      >
        <CardContent className="p-4 text-center">
          <h2 className="text-lg font-medium text-stone-900 mb-3">
            {emotion.name} 탐구하기
          </h2>
          
          {/* Question Progress Dots inside card */}
          <div className="flex justify-center gap-2 mb-4">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`
                  w-3 h-3 rounded-full transition-all duration-300 shadow-sm
                  ${index === currentQuestion 
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600 scale-110' 
                    : 'bg-transparent border-2 border-purple-300'
                  }
                `}
                data-testid={`question-dot-${index}`}
              />
            ))}
          </div>
          
          {/* Voice Mode Toggle */}
          <div className="flex justify-center">
            <Button
              onClick={() => setIsVoiceMode(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-purple-600 border-purple-300 hover:bg-purple-50"
            >
              <Mic className="w-4 h-4" />
              음성모드로 전환
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Question Card */}
      <Card 
        className="rounded-organic stone-shadow border-0"
        style={{
          background: "linear-gradient(135deg, hsl(261, 35%, 95%) 0%, hsl(261, 25%, 88%) 100%)",
        }}
      >
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-stone-900 mb-4">
            {questions[currentQuestion]}
          </h3>
          
          {questionDescriptions[currentQuestion] && (
            <div className="mb-6 p-4 bg-white/60 rounded-stone text-sm text-purple-700 whitespace-pre-line border border-purple-200">
              {questionDescriptions[currentQuestion]}
            </div>
          )}

          <div className="bg-white/70 p-4 rounded-stone border border-purple-200">
            <Textarea
              value={answers[currentQuestion] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
              placeholder="여기에 답변을 작성해주세요..."
              className="min-h-[120px] resize-none border-0 bg-transparent focus:ring-0 text-stone-700 placeholder:text-stone-400"
              data-testid={`question-textarea-${currentQuestion}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        {currentQuestion === 0 ? (
          <Button
            onClick={onBackToEmotionSelection}
            className="flex-1 flex items-center justify-center gap-2 font-medium rounded-stone border bg-white border-purple-300 text-purple-700 hover:bg-purple-50 shadow-sm transition-all"
            data-testid="button-back-to-emotion-selection"
          >
            <ArrowLeft className="w-4 h-4" />
            감정 다시 선택하기
          </Button>
        ) : (
          <Button
            onClick={handlePrevious}
            disabled={!canGoPrevious()}
            className={`flex-1 flex items-center justify-center gap-2 font-medium rounded-stone border transition-all ${
              canGoPrevious() 
                ? 'bg-white border-purple-300 text-purple-700 hover:bg-purple-50 shadow-sm' 
                : 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
            }`}
            data-testid="button-previous-question"
          >
            <ArrowLeft className="w-4 h-4" />
            이전 질문
          </Button>
        )}

        {/* 다음 질문 버튼 - 마지막 질문이 아닐 때 */}
        {currentQuestion < questions.length - 1 && (
          <Button
            onClick={handleNext}
            disabled={!canGoNext()}
            className={`flex-1 flex items-center justify-center gap-2 font-medium rounded-stone transition-all ${
              canGoNext() 
                ? 'text-white shadow-sm' 
                : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
            }`}
            style={canGoNext() ? {
              background: "linear-gradient(to right, hsl(261, 60%, 60%), hsl(261, 65%, 50%))"
            } : {}}
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
            className={`flex-1 font-medium rounded-stone transition-all ${
              canProceed 
                ? 'text-white shadow-sm' 
                : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
            }`}
            style={canProceed ? {
              background: "linear-gradient(to right, hsl(261, 60%, 60%), hsl(261, 65%, 50%))"
            } : {}}
            data-testid="button-complete-questions"
          >
            리프레이밍 생성하기
          </Button>
        )}
      </div>

    </div>
  );
}