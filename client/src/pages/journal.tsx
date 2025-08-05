import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Heart, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import EmotionFace from "@/components/emotion-face";
import BodyMap from "@/components/body-map";
import type { JournalEntry } from "@shared/schema";

export default function Journal() {
  const { toast } = useToast();
  const [selectedEmotion, setSelectedEmotion] = useState<number>(3);
  const [journalContent, setJournalContent] = useState("");
  const [selectedBodyAreas, setSelectedBodyAreas] = useState<string[]>([]);

  // Fetch journal entries
  const { data: journalEntries = [] } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
  });

  // Create journal entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async () => {
      if (!journalContent.trim()) {
        throw new Error("Please write something before saving");
      }

      const response = await apiRequest("POST", "/api/journal-entries", {
        emotionLevel: selectedEmotion,
        emotionType: getEmotionType(selectedEmotion),
        content: journalContent.trim(),
        bodyMapping: selectedBodyAreas.reduce((acc, area) => ({ ...acc, [area]: true }), {}),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      toast({
        title: "Entry Saved",
        description: "Your journal entry has been saved successfully.",
      });
      setJournalContent("");
      setSelectedBodyAreas([]);
      setSelectedEmotion(3);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save journal entry",
        variant: "destructive",
      });
    },
  });

  const getEmotionType = (level: number): string => {
    const types = ["very sad", "sad", "neutral", "happy", "very happy"];
    return types[level - 1] || "neutral";
  };

  const getEmotionLabel = (level: number): string => {
    const labels = ["Very Low", "Low", "Neutral", "Good", "Excellent"];
    return labels[level - 1] || "Neutral";
  };

  const handleBodyAreaSelect = (area: string) => {
    setSelectedBodyAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  return (
    <div className="px-6 space-y-6 pb-20">
      {/* Status Bar */}
      <div className="flex justify-between items-center pt-8 text-stone-400 text-sm">
        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <div className="flex space-x-1">
          <div className="w-4 h-2 bg-stone-300 rounded-sm"></div>
          <div className="w-4 h-2 bg-stone-300 rounded-sm"></div>
          <div className="w-6 h-2 bg-stone-300 rounded-sm"></div>
        </div>
      </div>

      {/* Journal Header */}
      <div className="text-center pt-4">
        <h1 className="text-2xl font-serif font-semibold text-stone-600">Journal</h1>
        <p className="text-stone-400 text-sm mt-1">Express your inner world</p>
      </div>

      {/* Emotion Tracking Section */}
      <Card className="bg-gradient-to-br from-lavender-100 to-lavender-200 rounded-organic stone-shadow border-0">
        <CardContent className="p-6">
          <h3 className="font-serif font-semibold text-stone-600 text-lg mb-4">How are you feeling right now?</h3>
          
          {/* Emotion Scale Grid */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            {[1, 2, 3, 4, 5].map((emotion) => (
              <div key={emotion} className="text-center">
                <EmotionFace
                  emotion={emotion}
                  size="lg"
                  selected={selectedEmotion === emotion}
                  onClick={() => setSelectedEmotion(emotion)}
                />
                <span className="text-xs text-stone-400 mt-1 block">
                  {getEmotionLabel(emotion)}
                </span>
              </div>
            ))}
          </div>

          {/* Body Mapping Feature */}
          <div className="bg-white/80 p-4 rounded-stone relative">
            <h4 className="font-medium text-stone-600 mb-3">Where do you feel it in your body?</h4>
            <BodyMap 
              selectedAreas={selectedBodyAreas}
              onAreaSelect={handleBodyAreaSelect}
            />
            <p className="text-xs text-stone-400 text-center mt-2">
              Tap areas where you feel emotional sensations
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Journal Entry Text Area */}
      <Card className="bg-white rounded-organic stone-shadow border border-stone-100">
        <CardContent className="p-6">
          <label className="block font-medium text-stone-600 mb-3">Share your thoughts...</label>
          <Textarea
            value={journalContent}
            onChange={(e) => setJournalContent(e.target.value)}
            className="w-full h-32 p-4 border border-stone-200 rounded-stone focus:outline-none focus:ring-2 focus:ring-peach-300 focus:border-transparent resize-none"
            placeholder="What's on your mind today? How are you feeling? What happened that made you feel this way?"
            data-testid="journal-textarea"
          />
        </CardContent>
      </Card>

      {/* Save Entry Button */}
      <Button
        onClick={() => createEntryMutation.mutate()}
        disabled={createEntryMutation.isPending || !journalContent.trim()}
        className="w-full bg-gradient-to-r from-sage-300 to-sage-400 text-white py-4 px-6 rounded-organic stone-shadow font-medium hover:from-sage-400 hover:to-sage-500 transition-all"
        data-testid="save-entry-button"
      >
        <Heart className="mr-2 h-4 w-4" />
        {createEntryMutation.isPending ? "Saving..." : "Save Entry"}
      </Button>

      {/* Previous Entries List */}
      <div className="space-y-3">
        <h3 className="font-serif font-semibold text-stone-600 text-lg">Previous Entries</h3>
        {journalEntries.length === 0 ? (
          <Card className="bg-white rounded-stone stone-shadow border border-stone-100">
            <CardContent className="p-4 text-center">
              <p className="text-stone-400 text-sm">No journal entries yet</p>
              <p className="text-stone-400 text-xs mt-1">Create your first entry above</p>
            </CardContent>
          </Card>
        ) : (
          journalEntries.map((entry) => (
            <Card key={entry.id} className="bg-white rounded-stone stone-shadow border border-stone-100 relative">
              <CardContent className="p-4">
                <div className="botanical-accent relative"></div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <EmotionFace emotion={entry.emotionLevel} size="sm" />
                    <div>
                      <p className="text-stone-600 text-sm font-medium">
                        {entry.createdAt.toLocaleDateString()}
                      </p>
                      <p className="text-stone-400 text-xs">
                        {entry.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <button className="text-stone-400 hover:text-stone-600">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-stone-500 text-sm line-clamp-3">
                  {entry.content}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
