import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProgressBar from "./progress-bar";
import Step1Emotion from "./step-1-emotion";
import Step2BodyMap from "./step-2-body-map";
import Step3Journal from "./step-3-journal";
// Preload body map images
import headNeckImage from "@assets/ChatGPT Image Aug 8, 2025, 03_28_00 PM_1754634489490.png";
import upperBodyImage from "@assets/image_1754643452084.png";
import lowerBodyImage from "@assets/image_1754642975195.png";

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

  // Load saved data and preload images on component mount
  useEffect(() => {
    // Preload body map images
    const preloadImages = [headNeckImage, upperBodyImage, lowerBodyImage];
    preloadImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });

    const savedEmotion = localStorage.getItem('bodyJournal_emotion');
    const savedIntensity = localStorage.getItem('bodyJournal_intensity');
    const savedBodyFeelings = localStorage.getItem('bodyJournal_bodyFeelings');
    const savedContent = localStorage.getItem('bodyJournal_content');

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

  const handleComplete = async () => {
    try {
      // Prepare journal entry data
      const emotionData = getEmotionData(selectedEmotion);
      console.log("Selected emotion:", selectedEmotion);
      console.log("Emotion data:", emotionData);
      
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
          timestamp: new Date().toISOString()
        },
      };
      
      console.log("Journal data being sent:", journalData);

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

      // Reset form and go back to journal types
      setCurrentStep(1);
      setSelectedEmotion(4);
      setEmotionIntensity(50);
      setSelectedBodyFeelings({});
      setJournalContent("");
      onBack();
    } catch (error) {
      console.error('Error saving journal entry:', error);
      // You could show a toast notification here
    }
  };

  // Helper function to convert emotion ID to type and level (using new emotion_color.json)
  const getEmotionData = (emotionId: number) => {
    const emotionCategories = [
      { id: 1, label: "Joy", type: "joy", level: 5 },        // 기쁨 - very positive
      { id: 2, label: "Trust", type: "trust", level: 4 },    // 신뢰 - positive  
      { id: 3, label: "Fear", type: "fear", level: 2 },      // 공포 - negative
      { id: 4, label: "Surprise", type: "surprise", level: 3 }, // 놀람 - neutral
      { id: 5, label: "Sadness", type: "sadness", level: 2 }, // 슬픔 - negative
      { id: 6, label: "Disgust", type: "disgust", level: 1 }, // 혐오 - very negative
      { id: 7, label: "Anger", type: "anger", level: 1 },     // 분노 - very negative
      { id: 8, label: "Anticipation", type: "anticipation", level: 4 }, // 기대 - positive
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