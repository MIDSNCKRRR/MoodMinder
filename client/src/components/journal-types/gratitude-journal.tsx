import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GratitudeJournalProps {
  onBack: () => void;
}

export default function GratitudeJournal({ onBack }: GratitudeJournalProps) {
  const { toast } = useToast();
  const [gratitudeItems, setGratitudeItems] = useState<string[]>(["", "", ""]);

  // Create journal entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async () => {
      const filledItems = gratitudeItems.filter(item => item.trim());
      if (filledItems.length === 0) {
        throw new Error("Please write at least one thing you're grateful for");
      }

      const content = filledItems.map((item, index) => `${index + 1}. ${item}`).join('\n');

      const response = await apiRequest("POST", "/api/journal-entries", {
        journalType: "gratitude",
        emotionLevel: 4, // Default to positive emotion for gratitude
        emotionType: "grateful",
        content,
        bodyMapping: {},
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      toast({
        title: "Gratitude Saved",
        description: "Your gratitude entry has been saved successfully.",
      });
      setGratitudeItems(["", "", ""]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save gratitude entry",
        variant: "destructive",
      });
    },
  });

  const updateGratitudeItem = (index: number, value: string) => {
    const newItems = [...gratitudeItems];
    newItems[index] = value;
    setGratitudeItems(newItems);
  };

  const prompts = [
    "What made you smile today?",
    "Who are you thankful for and why?",
    "What moment brought you peace?",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-2">
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
            <h2 className="text-xl font-serif font-semibold text-stone-600">Gratitude Journal</h2>
            <p className="text-stone-400 text-sm">Reflect on what you're thankful for</p>
          </div>
        </div>
      </div>

      {/* Gratitude Prompts */}
      <Card className="bg-gradient-to-br from-sage-100 to-sage-200 rounded-organic stone-shadow border-0">
        <CardContent className="p-6">
          <div className="botanical-accent relative"></div>
          <h3 className="font-serif font-semibold text-stone-600 text-lg mb-4">Three Things I'm Grateful For</h3>
          <p className="text-stone-500 text-sm mb-6">Take a moment to appreciate the good in your life</p>
          
          <div className="space-y-4">
            {gratitudeItems.map((item, index) => (
              <div key={index} className="bg-white/80 p-4 rounded-stone">
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  {prompts[index]}
                </label>
                <Textarea
                  value={item}
                  onChange={(e) => updateGratitudeItem(index, e.target.value)}
                  className="w-full h-20 p-3 border border-stone-200 rounded-stone focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent resize-none text-sm"
                  placeholder="I'm grateful for..."
                  data-testid={`gratitude-item-${index}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Reflection */}
      <Card className="bg-white rounded-organic stone-shadow border border-stone-100">
        <CardContent className="p-6">
          <div className="bg-sage-50 p-4 rounded-stone text-center">
            <Sparkles className="w-8 h-8 text-sage-500 mx-auto mb-2" />
            <p className="text-stone-600 text-sm font-medium">
              "Gratitude makes sense of our past, brings peace for today, and creates a vision for tomorrow."
            </p>
            <p className="text-stone-400 text-xs mt-1">- Melody Beattie</p>
          </div>
        </CardContent>
      </Card>

      {/* Save Entry Button */}
      <Button
        onClick={() => createEntryMutation.mutate()}
        disabled={createEntryMutation.isPending || gratitudeItems.every(item => !item.trim())}
        className="w-full bg-gradient-to-r from-sage-300 to-sage-400 text-white py-4 px-6 rounded-organic stone-shadow font-medium hover:from-sage-400 hover:to-sage-500 transition-all"
        data-testid="save-gratitude-entry-button"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {createEntryMutation.isPending ? "Saving..." : "Save Gratitude Entry"}
      </Button>
    </div>
  );
}