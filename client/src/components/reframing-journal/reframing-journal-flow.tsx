import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ProgressBar } from "@/components/reframing-journal/progress-bar";
import { Step1EmotionSelection } from "@/components/reframing-journal/step-1-emotion-selection";
import { Step2Questions } from "@/components/reframing-journal/step-2-questions";
import { Step3ReframingResult } from "@/components/reframing-journal/step-3-reframing-result";
import { gptReframingService } from "@/services/gpt-reframing";

type Emotion = {
  id: string;
  name: string;
  english: string;
};

type AnswerWithMethod = {
  content: string;
  inputMethod: 'text' | 'voice';
  lastUpdated: Date;
};

const emotions: Emotion[] = [
  // { id: "sadness", name: "슬픔", english: "Sadness" },
  // { id: "anger", name: "분노", english: "Anger" },
  // { id: "fear", name: "두려움", english: "Fear" },
  { id: "shame", name: "수치심", english: "Shame" },
  { id: "emptiness", name: "공허함", english: "Emptiness" },
  { id: "jealousy", name: "질투", english: "Jealousy" },
  { id: "urgency", name: "조급함", english: "Urgency" },
  // { id: "joy", name: "기쁨", english: "Joy" },
  // { id: "love", name: "사랑", english: "Love" },
  { id: "recognition", name: "인정욕구", english: "Need for Recognition" },
  { id: "inferiority", name: "열등감", english: "Inferiority" },
];

const emotionQuestions: Record<string, string[]> = {
  sadness: [
    "오늘 느낀 슬픈 감정/상황은?",
    "이 슬픔 속에서 어떤 감정이 스쳤지?",
    // "그 슬픔을 지금의 나에게 허용한다면?",
    // "리프레이밍 문장으로 다시 써보기",
  ],
  anger: [
    "오늘 느낀 분노 감정/상황은?",
    "그 분노를 보며 어떤 감정이 스쳤지?",
    "그 분노를 지금의 나에게 허용한다면?",
    "리프레이밍 문장으로 다시 써보기",
  ],
  fear: [
    "오늘 느낀 두려운 감정/상황은?",
    "그 두려움을 보며 어떤 감정이 스쳤지?",
    "그 두려움을 지금의 나에게 허용한다면?",
    "리프레이밍 문장으로 다시 써보기",
  ],
  shame: [
    "오늘 느낀 수치심 감정/상황은?",
    "그 수치심을 보며 어떤 감정이 스쳤지?",
    // "그 수치심을 지금의 나에게 허용한다면?",
    // "리프레이밍 문장으로 다시 써보기",
  ],
  emptiness: [
    "오늘 느낀 공허함 감정/상황은?",
    "그 공허함을 보며 어떤 감정이 스쳤지?",
    "그 공허함을 지금의 나에게 허용한다면?",
    "리프레이밍 문장으로 다시 써보기",
  ],
  jealousy: [
    "오늘 느낀 질투 감정/상황은?",
    "그 질투를 보며 어떤 감정이 스쳤지?",
    "그 질투를 지금의 나에게 허용한다면?",
    "리프레이밍 문장으로 다시 써보기",
  ],
  urgency: [
    "오늘 느낀 조급함 감정/상황은?",
    "그 조급함을 보며 어떤 감정이 스쳤지?",
    "그 조급함을 지금의 나에게 허용한다면?",
    "리프레이밍 문장으로 다시 써보기",
  ],
  joy: [
    "오늘 느낀 기쁜 감정/상황은?",
    "그 기쁨을 보며 어떤 감정이 스쳤지?",
    "그 기쁨을 지금의 나에게 허용한다면?",
    "리프레이밍 문장으로 다시 써보기",
  ],
  love: [
    "오늘 느낀 사랑 감정/상황은?",
    "그 사랑을 보며 어떤 감정이 스쳤지?",
    "그 사랑을 지금의 나에게 허용한다면?",
    "리프레이밍 문장으로 다시 써보기",
  ],
  recognition: [
    "오늘 느낀 인정욕구 감정/상황은?",
    "그 인정욕구를 보며 어떤 감정이 스쳤지?",
    "그 인정욕구를 지금의 나에게 허용한다면?",
    "리프레이밍 문장으로 다시 써보기",
  ],
  inferiority: [
    "오늘 느낀 열등감 감정/상황은?",
    "그 열등감을 보며 어떤 감정이 스쳤지?",
    "그 열등감을 지금의 나에게 허용한다면?",
    "리프레이밍 문장으로 다시 써보기",
  ],
};

interface ReframingJournalFlowProps {
  onBack: () => void;
}

