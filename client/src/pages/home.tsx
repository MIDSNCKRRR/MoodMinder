import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AlertTriangle, Flower2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import EmotionFace from "@/components/emotion-face";
import type { JournalEntry, DailyReflection } from "@shared/schema";
import logoImage from "@/assets/image/logo.png";

export default function Home() {
  const { toast } = useToast();
  const [selectedEmotion, setSelectedEmotion] = useState<number | null>(null);

  // Fetch recent journal entries
  const { data: journalEntries = [] } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
  });

  // Fetch today's reflection
  const { data: todayReflection } = useQuery<DailyReflection | null>({
    queryKey: ["/api/daily-reflections/today"],
  });


  // Quick emotion logging
  const emotionMutation = useMutation({
    mutationFn: async (emotionLevel: number) => {
      const response = await apiRequest("POST", "/api/journal-entries", {
        emotionLevel,
        emotionType: getEmotionType(emotionLevel),
        content: `Quick emotion check: ${getEmotionType(emotionLevel)}`,
        bodyMapping: {},
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      toast({
        title: "Emotion Logged",
        description: "Your feelings have been recorded.",
      });
      setSelectedEmotion(null);
    },
  });

  const getEmotionType = (level: number): string => {
    const types = ["very sad", "sad", "neutral", "happy", "very happy"];
    return types[level - 1] || "neutral";
  };

  const recentEntries = journalEntries.slice(0, 3);

  return (
    <div className="px-6 space-y-8 pb-8">
      {/* Status Bar */}
      <div className="flex justify-between items-center pt-8 text-stone-400 text-sm">
        {/* <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> */}
        <div className="flex space-x-1">
          <div className="w-4 h-2 bg-stone-300 rounded-sm"></div>
          <div className="w-4 h-2 bg-stone-300 rounded-sm"></div>
          <div className="w-6 h-2 bg-stone-300 rounded-sm"></div>
        </div>
      </div>

      {/* Header with App Icon */}
      <div className="text-center pt-4">
        {/* <div className="logo w-16 h-16 mx-auto mb-4  bg-gradient-to-br from-stone-100 to-stone-200 stone-shadow flex items-center justify-center relative"> */}
          <div className="logo w-20 h-20 mx-auto mb-0  bg-gradient-to-br flex items-center justify-center relative">
          <img 
            src={logoImage} 
            alt="Soft Moves Logo" 
            className="w-24 h-24 object-contain" 
            loading="eager"
          />
        </div>
        <h1 className="text-2xl font-serif font-semibold text-stone-600">
          Soft Moves
        </h1>
        <p className="text-stone-400 text-sm mt-1">
          Your emotional wellness companion
        </p>
      </div>

      {/* Crisis Support Button */}
      <div className="relative">
        <Link href="/crisis-support">
          <Button
            className="crisis-button w-full py-12 px-18 rounded-organic stone-shadow transition-all duration-300 font-medium border-2 text-xl"
            style={{
              backgroundColor: "hsl(260, 25%, 65%)",
              // backgroundColor: "linear-gradient(135deg,hsl(260, 25%, 25%) 0%, hsl(260, 20%, 78%) 100%)",
              // backgroundColor: "linear-gradienthsl(260, 45%, 65%)",
              // borderColor: "hsl(260, 45%, 65%)",
              color: "white",
            }}
            data-testid="crisis-button"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            NEED IMMEDIATE SUPPORT
          </Button>
        </Link>
      </div>


      {/* Today's Question Card */}
      <Card
        className="rounded-organic stone-shadow border-0 relative"
        style={{
          background:
            "linear-gradient(135deg, hsl(25, 35%, 85%) 0%, hsl(25, 30%, 78%) 100%)",
            // "linear-gradient(135deg, hsl(260, 25%, 85%) 0%, hsl(260, 20%, 78%) 100%)",
        }}
      >
        <CardContent className="p-8">
          <div className="botanical-accent relative"></div>
          <h3 className="font-serif font-semibold text-stone-600 text-3xl mb-6">
            Today's Reflection
          </h3>
          <p className="text-stone-500 text-xl mb-8">
            {todayReflection?.question ||
              "What three things brought you peace today?"}
          </p>
          <Link href="/journal?type=reframing">
            <Button
              variant="secondary"
              className="bg-white/80 text-stone-600 hover:bg-white transition-colors rounded-full text-xl py-5 px-10"
              data-testid="reflect-now-button"
            >
              {todayReflection?.answer ? "Update Reflection" : "Reflect Now"}
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Quick Emotion Check
      <Card
        className="rounded-organic stone-shadow border-0 relative"
        style={{
          background:
            "linear-gradient(135deg, hsl(260, 40%, 91%) 0%, hsl(260, 35%, 84%) 100%)",
        }}
      >
        <CardContent className="p-6">
          <div className="botanical-accent relative"></div>
          <h3 className="font-serif font-semibold text-stone-600 text-lg mb-3">
            How are you feeling?
          </h3>
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4, 5].map((emotion) => (
              <EmotionFace
                key={emotion}
                emotion={emotion}
                size="lg"
                selected={selectedEmotion === emotion}
                onClick={() => {
                  setSelectedEmotion(emotion);
                  emotionMutation.mutate(emotion);
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card> */}

      {/* Mindfulness Moment 
      <Card
        className="rounded-organic stone-shadow border-0 relative"
        style={{
          background:
            "linear-gradient(135deg, hsl(120, 10%, 83%) 0%, hsl(120, 8%, 72%) 100%)",
        }}
      >
        <CardContent className="p-6">
          <div className="botanical-accent relative"></div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
              <Flower2 className="text-sage-500 w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif font-semibold text-stone-600">
                Mindful Breathing
              </h3>
              <p className="text-stone-500 text-sm">5-minute guided session</p>
            </div>
            <Button
              variant="secondary"
              className="bg-white/80 text-sage-600 hover:bg-white transition-colors rounded-full px-4 py-2"
              data-testid="start-breathing-button"
            >
              Start
            </Button>
          </div>
        </CardContent>
      </Card>
*/}
      {/* Recent Journal Entries Preview */}
      {/* <div className="space-y-3">
        <h3 className="font-serif font-semibold text-stone-600 text-lg">
          Recent Entries
        </h3>
        {recentEntries.length === 0 ? (
          <Card className="bg-white rounded-stone stone-shadow border border-stone-100">
            <CardContent className="p-4 text-center">
              <p className="text-stone-400 text-sm">No journal entries yet</p>
              <Link href="/journal">
                <Button variant="link" className="text-peach-500 mt-2">
                  Create your first entry
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          recentEntries.map((entry) => (
            <Card
              key={entry.id}
              className="bg-white rounded-stone stone-shadow border border-stone-100 relative"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-stone-600 text-sm font-medium">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-stone-500 text-sm mt-1 line-clamp-2">
                      {entry.content.substring(0, 50)}...
                    </p>
                  </div>
                  <EmotionFace emotion={entry.emotionLevel} size="sm" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div> */}
    </div>
  );
}
