import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProgressBar from "./progress-bar";
import Step1Emotion from "./step-1-emotion";
import Step2BodyMap from "./step-2-body-map";
import Step3Journal from "./step-3-journal";
import Step4Keywords from "./step-4-keywords";

interface BodyJournalFlowProps {
  onBack: () => void;
}

export default function BodyJournalFlow({ onBack }: BodyJournalFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  
  // State for all steps
  const [selectedEmotion, setSelectedEmotion] = useState<number>(4);
  const [emotionIntensity, setEmotionIntensity] = useState<number>(50);
  const [selectedBodyFeelings, setSelectedBodyFeelings] = useState<Record<string, string>>({});
  const [journalContent, setJournalContent] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<Array<{keyword: string, score: number}>>([]);

  // Load saved data on component mount
  useEffect(() => {
    const savedEmotion = localStorage.getItem('bodyJournal_emotion');
    const savedIntensity = localStorage.getItem('bodyJournal_intensity');
    const savedBodyFeelings = localStorage.getItem('bodyJournal_bodyFeelings');
    const savedContent = localStorage.getItem('bodyJournal_content');
    const savedKeywords = localStorage.getItem('bodyJournal_keywords');

    if (savedEmotion) {
      setSelectedEmotion(parseInt(savedEmotion));
    }
    if (savedIntensity) {
      setEmotionIntensity(parseInt(savedIntensity));
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
    if (savedKeywords) {
      try {
        setSelectedKeywords(JSON.parse(savedKeywords));
      } catch (e) {
        console.error('Error parsing saved keywords:', e);
      }
    }
  }, []);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Prepare journal entry data
      const emotionData = getEmotionData(selectedEmotion);
      const journalData = {
        userId: "temp-user", // This will be replaced with actual user ID when auth is implemented
        journalType: "body" as const,
        emotionLevel: emotionData.level, // Convert to 1-5 scale for database compatibility
        emotionType: emotionData.type,
        content: journalContent,
        bodyMapping: {
          feelings: selectedBodyFeelings, // Body part specific emotions
          emotionCategory: selectedEmotion, // Original emotion selection (1-12)
          intensity: emotionIntensity, // Overall emotion intensity (0-100)
          keywords: selectedKeywords, // Keyword scores
          timestamp: new Date().toISOString()
        },
      };

      // Save to backend
      const response = await fetch('/api/journal-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(journalData),
      });

      if (!response.ok) {
        throw new Error(`Failed to save entry: ${response.statusText}`);
      }

      const savedEntry = await response.json();
      console.log('Journal entry saved:', savedEntry);

      // Clear localStorage
      localStorage.removeItem('bodyJournal_emotion');
      localStorage.removeItem('bodyJournal_intensity');
      localStorage.removeItem('bodyJournal_bodyFeelings');
      localStorage.removeItem('bodyJournal_content');
      localStorage.removeItem('bodyJournal_keywords');

      // Reset form and go back to journal types
      setCurrentStep(1);
      setSelectedEmotion(4);
      setEmotionIntensity(50);
      setSelectedBodyFeelings({});
      setJournalContent("");
      setSelectedKeywords([]);
      onBack();
    } catch (error) {
      console.error('Error saving journal entry:', error);
      // You could show a toast notification here
    }
  };

  // Helper function to convert emotion ID to type and level
  const getEmotionData = (emotionId: number) => {
    const emotionCategories = [
      { id: 1, label: "Overwhelmed", type: "overwhelmed", level: 1 },
      { id: 2, label: "Anxious", type: "anxious", level: 2 },
      { id: 3, label: "Sad", type: "sad", level: 2 },
      { id: 4, label: "Neutral", type: "neutral", level: 3 },
      { id: 5, label: "Content", type: "content", level: 4 },
      { id: 6, label: "Happy", type: "happy", level: 4 },
      { id: 7, label: "Loving", type: "loving", level: 5 },
      { id: 8, label: "Peaceful", type: "peaceful", level: 5 },
      { id: 9, label: "Energized", type: "energized", level: 5 },
      { id: 10, label: "Excited", type: "excited", level: 5 },
      { id: 11, label: "Tired", type: "tired", level: 2 },
      { id: 12, label: "Mindful", type: "mindful", level: 4 },
    ];
    
    const emotion = emotionCategories.find(e => e.id === emotionId);
    return emotion || { type: "neutral", level: 3 };
  };

  // Memoize the body feelings change handler to prevent re-renders
  const handleBodyFeelingsChange = useCallback((feelings: Record<string, string>) => {
    setSelectedBodyFeelings(feelings);
  }, []);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Emotion
            selectedEmotion={selectedEmotion}
            emotionIntensity={emotionIntensity}
            onEmotionChange={setSelectedEmotion}
            onIntensityChange={setEmotionIntensity}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <Step2BodyMap
            selectedBodyFeelings={selectedBodyFeelings}
            onBodyFeelingsChange={handleBodyFeelingsChange}
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
            onComplete={handleNext}
          />
        );
      case 4:
        return (
          <Step4Keywords
            selectedKeywords={selectedKeywords}
            onKeywordsChange={setSelectedKeywords}
            onNext={handleComplete}
            onBack={handleBack}
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
          <p className="text-stone-400 text-sm">Step {currentStep} of 4</p>
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
              <p>The Body Journal helps you connect with your emotional and physical state through a guided 4-step process.</p>
              <div className="space-y-2">
                <p><strong>Steps:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Step 1:</strong> Choose your current emotion from 12 options</li>
                  <li><strong>Step 2:</strong> Map where you feel these emotions in your body</li>
                  <li><strong>Step 3:</strong> Journal about your thoughts and sensations</li>
                  <li><strong>Step 4:</strong> Rate keyword alignment with today's state (1-5 scale)</li>
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
      <ProgressBar currentStep={currentStep} totalSteps={4} />

      {/* Current Step Content */}
      {renderCurrentStep()}
    </div>
  );
}