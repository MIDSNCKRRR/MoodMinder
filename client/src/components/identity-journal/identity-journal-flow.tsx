import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProgressBar from "./progress-bar";
import Step1Keywords from "./step-1-keywords";
import Step2Reflection from "./step-2-reflection";

interface IdentityJournalFlowProps {
  onBack: () => void;
}

export default function IdentityJournalFlow({
  onBack,
}: IdentityJournalFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showInfo, setShowInfo] = useState(false);

  // State for all steps
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [reflectionContent, setReflectionContent] = useState("");

  // Load saved data on component mount
  useEffect(() => {
    const savedKeywords = localStorage.getItem("identityJournal_keywords");
    const savedContent = localStorage.getItem("identityJournal_content");

    if (savedKeywords) {
      try {
        setSelectedKeywords(JSON.parse(savedKeywords));
      } catch (e) {
        console.error("Error parsing saved keywords:", e);
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
          timestamp: new Date().toISOString(),
        },
      };

      // Save to backend
      const response = await fetch("/api/journal-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(journalData),
      });

      if (!response.ok) {
        throw new Error(`Failed to save entry: ${response.statusText}`);
      }

      const savedEntry = await response.json();
      console.log("Identity journal entry saved:", savedEntry);

      // Clear localStorage
      localStorage.removeItem("identityJournal_keywords");
      localStorage.removeItem("identityJournal_content");

      // Reset form and go back to journal types
      setCurrentStep(1);
      setSelectedKeywords([]);
      setReflectionContent("");
      onBack();
    } catch (error) {
      console.error("Error saving identity journal entry:", error);
      // You could show a toast notification here
    }
  };

  // Memoize handlers to prevent re-renders
  const handleKeywordsChange = useCallback((keywords: string[]) => {
    setSelectedKeywords(keywords);
  }, []);

  const handleContentChange = useCallback((content: string) => {
    setReflectionContent(content);
  }, []);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Keywords
            selectedKeywords={selectedKeywords}
            onKeywordsChange={handleKeywordsChange}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <Step2Reflection
            content={reflectionContent}
            onContentChange={handleContentChange}
            selectedKeywords={selectedKeywords}
            onComplete={handleComplete}
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
          onClick={currentStep === 1 ? onBack : handleBack}
          variant="ghost"
          size="sm"
          className="p-2"
          data-testid="back-to-journal-types"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="text-center">
          <h2 className="text-xl font-serif font-semibold text-stone-600">
            Identity Journal
          </h2>
          <p className="text-stone-400 text-sm">
            Explore your values and sense of self
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

      {/* Info Panel for Identity Journal */}
      {showInfo && (
        <Card
          className="rounded-organic stone-shadow border-0 relative"
          style={{
            background:
              "linear-gradient(135deg, hsl(120, 12%, 91%) 0%, hsl(120, 10%, 83%) 100%)",
          }}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-serif font-semibold text-stone-600 text-lg">
                About Identity Journal
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
              {/* <p>The Identity Journal helps you explore your values, beliefs, and authentic sense of self.</p> */}
              <p>Choose words that reflect who you are today</p>
              <div className="space-y-2">
                <p>
                  <strong>How to use:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    Select keywords that reflect your core values and identity
                  </li>
                  <li>
                    Explore different aspects of your personality and beliefs
                  </li>
                  <li>Write about your goals, dreams, and aspirations</li>
                  <li>Regular practice builds self-awareness and confidence</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Bar */}
      <ProgressBar currentStep={currentStep} totalSteps={2} className="mb-4" />

      {/* Current Step Content */}
      {renderCurrentStep()}
    </div>
  );
}
