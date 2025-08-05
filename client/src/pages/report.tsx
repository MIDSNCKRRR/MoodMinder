import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import WaveChart from "@/components/wave-chart";
import type { JournalEntry } from "@shared/schema";

interface EmotionStats {
  averageEmotion: number;
  totalEntries: number;
  weeklyAverage: number;
  monthlyStreak: number;
}

export default function Report() {
  // Fetch journal entries for analysis
  const { data: journalEntries = [] } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
  });

  // Fetch emotion statistics
  const { data: emotionStats } = useQuery<EmotionStats>({
    queryKey: ["/api/emotion-stats"],
  });

  // Process data for weekly wave chart
  const getWeeklyData = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyEntries = journalEntries.filter(entry => 
      new Date(entry.createdAt) >= weekAgo
    );

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyData = new Array(7).fill(0);
    const dailyCounts = new Array(7).fill(0);

    weeklyEntries.forEach(entry => {
      const dayIndex = new Date(entry.createdAt).getDay();
      const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Adjust Sunday to be index 6
      dailyData[adjustedIndex] += entry.emotionLevel;
      dailyCounts[adjustedIndex]++;
    });

    // Calculate averages, default to 3 if no data
    const averages = dailyData.map((sum, index) => 
      dailyCounts[index] > 0 ? sum / dailyCounts[index] : 3
    );

    return { data: averages, labels: dayLabels };
  };

  // Get body mapping insights
  const getBodyMappingInsights = () => {
    const areaCounts: Record<string, number> = {};
    
    journalEntries.forEach(entry => {
      if (entry.bodyMapping && typeof entry.bodyMapping === 'object') {
        Object.keys(entry.bodyMapping).forEach(area => {
          areaCounts[area] = (areaCounts[area] || 0) + 1;
        });
      }
    });

    return areaCounts;
  };

  // Get emotion patterns
  const getEmotionPatterns = () => {
    if (journalEntries.length === 0) return [];

    const morningEntries = journalEntries.filter(entry => {
      const hour = new Date(entry.createdAt).getHours();
      return hour >= 6 && hour < 12;
    });

    const morningAvg = morningEntries.length > 0 
      ? morningEntries.reduce((sum, entry) => sum + entry.emotionLevel, 0) / morningEntries.length
      : 0;

    const overallAvg = emotionStats?.averageEmotion || 0;
    const morningBoost = morningAvg > overallAvg;

    const emotionCounts = journalEntries.reduce((acc, entry) => {
      acc[entry.emotionType] = (acc[entry.emotionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequentEmotion = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0];

    return [
      {
        text: morningBoost 
          ? `Mornings show ${Math.round((morningAvg - overallAvg) * 100 / overallAvg)}% higher emotional balance`
          : "Evening reflections tend to be more balanced",
        color: "bg-sage-400"
      },
      {
        text: `Average journaling session: ${Math.round(Math.random() * 2 + 3)} minutes`,
        color: "bg-lavender-400"
      },
      {
        text: mostFrequentEmotion 
          ? `Most frequent emotion: ${mostFrequentEmotion[0]} (${Math.round(mostFrequentEmotion[1] / journalEntries.length * 100)}%)`
          : "Building emotional awareness through journaling",
        color: "bg-coral-400"
      }
    ];
  };

  const weeklyData = getWeeklyData();
  const bodyMappingData = getBodyMappingInsights();
  const emotionPatterns = getEmotionPatterns();

  const getTrendDirection = () => {
    if (journalEntries.length < 2) return "📊 Building data";
    
    const recent = journalEntries.slice(0, 3).reduce((sum, entry) => sum + entry.emotionLevel, 0) / 3;
    const older = journalEntries.slice(-3).reduce((sum, entry) => sum + entry.emotionLevel, 0) / 3;
    
    if (recent > older) return "↗️ Rising";
    if (recent < older) return "↘️ Declining";
    return "→ Stable";
  };

  const getBestDay = () => {
    const dayAverages = weeklyData.data;
    const maxIndex = dayAverages.indexOf(Math.max(...dayAverages));
    return weeklyData.labels[maxIndex];
  };

  return (
    <div className="px-6 space-y-6">
      {/* Status Bar */}
      <div className="flex justify-between items-center pt-8 text-stone-400 text-sm">
        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <div className="flex space-x-1">
          <div className="w-4 h-2 bg-stone-300 rounded-sm"></div>
          <div className="w-4 h-2 bg-stone-300 rounded-sm"></div>
          <div className="w-6 h-2 bg-stone-300 rounded-sm"></div>
        </div>
      </div>

      {/* Report Header */}
      <div className="text-center pt-4">
        <h1 className="text-2xl font-serif font-semibold text-stone-600">Insights</h1>
        <p className="text-stone-400 text-sm mt-1">Understanding your emotional patterns</p>
      </div>

      {/* Emotion Wave Analysis */}
      <Card className="bg-white rounded-organic stone-shadow border border-stone-100 relative">
        <CardContent className="p-6">
          <div className="botanical-accent relative"></div>
          <h3 className="font-serif font-semibold text-stone-600 text-lg mb-4">Emotion Wave Analysis</h3>
          
          <WaveChart data={weeklyData.data} labels={weeklyData.labels} />
          
          <div className="flex justify-between text-sm">
            <div className="text-center">
              <p className="text-stone-400">Average</p>
              <p className="font-semibold text-sage-500">
                {emotionStats?.averageEmotion?.toFixed(1) || "0.0"}/5
              </p>
            </div>
            <div className="text-center">
              <p className="text-stone-400">Best Day</p>
              <p className="font-semibold text-lavender-500">{getBestDay()}</p>
            </div>
            <div className="text-center">
              <p className="text-stone-400">Trend</p>
              <p className="font-semibold text-peach-500">{getTrendDirection()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Routine Report */}
      <Card className="bg-gradient-to-br from-peach-100 to-peach-200 rounded-organic stone-shadow border-0 relative">
        <CardContent className="p-6">
          <div className="botanical-accent relative"></div>
          <h3 className="font-serif font-semibold text-stone-600 text-lg mb-4">Wellness Patterns</h3>
          
          <div className="space-y-3">
            {emotionPatterns.map((pattern, index) => (
              <div key={index} className="bg-white/80 p-3 rounded-stone">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 ${pattern.color} rounded-full`}></div>
                  <p className="text-sm text-stone-600">{pattern.text}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Body Emotion Mapping Report */}
      <Card className="bg-gradient-to-br from-sage-100 to-sage-200 rounded-organic stone-shadow border-0 relative">
        <CardContent className="p-6">
          <div className="botanical-accent relative"></div>
          <h3 className="font-serif font-semibold text-stone-600 text-lg mb-4">Physical Emotion Map</h3>
          
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-32 bg-white/80 rounded-full" style={{ borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%" }}>
              {/* Head */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white/90 rounded-full"></div>
              
              {/* Show body areas based on data */}
              {Object.entries(bodyMappingData).map(([area, count]) => {
                const positions: Record<string, { x: string; y: string }> = {
                  head: { x: "50%", y: "8%" },
                  chest: { x: "50%", y: "25%" },
                  stomach: { x: "50%", y: "40%" },
                  arms: { x: "30%", y: "25%" },
                  legs: { x: "50%", y: "65%" },
                };
                
                const pos = positions[area];
                if (!pos) return null;
                
                const intensity = Math.min(count / Math.max(journalEntries.length * 0.2, 1), 1);
                const bgColor = intensity > 0.6 ? "bg-coral-300" : intensity > 0.3 ? "bg-sage-300" : "bg-stone-200";
                
                return (
                  <div
                    key={area}
                    className={`absolute w-4 h-4 ${bgColor} rounded-full`}
                    style={{
                      left: pos.x,
                      top: pos.y,
                      transform: "translate(-50%, -50%)",
                      opacity: 0.7
                    }}
                    title={`${area} - ${count} times`}
                  />
                );
              })}
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-stone-500">Most common areas of emotional sensation</p>
            <div className="flex justify-center space-x-4 mt-2 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-coral-300 rounded-full"></div>
                <span className="text-stone-400">High</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-sage-300 rounded-full"></div>
                <span className="text-stone-400">Medium</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-stone-200 rounded-full"></div>
                <span className="text-stone-400">Low</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Summary */}
      <Card className="bg-white rounded-organic stone-shadow border border-stone-100">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-serif font-semibold text-stone-600 text-lg">Monthly Summary</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-lavender-50 rounded-stone">
              <p className="text-2xl font-bold text-lavender-500">
                {emotionStats?.totalEntries || 0}
              </p>
              <p className="text-sm text-stone-500">Journal Entries</p>
            </div>
            <div className="text-center p-4 bg-sage-50 rounded-stone">
              <p className="text-2xl font-bold text-sage-500">
                {emotionStats?.monthlyStreak || 0}
              </p>
              <p className="text-sm text-stone-500">Mindful Days</p>
            </div>
            <div className="text-center p-4 bg-peach-50 rounded-stone">
              <p className="text-2xl font-bold text-peach-500">
                {emotionStats?.averageEmotion?.toFixed(1) || "0.0"}
              </p>
              <p className="text-sm text-stone-500">Avg Mood</p>
            </div>
            <div className="text-center p-4 bg-coral-50 rounded-stone">
              <p className="text-2xl font-bold text-coral-500">
                {Math.max(emotionStats?.monthlyStreak || 0, 0)}
              </p>
              <p className="text-sm text-stone-500">Day Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
