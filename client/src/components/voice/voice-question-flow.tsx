import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mic,
  MicOff,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Type,
} from "lucide-react";
import { VoiceOrb } from "./voice-orb";
import { useVoiceRecognition } from "@/hooks/use-voice-recognition";

interface VoiceQuestionFlowProps {
  emotion: {
    id: string;
    name: string;
    english: string;
  };
  questions: string[];
  initialAnswers?: string[];
  startFromQuestion?: number;
  onAnswersComplete: (answers: string[]) => void;
  onBack: (partialAnswers?: string[]) => void;
  className?: string;
}

export function VoiceQuestionFlow({
  emotion,
  questions,
  initialAnswers,
  startFromQuestion = 0,
  onAnswersComplete,
  onBack,
  className = "",
}: VoiceQuestionFlowProps) {
  console.log("🎤 VoiceQuestionFlow received initialAnswers:", initialAnswers);
  console.log("🎤 VoiceQuestionFlow startFromQuestion:", startFromQuestion);

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(startFromQuestion);
  const [answers, setAnswers] = useState<string[]>(
    initialAnswers || new Array(questions.length).fill(""),
  );

  console.log("🎤 VoiceQuestionFlow initialized with answers:", answers);
  const [isListening, setIsListening] = useState(false);
  const [hasStartedListening, setHasStartedListening] = useState(false);
  const [shouldKeepListening, setShouldKeepListening] = useState(false);
  const [restartCount, setRestartCount] = useState(0);
  const [voiceState, setVoiceState] = useState<
    "idle" | "listening" | "processing" | "speaking"
  >("idle");
  const [realtimeTranscript, setRealtimeTranscript] = useState("");

  // Unified state configuration
  const stateConfig = {
    idle: {
      color: "stone",
      bgColor: "bg-stone-100",
      textColor: "text-stone-600",
      indicatorColor: "bg-purple-200",
      title: "Ready to listen",
      description: "",
      animation: "",
    },
    listening: {
      color: "purple",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      indicatorColor: "bg-purple-500",
      title: "I'm listening...",
      description: "",
      animation: "animate-pulse",
    },
    processing: {
      color: "amber",
      bgColor: "bg-amber-100",
      textColor: "text-amber-600",
      indicatorColor: "bg-amber-500",
      title: "Processing...",
      description: "Understanding your response",
      animation: "animate-bounce",
    },
    speaking: {
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      indicatorColor: "bg-green-500",
      title: "Got it!",
      description: "Response recorded",
      animation: "",
    },
  };

  const currentState = stateConfig[voiceState] || stateConfig.idle;

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
      console.log("🎤 onResult called:", {
        transcript,
        isFinal,
        length: transcript.length,
      });
      if (isFinal && transcript.trim()) {
        console.log("✅ Final transcript received, saving:", transcript.trim());
        handleVoiceInput(transcript.trim());
      } else if (!isFinal && transcript.trim()) {
        console.log("⏳ Interim transcript received:", transcript.trim());
        // interimTranscript는 훅에서 자동으로 상태 업데이트됨
      }
    },
    onStart: () => {
      console.log("🔴 Voice recognition started");
    },
    onEnd: () => {
      console.log("⏹️ Voice recognition ended", {
        shouldKeepListening,
        hasStartedListening,
        restartCount,
        hasFinalTranscript: !!finalTranscript,
      });

      // 간단한 재시작 로직: finalTranscript가 없고 사용자가 중단하지 않았으면 재시작
      if (
        shouldKeepListening &&
        hasStartedListening &&
        !finalTranscript &&
        restartCount < 3
      ) {
        console.log(`🔄 Auto-restarting (${restartCount + 1}/3)...`);
        setRestartCount((prev) => prev + 1);
        setTimeout(() => {
          if (shouldKeepListening && hasStartedListening) {
            startListening();
          }
        }, 500);
      } else {
        console.log("⏸️ Voice recognition session ended");
      }
    },
    onError: (error) => {
      console.error("❌ Voice recognition error:", error);
      setHasStartedListening(false);
    },
  });

  const handleVoiceInput = useCallback(
    (transcript: string) => {
      console.log("💾 Saving voice input:", {
        transcript,
        currentQuestionIndex,
      });
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = transcript;
      setAnswers(newAnswers);
      console.log("✅ Voice input saved to answers array:", newAnswers);
    },
    [answers, currentQuestionIndex],
  );

  const [currentRecognition, setCurrentRecognition] =
    useState<SpeechRecognition | null>(null);

  const handleStartListening = useCallback(() => {
    console.log("🚀 Direct voice recognition start");

    // 기존 세션이 있으면 중단
    if (currentRecognition) {
      currentRecognition.stop();
    }

    // 새로운 인식 세션 생성
    const recognition = new (window.webkitSpeechRecognition ||
      window.SpeechRecognition)();
    recognition.lang = "ko";
    recognition.continuous = true; // 긴 세션을 위해 true로 변경
    recognition.interimResults = true;
    setCurrentRecognition(recognition);

    recognition.addEventListener("start", () => {
      console.log("🎤 Recognition started (continuous mode)");
      setHasStartedListening(true);
      setVoiceState("listening");
    });

    recognition.addEventListener("speechstart", () => {
      console.log("🗣️ Speech detected - user is speaking");
      setVoiceState("listening");
    });

    recognition.addEventListener("speechend", () => {
      console.log("🤫 Speech ended - processing...");
      setVoiceState("processing");
    });

    recognition.addEventListener("result", (e) => {
      let interimText = "";
      let finalTranscript = "";

      // Process all results
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        } else {
          interimText += e.results[i][0].transcript;
        }
      }

      // Update real-time transcript for UI
      if (interimText) {
        setRealtimeTranscript(interimText);
        setVoiceState("listening");
      }

      if (finalTranscript.trim()) {
        console.log("📝 Recognition result:", finalTranscript);
        setVoiceState("speaking"); // Show as if AI is "understanding"

        // Accumulate answers
        const newAnswers = [...answers];
        const currentAnswer = newAnswers[currentQuestionIndex] || "";
        const updatedAnswer = currentAnswer
          ? `${currentAnswer} ${finalTranscript.trim()}`
          : finalTranscript.trim();

        newAnswers[currentQuestionIndex] = updatedAnswer;
        setAnswers(newAnswers);
        console.log("✅ Answer accumulated:", updatedAnswer);

        // Clear interim transcript and return to listening
        setRealtimeTranscript("");
        setTimeout(() => setVoiceState("listening"), 800);
      }
    });

    recognition.addEventListener("error", (e) => {
      console.error("❌ Recognition error:", e.error);
      if (e.error !== "no-speech") {
        setHasStartedListening(false);
        setCurrentRecognition(null);
      }
    });

    recognition.addEventListener("end", () => {
      console.log("⏹️ Recognition ended - attempting restart");
      // 사용자가 수동으로 중단하지 않았다면 재시작
      if (hasStartedListening) {
        setTimeout(() => {
          if (hasStartedListening && recognition === currentRecognition) {
            console.log("🔄 Auto-restarting recognition...");
            recognition.start();
          }
        }, 100);
      }
    });

    recognition.start();
  }, [answers, currentQuestionIndex, currentRecognition, hasStartedListening]);

  const handleStopListening = useCallback(() => {
    console.log("🛑 User manually stopping voice recognition");
    setHasStartedListening(false);
    setVoiceState("idle");
    setRealtimeTranscript("");
    if (currentRecognition) {
      currentRecognition.stop();
      setCurrentRecognition(null);
    }
  }, [currentRecognition]);

  // 새로운 함수: 음성 인식 세션 완전 종료
  const handleCompleteVoiceSession = useCallback(() => {
    console.log("✅ User completed voice session");
    setShouldKeepListening(false);
    setHasStartedListening(false);
    setRestartCount(0);
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
      console.log("🎤 VoiceQuestionFlow completing with answers:", answers);
      onAnswersComplete(answers);
    }
  };

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const allQuestionsAnswered = answers.every(
    (answer) => answer.trim().length > 0,
  );

  if (!isVoiceSupported) {
    return (
      <Card className={`rounded-organic border-red-200 ${className}`}>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">
            음성 인식이 지원되지 않는 브라우저입니다.
          </p>
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
          background:
            "linear-gradient(135deg, hsl(261, 35%, 93%) 0%, hsl(261, 30%, 78%) 100%)",
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
                  ${
                    index === currentQuestionIndex
                      ? "bg-gradient-to-br from-purple-500 to-purple-600 scale-110"
                      : "bg-transparent border-2 border-purple-300"
                  }
                `}
              />
            ))}
          </div>

          {/* Text Mode Toggle Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => {
                console.log(
                  "🔄 User clicked switch to text mode, current answers:",
                  answers,
                );
                onBack(answers);
              }}
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
          background:
            "linear-gradient(135deg, hsl(261, 35%, 95%) 0%, hsl(261, 25%, 88%) 100%)",
        }}
      >
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-stone-900 mb-4">
            {questions[currentQuestionIndex]}
          </h3>

          {/* Combined Floating Voice Orb & State Indicator */}
          <div className="flex flex-col items-center mb-6 space-y-6 relative">
            {/* Floating Orb Container */}
            <div className="relative">
              {/* Background Glow Effect */}
              <div
                className={`absolute inset-0 rounded-full blur-xl opacity-30 ${currentState.indicatorColor} transition-all duration-500`}
                style={{
                  transform:
                    voiceState === "listening"
                      ? "scale(1.2)"
                      : voiceState === "processing"
                        ? "scale(0.9)"
                        : voiceState === "speaking"
                          ? "scale(1.3)"
                          : "scale(1)",
                  filter: "blur(20px)",
                }}
              />

              {/* Voice Orb with Transparent Background */}
              <div className="relative">
                <VoiceOrb
                  isListening={hasStartedListening}
                  palette="violet"
                  size="large"
                  className="mx-auto transition-all duration-500 ease-in-out transform drop-shadow-2xl"
                  style={{
                    transform:
                      voiceState === "listening"
                        ? "scale(1.05)"
                        : voiceState === "processing"
                          ? "scale(0.95)"
                          : voiceState === "speaking"
                            ? "scale(1.1)"
                            : "scale(1)",
                    filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.1))",
                  }}
                />

                {/* Floating State Badge */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div
                    className={`inline-flex items-center justify-center gap-1.5 px-2 py-1 rounded-full backdrop-blur-md bg-white/80 border border-white/40 shadow-lg transition-all duration-300`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${currentState.indicatorColor} ${currentState.animation}`}
                      aria-hidden="true"
                    />
                    <span
                      className={`text-xs font-medium ${currentState.textColor}`}
                    >
                      {currentState.title}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* State Description */}
            {currentState.description && (
              <div className="text-center">
                <div
                  className={`text-sm ${currentState.textColor} opacity-75 transition-all duration-300`}
                >
                  {currentState.description}
                </div>
              </div>
            )}

            {/* Real-time transcript display for listening state */}
            {voiceState === "listening" && realtimeTranscript && (
              <div className="text-blue-600 italic bg-blue-50/80 backdrop-blur-sm px-4 py-2 rounded-full mt-2 max-w-xs mx-auto border border-blue-200/50 shadow-sm">
                "{realtimeTranscript}"
              </div>
            )}
          </div>

          {/* Enhanced Voice Controls */}
          <div className="space-y-4">
            {!hasStartedListening ? (
              <div className="space-y-4 text-center">
                <Button
                  onClick={handleStartListening}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-full text-base sm:text-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
                >
                  <Mic className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                  Start Voice Chat
                </Button>

                <div className="text-sm text-stone-500 space-y-1">
                  <p>Speak naturally and I'll understand</p>
                  <p>Your words will be added continuously</p>
                </div>

                {/* Debug tools - only in development */}
                {process.env.NODE_ENV === "development" && (
                  <details className="text-left">
                    <summary className="text-xs text-stone-400 cursor-pointer hover:text-stone-600">
                      Debug Tools
                    </summary>
                    <div className="flex gap-2 mt-2">
                      <Button
                        onClick={() => {
                          const recognition =
                            new (window.webkitSpeechRecognition ||
                              window.SpeechRecognition)();
                          recognition.lang = "ko";
                          recognition.addEventListener("result", (e) => {
                            alert(`Test: ${e.results[0][0].transcript}`);
                          });
                          recognition.start();
                        }}
                        variant="outline"
                        size="sm"
                        className="text-purple-600 border-purple-300"
                      >
                        Quick Test
                      </Button>

                      <Button
                        onClick={async () => {
                          try {
                            const stream =
                              await navigator.mediaDevices.getUserMedia({
                                audio: true,
                              });
                            alert("Mic OK!");
                            stream.getTracks().forEach((track) => track.stop());
                          } catch (err) {
                            alert(`Mic Error: ${err}`);
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-300"
                      >
                        Check Mic
                      </Button>
                    </div>
                  </details>
                )}
              </div>
            ) : (
              <div className="text-center space-y-4">
                <Button
                  onClick={handleStopListening}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <MicOff className="w-5 h-5 mr-2" />
                  Stop Listening
                </Button>

                <div className="text-sm text-stone-500">
                  <p>Voice session active</p>
                  <p>Keep speaking - I'm accumulating your responses</p>
                </div>
              </div>
            )}

            {/* Voice input display */}
            {hasStartedListening && (
              <div className="bg-white/60 p-4 rounded-stone border border-purple-200 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-purple-700 text-sm font-medium">
                    음성 인식 중... 계속 말씀해주세요
                  </p>
                  <Button
                    onClick={handleStopListening}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    중단
                  </Button>
                </div>

                {/* 실시간 누적 답변 표시 */}
                {answers[currentQuestionIndex] && (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200 max-h-32 overflow-y-auto">
                    <p className="text-green-800 text-sm mb-1">누적된 답변:</p>
                    <p className="text-green-700 text-base leading-relaxed break-words">
                      {answers[currentQuestionIndex]}
                    </p>
                  </div>
                )}

                <p className="text-xs text-stone-500">
                  말씀하신 내용이 계속 추가됩니다. 완료되면 "중단" 버튼을
                  눌러주세요.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Question Progress */}
      <Card
        className="rounded-organic stone-shadow border-0"
        style={{
          background:
            "linear-gradient(135deg, hsl(261, 10%, 96%) 0%, hsl(261, 15%, 90%) 100%)",
        }}
      >
        <CardContent className="p-4">
          <h4 className="font-medium text-stone-800 mb-3">현재 질문 답변</h4>
          <div className="flex items-start gap-3">
            <div
              className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                answers[currentQuestionIndex]?.trim()
                  ? "bg-purple-500"
                  : "bg-stone-300"
              }`}
            />
            <div className="flex-1">
              <p className="text-sm text-stone-600 mb-1">
                {questions[currentQuestionIndex]}
              </p>
              {answers[currentQuestionIndex]?.trim() && (
                <div className="text-xs text-stone-500 bg-white/60 p-2 rounded-stone border border-purple-200 max-h-20 overflow-y-auto">
                  <p className="break-words">
                    {answers[currentQuestionIndex].length > 150
                      ? `${answers[currentQuestionIndex].substring(0, 150)}...`
                      : answers[currentQuestionIndex]}
                  </p>
                </div>
              )}
              {!answers[currentQuestionIndex]?.trim() && (
                <p className="text-xs text-stone-400 italic">
                  아직 답변이 없습니다
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        {currentQuestionIndex === 0 ? (
          <Button
            onClick={() => onBack(answers)}
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
                ? "bg-white border-purple-300 text-purple-700 hover:bg-purple-50 shadow-sm"
                : "bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed"
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
                ? "text-white shadow-sm"
                : "bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300"
            }`}
            style={
              canGoNext()
                ? {
                    background:
                      "linear-gradient(to right, hsl(261, 60%, 60%), hsl(261, 65%, 50%))",
                  }
                : {}
            }
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
                ? "text-white shadow-sm"
                : "bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300"
            }`}
            style={
              allQuestionsAnswered
                ? {
                    background:
                      "linear-gradient(to right, hsl(261, 60%, 60%), hsl(261, 65%, 50%))",
                  }
                : {}
            }
          >
            리프레이밍 생성하기
          </Button>
        )}
      </div>
    </div>
  );
}