export function ReframingJournalFlow({ onBack }: ReframingJournalFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [answers, setAnswers] = useState<AnswerWithMethod[]>([]);
  const [reframedSentences, setReframedSentences] = useState<string[]>([]);
  const [isGeneratingReframing, setIsGeneratingReframing] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (selectedEmotion) {
      const questionCount = emotionQuestions[selectedEmotion.id]?.length || 0;
      setAnswers(new Array(questionCount).fill({
        content: "",
        inputMethod: 'text' as const,
        lastUpdated: new Date()
      }));
    }
  }, [selectedEmotion]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/journal-entries", data);
    },
    onSuccess: () => {
      toast({
        title: "저장 완료",
        description: "리프레이밍 저널이 성공적으로 저장되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      onBack();
    },
    onError: (error) => {
      console.error("Save error:", error);
      toast({
        title: "저장 실패",
        description: "저장 중 오류가 발생했습니다. 다시 시도해 주세요.",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (currentStep === 1 && selectedEmotion) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedFromStep2()) {
      generateReframing();
    }
  };

  const generateReframing = async () => {
    if (!selectedEmotion) return;

    setIsGeneratingReframing(true);
    setCurrentStep(3);

    try {
      const response = await gptReframingService.reframeEmotion({
        emotion: selectedEmotion.id,
        emotionName: selectedEmotion.name,
        answers: answers.filter((answer) => answer.content.trim()).map((answer) => answer.content), // Only non-empty answers
      });

      if (response.success) {
        setReframedSentences(response.reframedSentences);
      } else {
        toast({
          title: "리프레이밍 생성 실패",
          description: response.error || "다시 시도해 주세요.",
          variant: "destructive",
        });
        setCurrentStep(2); // Go back to questions
      }
    } catch (error) {
      console.error("Reframing generation error:", error);
      toast({
        title: "오류 발생",
        description: "리프레이밍 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      setCurrentStep(2); // Go back to questions
    } finally {
      setIsGeneratingReframing(false);
    }
  };

  const handleRegenerateReframing = () => {
    generateReframing();
  };

  const handlePrevious = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      onBack();
    }
  };

  const handleBackToEmotionSelection = () => {
    setCurrentStep(1);
    setSelectedEmotion(null);
    setAnswers([]);
  };

  const handleSave = (selectedSentences?: string[]) => {
    if (!selectedEmotion) return;

    const finalContent = selectedSentences
      ? [
          ...answers.filter((answer) => answer.content.trim()).map((answer) => answer.content),
          "",
          "=== 리프레이밍 결과 ===",
          ...selectedSentences,
        ].join("\n\n")
      : answers.map((answer) => answer.content).join("\n\n");

    const journalData = {
      userId: "temp-user",
      journalType: "reframing",
      emotionLevel: 3,
      emotionType: selectedEmotion.id,
      content: finalContent,
      bodyMapping: {
        selectedEmotion: selectedEmotion.name,
        answers: answers.map(answer => ({
          content: answer.content,
          inputMethod: answer.inputMethod,
          timestamp: answer.lastUpdated.toISOString()
        })),
        reframedSentences: selectedSentences || [],
        timestamp: new Date().toISOString(),
      },
    };

    console.log("Reframing journal entry saved:", journalData);
    mutation.mutate(journalData);
  };

  const canProceed = () => {
    if (currentStep === 1) return !!selectedEmotion;
    if (currentStep === 2) return canProceedFromStep2();
    if (currentStep === 3) return reframedSentences.length > 0;
    return false;
  };

  const canProceedFromStep2 = () => {
    if (!selectedEmotion) return false;
    const questionCount = emotionQuestions[selectedEmotion.id]?.length || 0;
    return answers.length === questionCount && answers.every((answer) => answer.content.trim());
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1EmotionSelection
            emotions={emotions}
            selectedEmotion={selectedEmotion}
            onEmotionSelect={setSelectedEmotion}
            onNext={handleNext}
            canProceed={canProceed()}
          />
        );
      case 2:
        return (
          <Step2Questions
            emotion={selectedEmotion!}
            questions={emotionQuestions[selectedEmotion!.id] || []}
            answers={answers}
            onAnswersChange={setAnswers}
            onNext={handleNext}
            canProceed={canProceed()}
            onBackToEmotionSelection={handleBackToEmotionSelection}
          />
        );
      case 3:
        return (
          <Step3ReframingResult
            emotion={selectedEmotion!}
            answers={answers}
            reframedSentences={reframedSentences}
            isLoading={isGeneratingReframing}
            onBack={handlePrevious}
            onRegenerate={handleRegenerateReframing}
            onSave={handleSave}
            canSave={!mutation.isPending}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4 pt-4">
            <Button
              onClick={handlePrevious}
              variant="ghost"
              size="sm"
              className="p-2"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <div className="text-center">
              <h2 className="text-xl font-serif font-semibold text-stone-600">
                Reframing Journal
              </h2>
              <p className="text-stone-400 text-sm">
                Transform negative thoughts into positive perspectives
              </p>
            </div>

            <Button
              onClick={() => setShowInfo(!showInfo)}
              variant="ghost"
              size="sm"
              className="p-2"
              data-testid="info-button"
            >
              <Info className="w-4 h-4" />
            </Button>
          </div>

          <ProgressBar currentStep={currentStep} totalSteps={3} />
        </div>

        {/* Info Panel for Reframing Journal */}
        {showInfo && (
          <div className="p-4 pt-0">
            <Card
              className="rounded-organic stone-shadow border-0 relative"
              style={{
                background:
                  "linear-gradient(135deg, hsl(261, 35%, 93%) 0%, hsl(261, 30%, 78%) 100%)",
              }}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-serif font-semibold text-stone-600 text-lg">
                    About Reframing Journal
                  </h3>
                  <Button
                    onClick={() => setShowInfo(false)}
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto"
                    data-testid="close-info"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-3 text-sm text-stone-600">
                  <p>
                    The Reframing Journal helps you transform negative thoughts
                    into positive perspectives using cognitive reframing
                    techniques.
                  </p>
                  <div className="space-y-2">
                    <p>
                      <strong>Step 1:</strong> Choose the emotion you want to
                      explore
                    </p>
                    <p>
                      <strong>Step 2:</strong> Answer guided questions about
                      your feelings and thoughts
                    </p>
                    <p>
                      <strong>Step 3:</strong> AI generates positive reframed
                      perspectives based on your responses
                    </p>
                  </div>
                  <p className="text-xs text-purple-600 bg-white/60 p-2 rounded">
                    💡 This practice can help reduce negative thinking patterns
                    and build emotional resilience over time.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4">{renderCurrentStep()}</div>
      </div>
    </div>
  );
}
