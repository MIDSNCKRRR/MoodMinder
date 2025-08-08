import { useState, useEffect } from "react";
import { ArrowLeft, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProgressBar from "./progress-bar";
import Step1Emotion from "./step-1-emotion";
import Step2BodyMap from "./step-2-body-map";
import Step3Journal from "./step-3-journal";

interface BodyJournalFlowProps {
  onBack: () => void;
}

export default function BodyJournalFlow({ onBack }: BodyJournalFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  
  // State for all steps
  const [selectedEmotion, setSelectedEmotion] = useState<number>(4);
  const [selectedBodyFeelings, setSelectedBodyFeelings] = useState<Record<string, string>>({});
  const [journalContent, setJournalContent] = useState("");

  // Load saved data on component mount
  useEffect(() => {
    const savedEmotion = localStorage.getItem('bodyJournal_emotion');
    const savedBodyFeelings = localStorage.getItem('bodyJournal_bodyFeelings');
    const savedContent = localStorage.getItem('bodyJournal_content');

    if (savedEmotion) {
      setSelectedEmotion(parseInt(savedEmotion));
    }
    if (savedBodyFeelings) {
      try {
        setSelectedBodyFeelings(JSON.parse(savedBodyFeelings));
      } catch (e) {
        console.error('Error parsing saved body feelings:', e);
      }
    }
    if (savedContent) {
      setJournalContent(savedContent);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Reset form and go back to journal types
    setCurrentStep(1);
    setSelectedEmotion(4);
    setSelectedBodyFeelings({});
    setJournalContent("");
    onBack();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Emotion
            selectedEmotion={selectedEmotion}
            onEmotionChange={setSelectedEmotion}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <Step2BodyMap
            selectedBodyFeelings={selectedBodyFeelings}
            onBodyFeelingsChange={setSelectedBodyFeelings}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <Step3Journal
            journalContent={journalContent}
            onJournalChange={setJournalContent}
            onBack={handleBack}
            selectedEmotion={selectedEmotion}
            selectedBodyFeelings={selectedBodyFeelings}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with navigation, title and info */}
      <div className="flex justify-between items-center pt-8">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="p-2"
          data-testid="back-to-journal-types"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <div className="text-center">
          <h2 className="text-xl font-serif font-semibold text-stone-600">Body Journal</h2>
          <p className="text-stone-400 text-sm">Step {currentStep} of 3</p>
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

      {/* Info Panel for Body Journal */}
      {showInfo && (
        <Card 
          className="rounded-organic stone-shadow border-0 relative"
          style={{ background: 'linear-gradient(135deg, hsl(260, 45%, 96%) 0%, hsl(260, 40%, 91%) 100%)' }}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-serif font-semibold text-stone-600 text-lg">About Body Journal</h3>
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
              <p>The Body Journal helps you connect with your emotional and physical state through a guided 3-step process.</p>
              <div className="space-y-2">
                <p><strong>Steps:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Step 1:</strong> Choose your current emotion from 12 options</li>
                  <li><strong>Step 2:</strong> Map where you feel these emotions in your body</li>
                  <li><strong>Step 3:</strong> Journal about your thoughts and sensations</li>
                </ul>
                <p className="text-xs text-stone-500 mt-3">
                  Your progress is automatically saved as you move through each step.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Bar */}
      <ProgressBar currentStep={currentStep} totalSteps={3} />

      {/* Current Step Content */}
      {renderCurrentStep()}
    </div>
  );
}