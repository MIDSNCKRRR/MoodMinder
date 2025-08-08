import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProgressBar from "@/components/identity-journal/progress-bar";
import Step1Keywords from "@/components/identity-journal/step-1-keywords";
import Step2Reflection from "@/components/identity-journal/step-2-reflection";

interface IdentityJournalFlowProps {
  onBack: () => void;
}

export default function IdentityJournalFlow({ onBack }: IdentityJournalFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  
  // State for all steps
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [reflectionContent, setReflectionContent] = useState("");

  // Load saved data on component mount
  useEffect(() => {
    const savedKeywords = localStorage.getItem('identityJournal_keywords');
    const savedContent = localStorage.getItem('identityJournal_content');

    if (savedKeywords) {
      try {
        setSelectedKeywords(JSON.parse(savedKeywords));
      } catch (e) {
        console.error('Error parsing saved keywords:', e);
      }
    }
    if (savedContent) {
      setReflectionContent(savedContent);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < 2) {
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
      const journalData = {
        userId: "temp-user", // This will be replaced with actual user ID when auth is implemented
        journalType: "identity" as const,
        emotionLevel: 3, // Default neutral for identity journal
        emotionType: "reflective",
        content: reflectionContent,
        bodyMapping: {
          keywords: selectedKeywords,
          keywordCount: selectedKeywords.length,
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
      console.log('Identity journal entry saved:', savedEntry);

      // Clear localStorage
      localStorage.removeItem('identityJournal_keywords');
      localStorage.removeItem('identityJournal_content');

      // Reset form and go back to journal types
      setCurrentStep(1);
      setSelectedKeywords([]);
      setReflectionContent("");
      onBack();
    } catch (error) {
      console.error('Error saving identity journal entry:', error);
      // You could show a toast notification here
    }
  };

  // Memoize the keywords change handler to prevent re-renders
  const handleKeywordsChange = useCallback((keywords: string[]) => {
    setSelectedKeywords(keywords);
  }, []);

  const handleContentChange = useCallback((content: string) => {
    setReflectionContent(content);
  }, []);

  const totalSteps = 2;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-sage-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={currentStep === 1 ? onBack : handleBack}
            className="text-sage-600 hover:text-sage-700"
            data-testid="back-button"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInfo(!showInfo)}
              className="text-sage-600 hover:text-sage-700"
              data-testid="info-button"
            >
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Info Panel */}
        {showInfo && (
          <Card className="mb-6 border-sage-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sage-700">Identity Journal</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInfo(false)}
                  className="text-sage-500 hover:text-sage-600"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-sm text-sage-600">
                Explore your sense of self through keywords and reflection. Select words that resonate with who you are today, then reflect on your identity journey.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Progress Bar */}
        <ProgressBar 
          currentStep={currentStep} 
          totalSteps={totalSteps}
          className="mb-8"
        />

        {/* Step Content */}
        {currentStep === 1 && (
          <Step1Keywords
            selectedKeywords={selectedKeywords}
            onKeywordsChange={handleKeywordsChange}
            onNext={handleNext}
          />
        )}
        
        {currentStep === 2 && (
          <Step2Reflection
            content={reflectionContent}
            onContentChange={handleContentChange}
            selectedKeywords={selectedKeywords}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}