import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, ArrowLeft, ArrowRight, CheckCircle, Type } from 'lucide-react';
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
    continuous: true,
    interimResults: true,
    onResult: (transcript, isFinal) => {
      console.log('🎤 onResult called:', { transcript, isFinal });
      if (isFinal && transcript.trim()) {
        console.log('✅ Final transcript saved:', transcript.trim());
        handleVoiceInput(transcript.trim());
      }
    },
    onStart: () => {
      console.log('🔴 Voice recognition started');
    },
    onEnd: () => {
      console.log('⏹️ Voice recognition ended');
      // 더 적극적으로 재시작 - finalTranscript가 있어도 계속 듣기
      if (hasStartedListening) {
        console.log('🔄 Auto-restarting voice recognition for longer session...');
        setTimeout(() => {
          if (hasStartedListening) {
            startListening();
          }
        }, 500); // 좀 더 긴 대기시간
      }
    },
    onError: (error) => {
      console.error('❌ Voice recognition error:', error);
      setHasStartedListening(false);
    },
  });

  const handleVoiceInput = useCallback((transcript: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = transcript;
    setAnswers(newAnswers);
  }, [answers, currentQuestionIndex]);

  const handleStartListening = useCallback(() => {
    console.log('🚀 handleStartListening called');
    if (!isVoiceSupported) {
      console.log('❌ Voice not supported');
      alert('음성 인식이 지원되지 않는 브라우저입니다.');
      return;
    }

    console.log('📱 Setting hasStartedListening to true');
    // 세션 시작 표시
    setHasStartedListening(true);
    
    console.log('🎯 Calling startListening()');
    // 실제 음성 인식 시작 (voiceIsListening 상태는 훅에서 관리)
    startListening();
  }, [isVoiceSupported, startListening]);

  const handleStopListening = useCallback(() => {
    setHasStartedListening(false);
    stopListening();
  }, [stopListening]);

  // 새로운 함수: 음성 인식 세션 완전 종료
  const handleCompleteVoiceSession = useCallback(() => {
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
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-4">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`
                  w-3 h-3 rounded-full transition-all duration-300 shadow-sm
                  ${index === currentQuestionIndex 
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600 scale-110' 
                    : 'bg-transparent border-2 border-purple-300'
                  }
                `}
              />
            ))}
          </div>
          
          {/* Text Mode Toggle Button */}
          <div className="flex justify-center">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-purple-600 border-purple-300 hover:bg-purple-50"
            >
              <Type className="w-4 h-4" />
              텍스트모드로 전환
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card 
        className="rounded-organic stone-shadow border-0"
        style={{
          background: "linear-gradient(135deg, hsl(261, 35%, 95%) 0%, hsl(261, 25%, 88%) 100%)",
        }}
      >
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-stone-900 mb-4">
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
              <div className="space-y-3">
                <Button
                  onClick={handleStartListening}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  음성으로 답변하기
                </Button>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  버튼을 클릭한 후 마이크 권한을 허용하고 답변을 말씀해주세요
                </p>
              </div>
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

            {/* Real-time voice input display */}
            {hasStartedListening && (
              <div className="bg-white/60 p-4 rounded-stone border border-purple-200 min-h-[80px]">
                <p className="text-purple-700 text-sm mb-2 font-medium">
                  🎤 {voiceIsListening ? '실시간 음성 인식 중...' : finalTranscript ? '음성 인식 완료' : '음성 인식 준비 중...'}
                </p>
                
                {/* 디버그 정보 */}
                <div className="text-xs text-gray-500 mb-2 bg-gray-100 p-2 rounded">
                  Debug: voiceIsListening={voiceIsListening.toString()}, 
                  hasInterim={!!interimTranscript}, 
                  hasFinal={!!finalTranscript},
                  hasTranscript={!!transcript}
                </div>
                
                {(interimTranscript || finalTranscript || transcript) ? (
                  <div className="text-stone-700 text-base leading-relaxed">
                    {interimTranscript && (
                      <p className="text-blue-600">실시간: {interimTranscript}</p>
                    )}
                    {finalTranscript && (
                      <p className="text-green-600">최종: {finalTranscript}</p>
                    )}
                    {transcript && (
                      <p className="text-purple-600">전체: {transcript}</p>
                    )}
                    {voiceIsListening && <span className="animate-pulse ml-1 text-purple-500">|</span>}
                  </div>
                ) : (
                  <p className="text-stone-600 text-base italic">
                    {voiceIsListening ? '질문에 대한 답변을 말씀해주세요...' : '마이크 버튼을 눌러 음성 인식을 시작하세요'}
                    <span className="animate-pulse ml-1">🎙️</span>
                  </p>
                )}
              </div>
            )}

            {/* Final transcript confirmation */}
            {finalTranscript && !voiceIsListening && hasStartedListening && (
              <div className="bg-white/60 p-4 rounded-stone border border-purple-200">
                <p className="text-purple-700 text-sm mb-1 font-medium">
                  ✅ 음성 인식 결과:
                </p>
                <p className="text-stone-700 text-base leading-relaxed mb-3">
                  {finalTranscript}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      // 다시 녹음하기
                      resetTranscript();
                      startListening();
                    }}
                    variant="outline"
                    size="sm"
                    className="text-purple-600 border-purple-300 hover:bg-purple-50"
                  >
                    🎤 다시 녹음
                  </Button>
                  <Button
                    onClick={handleCompleteVoiceSession}
                    size="sm"
                    className="bg-purple-600 text-white hover:bg-purple-700"
                  >
                    ✓ 이 답변 사용
                  </Button>
                </div>
              </div>
            )}

            {/* Current saved answer */}
            {answers[currentQuestionIndex] && !voiceIsListening && !finalTranscript && (
              <div className="bg-white/60 p-4 rounded-stone border border-purple-200">
                <p className="text-purple-700 text-sm mb-1 font-medium">
                  저장된 답변:
                </p>
                <p className="text-stone-700 text-base leading-relaxed">
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
            className="flex-1 flex items-center justify-center gap-2 font-medium rounded-stone border bg-white border-purple-300 text-purple-700 hover:bg-purple-50 shadow-sm transition-all"
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
          >
            <ArrowLeft className="w-4 h-4" />
            이전 질문
          </Button>
        )}

        {!isLastQuestion ? (
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
          >
            <span>다음 질문</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={!allQuestionsAnswered}
            className={`flex-1 font-medium rounded-stone transition-all ${
              allQuestionsAnswered 
                ? 'text-white shadow-sm' 
                : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
            }`}
            style={allQuestionsAnswered ? {
              background: "linear-gradient(to right, hsl(261, 60%, 60%), hsl(261, 65%, 50%))"
            } : {}}
          >
            리프레이밍 생성하기
          </Button>
        )}
      </div>

      {/* Progress Summary */}
      <Card 
        className="rounded-organic stone-shadow border-0"
        style={{
          background: "linear-gradient(135deg, hsl(261, 10%, 96%) 0%, hsl(261, 15%, 90%) 100%)",
        }}
      >
        <CardContent className="p-4">
          <h4 className="font-medium text-stone-800 mb-3">답변 현황</h4>
          <div className="space-y-2">
            {questions.map((question, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  answers[index]?.trim() ? 'bg-purple-500' : 'bg-stone-300'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-stone-600 mb-1">{question}</p>
                  {answers[index]?.trim() && (
                    <p className="text-xs text-stone-500 bg-white/60 p-2 rounded-stone border border-purple-200">
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