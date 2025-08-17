import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import ProgressBar from "./progress-bar";
import Step1Keywords from "./step-1-keywords";
import Step2Reflection from "./step-2-reflection";
import { memeGenerationService } from "@/services/meme-generation";

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
  const [matchingScore, setMatchingScore] = useState<number>(3);
  const [isGeneratingMeme, setIsGeneratingMeme] = useState(false);
  const { toast } = useToast();

  // Load saved data on component mount
  useEffect(() => {
    const savedKeywords = localStorage.getItem("identityJournal_keywords");
    const savedContent = localStorage.getItem("identityJournal_content");
    const savedScore = localStorage.getItem("identityJournal_matchingScore");

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
    if (savedScore) {
      setMatchingScore(parseInt(savedScore));
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
      setIsGeneratingMeme(true);
      
      // Fetch today's journal entries to get daily data
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      let dailyJournalData = {};
      
      try {
        const response = await fetch("/api/journal-entries");
        if (response.ok) {
          const allEntries = await response.json();
          const todayEntries = allEntries.filter((entry: any) => {
            const entryDate = new Date(entry.createdAt);
            return entryDate >= todayStart;
          });
          
          // Extract body journal data
          const bodyEntry = todayEntries.find((entry: any) => entry.journalType === "body");
          if (bodyEntry) {
            dailyJournalData.bodyJournal = {
              emotionLevel: bodyEntry.emotionLevel,
              bodyFeelings: bodyEntry.bodyMapping?.feelings ? Object.keys(bodyEntry.bodyMapping.feelings) : [],
              content: bodyEntry.content
            };
          }
          
          // Extract reframing journal data
          const reframingEntry = todayEntries.find((entry: any) => entry.journalType === "reframing");
          if (reframingEntry) {
            dailyJournalData.reframingJournal = {
              content: reframingEntry.content,
              hasReframing: reframingEntry.content?.includes("=== 리프레이밍 결과 ===") || false
            };
          }
        }
      } catch (fetchError) {
        console.warn("Could not fetch daily journal data:", fetchError);
      }
      
      // Generate meme with daily journal context
      const memeResponse = await memeGenerationService.generateMeme({
        keywords: selectedKeywords,
        reflection: reflectionContent,
        matchingScore: matchingScore,
        dailyJournalData
      });

      if (!memeResponse.success) {
        toast({
          title: "밈 생성 실패",
          description: memeResponse.error || "밈 생성 중 오류가 발생했습니다.",
          variant: "destructive",
        });
        return;
      }

      // Prepare journal entry data with meme
      const journalData = {
        userId: "temp-user", // This will be replaced with actual user ID when auth is implemented
        journalType: "identity" as const,
        emotionLevel: 3, // Default neutral for identity journal
        emotionType: "reflective",
        content: reflectionContent,
        bodyMapping: {
          keywords: selectedKeywords,
          keywordCount: selectedKeywords.length,
          matchingScore: matchingScore,
          memeUrl: memeResponse.memeUrl,
          memeDescription: memeResponse.description,
          timestamp: new Date().toISOString(),
          // Store related journal data for meme context
          dailyJournalContext: dailyJournalData,
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

      // Invalidate queries to refresh insights page data
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });

      toast({
        title: "저장 완료",
        description: "정체성 저널이 저장되었습니다! 3개의 저널을 모두 완료하면 개인 밈을 확인할 수 있습니다.",
      });

      // Clear localStorage
      localStorage.removeItem("identityJournal_keywords");
      localStorage.removeItem("identityJournal_content");
      localStorage.removeItem("identityJournal_matchingScore");

      // Reset form and go back to journal types
      setCurrentStep(1);
      setSelectedKeywords([]);
      setReflectionContent("");
      setMatchingScore(3);
      onBack();
    } catch (error) {
      console.error("Error saving identity journal entry:", error);
      toast({
        title: "저장 실패",
        description: "저장 중 오류가 발생했습니다. 다시 시도해 주세요.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMeme(false);
    }
  };

  // Memoize handlers to prevent re-renders
  const handleKeywordsChange = useCallback((keywords: string[]) => {
    setSelectedKeywords(keywords);
    localStorage.setItem("identityJournal_keywords", JSON.stringify(keywords));
  }, []);

  const handleMatchingScoreChange = useCallback((score: number) => {
    setMatchingScore(score);
    localStorage.setItem("identityJournal_matchingScore", score.toString());
  }, []);

  const handleContentChange = useCallback((content: string) => {
    setReflectionContent(content);
    localStorage.setItem("identityJournal_content", content);
  }, []);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Keywords
            selectedKeywords={selectedKeywords}
            onKeywordsChange={handleKeywordsChange}
            onNext={handleNext}
            matchingScore={matchingScore}
            onMatchingScoreChange={handleMatchingScoreChange}
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
            isGeneratingMeme={isGeneratingMeme}
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
