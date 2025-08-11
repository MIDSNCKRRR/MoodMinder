import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { ProgressBar } from '@/components/reframing-journal/progress-bar';
import { Step1EmotionSelection } from '@/components/reframing-journal/step-1-emotion-selection';
import { Step2Questions } from '@/components/reframing-journal/step-2-questions';

type Emotion = {
  id: string;
  name: string;
  english: string;
};

const emotions: Emotion[] = [
  { id: 'sadness', name: '슬픔', english: 'Sadness' },
  { id: 'anger', name: '분노', english: 'Anger' },
  { id: 'fear', name: '두려움', english: 'Fear' },
  { id: 'shame', name: '수치심', english: 'Shame' },
  { id: 'emptiness', name: '공허함', english: 'Emptiness' },
  { id: 'jealousy', name: '질투', english: 'Jealousy' },
  { id: 'urgency', name: '조급함', english: 'Urgency' },
  { id: 'joy', name: '기쁨', english: 'Joy' },
  { id: 'love', name: '사랑', english: 'Love' },
  { id: 'recognition', name: '인정욕구', english: 'Need for Recognition' },
  { id: 'inferiority', name: '열등감', english: 'Inferiority' }
];

const emotionQuestions: Record<string, string[]> = {
  sadness: [
    '오늘 느낀 슬픈 감정/상황은?',
    '이 슬픔 속에서 어떤 감정이 스쳤지?',
    '그 슬픔을 지금의 나에게 허용한다면?',
    '리프레이밍 문장으로 다시 써보기'
  ],
  anger: [
    '오늘 느낀 분노 감정/상황은?',
    '그 분노를 보며 어떤 감정이 스쳤지?',
    '그 분노를 지금의 나에게 허용한다면?',
    '리프레이밍 문장으로 다시 써보기'
  ],
  fear: [
    '오늘 느낀 두려운 감정/상황은?',
    '그 두려움을 보며 어떤 감정이 스쳤지?',
    '그 두려움을 지금의 나에게 허용한다면?',
    '리프레이밍 문장으로 다시 써보기'
  ],
  shame: [
    '오늘 느낀 수치심 감정/상황은?',
    '그 수치심을 보며 어떤 감정이 스쳤지?',
    '그 수치심을 지금의 나에게 허용한다면?',
    '리프레이밍 문장으로 다시 써보기'
  ],
  emptiness: [
    '오늘 느낀 공허함 감정/상황은?',
    '그 공허함을 보며 어떤 감정이 스쳤지?',
    '그 공허함을 지금의 나에게 허용한다면?',
    '리프레이밍 문장으로 다시 써보기'
  ],
  jealousy: [
    '오늘 느낀 질투 감정/상황은?',
    '그 질투를 보며 어떤 감정이 스쳤지?',
    '그 질투를 지금의 나에게 허용한다면?',
    '리프레이밍 문장으로 다시 써보기'
  ],
  urgency: [
    '오늘 느낀 조급함 감정/상황은?',
    '그 조급함을 보며 어떤 감정이 스쳤지?',
    '그 조급함을 지금의 나에게 허용한다면?',
    '리프레이밍 문장으로 다시 써보기'
  ],
  joy: [
    '오늘 느낀 기쁜 감정/상황은?',
    '그 기쁨을 보며 어떤 감정이 스쳤지?',
    '그 기쁨을 지금의 나에게 허용한다면?',
    '리프레이밍 문장으로 다시 써보기'
  ],
  love: [
    '오늘 느낀 사랑 감정/상황은?',
    '그 사랑을 보며 어떤 감정이 스쳤지?',
    '그 사랑을 지금의 나에게 허용한다면?',
    '리프레이밍 문장으로 다시 써보기'
  ],
  recognition: [
    '오늘 느낀 인정욕구 감정/상황은?',
    '그 인정욕구를 보며 어떤 감정이 스쳤지?',
    '그 인정욕구를 지금의 나에게 허용한다면?',
    '리프레이밍 문장으로 다시 써보기'
  ],
  inferiority: [
    '오늘 느낀 열등감 감정/상황은?',
    '그 열등감을 보며 어떤 감정이 스쳤지?',
    '그 열등감을 지금의 나에게 허용한다면?',
    '리프레이밍 문장으로 다시 써보기'
  ]
};

interface ReframingJournalFlowProps {
  onBack: () => void;
}

export function ReframingJournalFlow({ onBack }: ReframingJournalFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [answers, setAnswers] = useState<string[]>(['', '', '', '']);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/journal-entries', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "저장 완료",
        description: "리프레이밍 저널이 성공적으로 저장되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
      onBack();
    },
    onError: (error) => {
      console.error('Save error:', error);
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
    }
  };

  const handlePrevious = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      onBack();
    }
  };

  const handleSave = () => {
    if (!selectedEmotion) return;

    const journalData = {
      userId: 'temp-user',
      journalType: 'reframing',
      emotionLevel: 3,
      emotionType: selectedEmotion.id,
      content: answers.join('\n\n'),
      bodyMapping: {
        selectedEmotion: selectedEmotion.name,
        answers: answers,
        timestamp: new Date().toISOString(),
      },
    };

    console.log('Reframing journal entry saved:', journalData);
    mutation.mutate(journalData);
  };

  const canProceed = () => {
    if (currentStep === 1) return !!selectedEmotion;
    if (currentStep === 2) return answers.every(answer => answer.trim());
    return false;
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
        <div className="bg-white shadow-sm border-b border-stone-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevious}
              className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors p-2 hover:bg-stone-100 rounded-lg"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">뒤로</span>
            </button>
            
            <h1 className="text-lg font-semibold text-stone-900">
              리프레이밍 저널
            </h1>
            
            <div className="w-16" />
          </div>
          
          <ProgressBar currentStep={currentStep} totalSteps={2} />
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {renderCurrentStep()}
        </div>

        {/* Footer - only show on step 2 */}
        {currentStep === 2 && (
          <div className="bg-white border-t border-stone-200 p-4 shadow-lg">
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={!canProceed() || mutation.isPending}
                className="flex-1 bg-sage-600 hover:bg-sage-700 text-white h-12 text-base font-medium shadow-md"
                data-testid="button-save"
              >
                {mutation.isPending ? '저장 중...' : '저장하기'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}