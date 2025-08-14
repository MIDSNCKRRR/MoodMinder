import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { VoiceOrb } from './voice-orb';
import { useVoiceRecognition } from '@/hooks/use-voice-recognition';

interface VoiceQuestionFlowProps {
  emotion: {
    id: string;
    name: string;
    english: string;
  };
  questions: string[];
  onAnswersComplete: (answers: string[]) => void;
  onBack: () => void;
  className?: string;
}

export function VoiceQuestionFlow({
  emotion,
  questions,
  onAnswersComplete,
  onBack,
  className = ''
}: VoiceQuestionFlowProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(''));
  const [isListening, setIsListening] = useState(false);
  const [hasStartedListening, setHasStartedListening] = useState(false);

  const {
    transcript,
    interimTranscript,
    finalTranscript,
    isListening: voiceIsListening,
    isSupported: isVoiceSupported,
    startListening,
    stopListening,
    resetTranscript,
    error: voiceError,
  } = useVoiceRecognition({
    continuous: false,
    interimResults: true,
    onResult: (transcript, isFinal) => {
      if (isFinal && transcript.trim()) {
        handleVoiceInput(transcript.trim());
        // 텍스트가 완료되어도 박스는 유지하고, 리셋만 진행
        setTimeout(() => {
          resetTranscript();
          setIsListening(false);
          // hasStartedListening은 유지해서 박스가 사라지지 않도록
        }, 1000); // 1초 후 상태 변경
      }
    },
    onEnd: () => {
      setIsListening(false);
      // hasStartedListening은 여기서도 유지
    },
    onError: (error) => {
      console.error('Voice recognition error:', error);
      setIsListening(false);
      // 에러 시에만 완전히 리셋
      setTimeout(() => {
        setHasStartedListening(false);
      }, 2000);
    },
  });

  const handleVoiceInput = useCallback((transcript: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = transcript;
    setAnswers(newAnswers);
  }, [answers, currentQuestionIndex]);

  const handleStartListening = useCallback(() => {
    if (!isVoiceSupported) {
      alert('음성 인식이 지원되지 않는 브라우저입니다.');
      return;
    }

    // 먼저 상태를 설정해서 UI가 즉시 업데이트되도록
    setHasStartedListening(true);
    setIsListening(false); // 초기에는 false로 설정
    
    // 잠시 후 실제 음성 인식 시작
    setTimeout(() => {
      setIsListening(true);
      startListening();
    }, 100);
  }, [isVoiceSupported, startListening]);

  const handleStopListening = useCallback(() => {
    setIsListening(false);
    setHasStartedListening(false);
    stopListening();
  }, [stopListening]);

  // 새로운 함수: 음성 인식 세션 완전 종료
  const handleCompleteVoiceSession = useCallback(() => {
    setIsListening(false);
    setHasStartedListening(false);
    resetTranscript();
  }, [resetTranscript]);

  const canGoNext = () => {
    return answers[currentQuestionIndex]?.trim().length > 0;
  };

  const canGoPrevious = () => {
    return currentQuestionIndex > 0;
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1 && canGoNext()) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious()) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleComplete = () => {
    if (canGoNext()) {
      onAnswersComplete(answers);
    }
  };

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const allQuestionsAnswered = answers.every(answer => answer.trim().length > 0);

  if (!isVoiceSupported) {
    return (
      <Card className={`rounded-organic border-red-200 ${className}`}>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">음성 인식이 지원되지 않는 브라우저입니다.</p>
          <Button onClick={onBack} className="mt-4" variant="outline">
            돌아가기
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with emotion and progress */}
      <Card className="rounded-organic border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium text-stone-900">
              {emotion.name} 탐구하기
            </h2>
            <div className="text-sm text-stone-600">
              {currentQuestionIndex + 1} / {questions.length}
            </div>
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentQuestionIndex
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600 scale-110'
                    : index < currentQuestionIndex
                    ? 'bg-green-500'
                    : answers[index]?.trim()
                    ? 'bg-blue-400'
                    : 'bg-stone-300'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card className="rounded-organic border-purple-200">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-medium text-stone-900 mb-6">
            {questions[currentQuestionIndex]}
          </h3>

          {/* Voice Orb Animation */}
          <div className="flex justify-center mb-6">
            <VoiceOrb
              isListening={isListening}
              palette="violet"
              size="large"
              className="mx-auto"
            />
          </div>

          {/* Voice Controls */}
          <div className="space-y-4">
            {!hasStartedListening ? (
              <Button
                onClick={handleStartListening}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <Mic className="w-5 h-5 mr-2" />
                음성으로 답변하기
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-purple-600">
                  <div className={`w-3 h-3 rounded-full ${
                    voiceIsListening ? 'bg-red-500 animate-pulse' : 
                    hasStartedListening ? 'bg-yellow-500' : 'bg-stone-400'
                  }`} />
                  <span className="text-sm font-medium">
                    {voiceIsListening ? '듣고 있습니다...' : 
                     hasStartedListening ? '음성 인식 준비 중...' : '음성 인식 완료'}
                  </span>
                </div>
                
                {/* 디버깅용 상태 표시 */}
                <div className="text-xs text-gray-500 mt-2">
                  isListening: {isListening.toString()} | 
                  hasStartedListening: {hasStartedListening.toString()} | 
                  voiceIsListening: {voiceIsListening.toString()}
                </div>
                
                {voiceIsListening && (
                  <Button
                    onClick={handleStopListening}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <MicOff className="w-4 h-4 mr-2" />
                    중단
                  </Button>
                )}
              </div>
            )}

            {/* Real-time voice input display - 항상 보이도록 조건 수정 */}
            {hasStartedListening && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 min-h-[80px]">
                <p className="text-yellow-800 text-sm mb-2">
                  <strong>🎤 {voiceIsListening ? '실시간 음성 인식 중...' : '음성 인식 준비 중...'}</strong>
                </p>
                {(interimTranscript || transcript) ? (
                  <p className="text-yellow-700 text-base leading-relaxed">
                    {interimTranscript || transcript}
                    <span className="animate-pulse ml-1 text-yellow-500">|</span>
                  </p>
                ) : (
                  <p className="text-yellow-600 text-base italic">
                    {voiceIsListening ? '질문에 대한 답변을 말씀해주세요...' : '마이크 권한을 허용해주세요...'}
                    <span className="animate-pulse ml-1">🎙️</span>
                  </p>
                )}
              </div>
            )}

            {/* Final transcript confirmation */}
            {finalTranscript && !isListening && hasStartedListening && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-green-800 text-sm mb-1">
                  <strong>✅ 인식 완료:</strong>
                </p>
                <p className="text-green-700 text-base leading-relaxed mb-3">
                  {finalTranscript}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      // 다시 녹음하기
                      resetTranscript();
                      setIsListening(true);
                      startListening();
                    }}
                    variant="outline"
                    size="sm"
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    🎤 다시 녹음
                  </Button>
                  <Button
                    onClick={handleCompleteVoiceSession}
                    size="sm"
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    ✓ 이 답변 사용
                  </Button>
                </div>
              </div>
            )}

            {/* Current saved answer */}
            {answers[currentQuestionIndex] && !isListening && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm mb-1">
                  <strong>저장된 답변:</strong>
                </p>
                <p className="text-blue-700 text-base leading-relaxed">
                  {answers[currentQuestionIndex]}
                </p>
              </div>
            )}

            {/* Error display */}
            {voiceError && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <p className="text-red-600 text-sm">{voiceError}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        {currentQuestionIndex === 0 ? (
          <Button
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2 font-medium rounded-stone border bg-white border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <ArrowLeft className="w-4 h-4" />
            감정 다시 선택하기
          </Button>
        ) : (
          <Button
            onClick={handlePrevious}
            disabled={!canGoPrevious()}
            className="flex-1 flex items-center justify-center gap-2 font-medium rounded-stone border bg-white border-purple-300 text-purple-700 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            이전 질문
          </Button>
        )}

        {!isLastQuestion ? (
          <Button
            onClick={handleNext}
            disabled={!canGoNext()}
            className="flex-1 flex items-center justify-center gap-2 font-medium rounded-stone transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: canGoNext() 
                ? "linear-gradient(to right, hsl(261, 60%, 60%), hsl(261, 65%, 50%))"
                : undefined
            }}
          >
            <span>다음 질문</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={!allQuestionsAnswered}
            className="flex-1 flex items-center justify-center gap-2 font-medium rounded-stone transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: allQuestionsAnswered 
                ? "linear-gradient(to right, hsl(142, 60%, 60%), hsl(142, 65%, 50%))"
                : undefined
            }}
          >
            <CheckCircle className="w-4 h-4" />
            <span>완료</span>
          </Button>
        )}
      </div>

      {/* Progress Summary */}
      <Card className="rounded-organic bg-stone-50 border-stone-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-stone-800 mb-3">답변 현황</h4>
          <div className="space-y-2">
            {questions.map((question, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  answers[index]?.trim() ? 'bg-green-500' : 'bg-stone-300'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-stone-600 mb-1">{question}</p>
                  {answers[index]?.trim() && (
                    <p className="text-xs text-stone-500 bg-white p-2 rounded border">
                      {answers[index]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}