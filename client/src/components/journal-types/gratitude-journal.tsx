import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, ArrowLeft, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface IdentityJournalProps {
  onBack: () => void;
}

export default function IdentityJournal({ onBack }: IdentityJournalProps) {
  const { toast } = useToast();
  const [identityReflections, setIdentityReflections] = useState<string[]>(["", "", ""]);
  const [showInfo, setShowInfo] = useState(false);

  // Create journal entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async () => {
      const filledReflections = identityReflections.filter(item => item.trim());
      if (filledReflections.length === 0) {
        throw new Error("Please write at least one identity reflection");
      }

      const content = prompts.map((prompt, index) => {
        if (identityReflections[index].trim()) {
          return `${prompt}\n${identityReflections[index]}\n`;
        }
        return '';
      }).filter(Boolean).join('\n');

      const response = await apiRequest("POST", "/api/journal-entries", {
        journalType: "gratitude",
        emotionLevel: 4, // Default to positive emotion for identity work
        emotionType: "confident",
        content,
        bodyMapping: {},
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      toast({
        title: "Identity Reflection Saved",
        description: "Your identity reflection has been saved successfully.",
      });
      setIdentityReflections(["", "", ""]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save identity reflection",
        variant: "destructive",
      });
    },
  });

  const updateIdentityReflection = (index: number, value: string) => {
    const newItems = [...identityReflections];
    newItems[index] = value;
    setIdentityReflections(newItems);
  };

  const prompts = [
    "What values are most important to you?",
    "What aspects of yourself are you most proud of?",
    "What goals or dreams feel most authentic to who you are?",
  ];

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
          <h2 className="text-xl font-serif font-semibold text-stone-600">Identity Journal</h2>
          <p className="text-stone-400 text-sm">Explore your values and sense of self</p>
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
          style={{ background: 'linear-gradient(135deg, hsl(260, 45%, 96%) 0%, hsl(260, 40%, 91%) 100%)' }}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-serif font-semibold text-stone-600 text-lg">About Identity Journal</h3>
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
              <p>The Identity Journal helps you explore your values, beliefs, and authentic sense of self.</p>
              <div className="space-y-2">
                <p><strong>How to use:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Reflect on your core values and what matters most to you</li>
                  <li>Explore different aspects of your identity and personality</li>
                  <li>Write about your goals, dreams, and aspirations</li>
                  <li>Regular practice builds self-awareness and confidence</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Identity Reflection Prompts */}
      <Card className="rounded-organic stone-shadow border-0"
            style={{ background: "linear-gradient(135deg, hsl(120, 12%, 91%) 0%, hsl(120, 10%, 83%) 100%)" }}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {identityReflections.map((item, index) => (
              <div key={index} style={{ background: "rgba(255, 255, 255, 0.8)" }} className="p-4 rounded-lg">
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  {prompts[index]}
                </label>
                <Textarea
                  value={item}
                  onChange={(e) => updateIdentityReflection(index, e.target.value)}
                  className="w-full h-20 p-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent resize-none text-sm"
                  placeholder="Reflect on yourself..."
                  data-testid={`identity-item-${index}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Entry Button */}
      <Button
        onClick={() => createEntryMutation.mutate()}
        disabled={createEntryMutation.isPending || identityReflections.every(item => !item.trim())}
        className="w-full py-4 px-6 rounded-lg font-medium transition-all"
        style={{ 
          background: "linear-gradient(to right, hsl(120, 25%, 65%), hsl(120, 30%, 55%))",
          color: "white"
        }}
        data-testid="save-identity-entry-button"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {createEntryMutation.isPending ? "Saving..." : "Save Identity Entry"}
      </Button>
    </div>
  );
}