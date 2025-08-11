import { useState, useEffect } from "react";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Step2ReflectionProps {
  content: string;
  onContentChange: (content: string) => void;
  selectedKeywords: string[];
  onComplete: () => void;
  onBack: () => void;
}

export default function Step2Reflection({
  content,
  onContentChange,
  selectedKeywords,
  onComplete,
  onBack,
}: Step2ReflectionProps) {
  const [wordCount, setWordCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-save content
  useEffect(() => {
    localStorage.setItem("identityJournal_content", content);
  }, [content]);

  // Update word count
  useEffect(() => {
    const words = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value);
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await onComplete();
    } finally {
      setIsLoading(false);
    }
  };

  const canSave = content.trim().length > 0;

  const reflectionPrompts = [
    "How do these words reflect who you are today?",
    // "What patterns do you notice in your selected keywords?",
    // "Which of these qualities feel most true to you right now?",
    // "How have these aspects of yourself evolved recently?",
    // "What would you add or change about this list?"
  ];

  return (
    <div className="space-y-6">
      {/* Step Content */}
      <Card
        className="rounded-organic stone-shadow border-0"
        style={{
          background:
            "linear-gradient(135deg, hsl(120, 12%, 91%) 0%, hsl(120, 10%, 83%) 100%)",
        }}
      >
        <CardContent className="p-6">
          <h3 className="font-serif font-semibold text-stone-600 text-xl mb-2 text-center">
            Reflect on your identity
          </h3>
          <p className="text-stone-500 text-sm text-center mb-6">
            Write about what these words mean to you and how they represent who
            you are
          </p>

          {/* Selected Keywords Summary */}
          <div className="mb-6 p-4 bg-white/60 rounded-stone">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-sage-600" />
              <h4 className="text-sm font-medium text-stone-600">
                Your Selected Words ({selectedKeywords.length})
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-3 py-1 bg-sage-200 text-sage-700 rounded-full text-sm font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Reflection Prompts */}
          <div className="mb-6 p-4 bg-white/40 rounded-stone">
            <h4 className="text-sm font-medium text-stone-600 mb-3">
              Reflection Prompts
            </h4>
            <ul className="space-y-2">
              {reflectionPrompts.map((prompt, index) => (
                <li
                  key={index}
                  className="text-sm text-stone-500 flex items-start gap-2"
                >
                  <span className="text-sage-400 mt-0.5">•</span>
                  <span>{prompt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Start writing about your identity and what these words mean to you..."
              className="w-full h-64 p-4 rounded-stone bg-white/80 text-stone-600 placeholder-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent border-0"
              data-testid="reflection-textarea"
            />
            <div className="absolute bottom-3 right-3 text-xs text-stone-400">
              {wordCount} words
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          className="px-6 py-3 rounded-stone font-medium"
          data-testid="back-to-keywords"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button
          onClick={handleComplete}
          disabled={!canSave || isLoading}
          className="px-6 py-3 rounded-stone font-medium transition-all"
          style={{
            background:
              "linear-gradient(to right, hsl(120, 30%, 60%), hsl(120, 35%, 50%))",
            color: "white",
          }}
          data-testid="save-identity-journal"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Entry
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
