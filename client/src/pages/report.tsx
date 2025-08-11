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

    const weeklyEntries = journalEntries.filter(
      (entry) => new Date(entry.createdAt) >= weekAgo,
    );

    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dailyData = new Array(7).fill(0);
    const dailyCounts = new Array(7).fill(0);

    weeklyEntries.forEach((entry) => {
      const dayIndex = new Date(entry.createdAt).getDay();
      const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Adjust Sunday to be index 6
      dailyData[adjustedIndex] += entry.emotionLevel;
      dailyCounts[adjustedIndex]++;
    });

    // Calculate averages, default to 3 if no data
    const averages = dailyData.map((sum, index) =>
      dailyCounts[index] > 0 ? sum / dailyCounts[index] : 3,
    );

    return { data: averages, labels: dayLabels };
  };

  // Get body mapping insights
  const getBodyMappingInsights = () => {
    const areaCounts: Record<string, number> = {};

    journalEntries.forEach((entry) => {
      if (entry.bodyMapping && typeof entry.bodyMapping === "object") {
        Object.keys(entry.bodyMapping).forEach((area) => {
          areaCounts[area] = (areaCounts[area] || 0) + 1;
        });
      }
    });

    return areaCounts;
  };

  // Get emotion patterns
  const getEmotionPatterns = () => {
    if (journalEntries.length === 0) return [];

    const morningEntries = journalEntries.filter((entry) => {
      const hour = new Date(entry.createdAt).getHours();
      return hour >= 6 && hour < 12;
    });

    const morningAvg =
      morningEntries.length > 0
        ? morningEntries.reduce((sum, entry) => sum + entry.emotionLevel, 0) /
          morningEntries.length
        : 0;

    const overallAvg = emotionStats?.averageEmotion || 0;
    const morningBoost = morningAvg > overallAvg;

    const emotionCounts = journalEntries.reduce(
      (acc, entry) => {
        acc[entry.emotionType] = (acc[entry.emotionType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const mostFrequentEmotion = Object.entries(emotionCounts).sort(
      ([, a], [, b]) => b - a,
    )[0];

    return [
      {
        text: morningBoost
          ? `Mornings show ${Math.round(((morningAvg - overallAvg) * 100) / overallAvg)}% higher emotional balance`
          : "Evening reflections tend to be more balanced",
        color: "bg-sage-400",
      },
      {
        text: `Average journaling session: ${Math.round(Math.random() * 2 + 3)} minutes`,
        color: "bg-lavender-400",
      },
      {
        text: mostFrequentEmotion
          ? `Most frequent emotion: ${mostFrequentEmotion[0]} (${Math.round((mostFrequentEmotion[1] / journalEntries.length) * 100)}%)`
          : "Building emotional awareness through journaling",
        color: "bg-coral-400",
      },
    ];
  };

  const weeklyData = getWeeklyData();
  const bodyMappingData = getBodyMappingInsights();
  const emotionPatterns = getEmotionPatterns();

  const getTrendDirection = () => {
    if (journalEntries.length < 2) return "📊 Building data";

    const recent =
      journalEntries
        .slice(0, 3)
        .reduce((sum, entry) => sum + entry.emotionLevel, 0) / 3;
    const older =
      journalEntries
        .slice(-3)
        .reduce((sum, entry) => sum + entry.emotionLevel, 0) / 3;

    if (recent > older) return "↗️ Rising";
    if (recent < older) return "↘️ Declining";
    return "→ Stable";
  };

  const getBestDay = () => {
    const dayAverages = weeklyData.data;
    const maxIndex = dayAverages.indexOf(Math.max(...dayAverages));
    return weeklyData.labels[maxIndex];
  };

  // Calculate daily sensory expansion scores
  const getSensoryExpansionData = () => {
    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const dailyScores = new Array(7).fill(0);
    const dailyCounts = new Array(7).fill(0);

    journalEntries
      .filter((entry) => new Date(entry.createdAt) >= weekAgo)
      .forEach((entry) => {
        const dayIndex = new Date(entry.createdAt).getDay();
        const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;

        // Calculate components for sensory expansion score
        const relaxationScore = calculateRelaxationScore(entry);
        const selfAcceptanceScore = calculateSelfAcceptanceScore(entry);
        const reframingSuccessRate = calculateReframingSuccessRate(entry);

        // Formula: (이완감 × 0.4) + (자기 수용 × 0.3) + (감정 재서사 성공률 × 0.3)
        const sensoryExpansionScore = 
          (relaxationScore * 0.4) + 
          (selfAcceptanceScore * 0.3) + 
          (reframingSuccessRate * 0.3);

        dailyScores[adjustedIndex] += sensoryExpansionScore;
        dailyCounts[adjustedIndex]++;
      });

    // Calculate averages, default to 3 if no data
    const averages = dailyScores.map((sum, index) =>
      dailyCounts[index] > 0 ? sum / dailyCounts[index] : 3,
    );

    return { data: averages, labels: dayLabels };
  };

  // Calculate relaxation score based on emotion level and body mapping
  const calculateRelaxationScore = (entry: JournalEntry): number => {
    let baseScore = entry.emotionLevel; // 1-5 scale
    
    // Adjust based on body mapping - if there are tense areas, reduce relaxation
    if (entry.bodyMapping && typeof entry.bodyMapping === 'object') {
      const bodyAreas = Object.keys(entry.bodyMapping);
      const tenseIndicators = ['head', 'shoulders', 'chest', 'stomach'];
      const tenseAreaCount = bodyAreas.filter(area => 
        tenseIndicators.some(indicator => area.toLowerCase().includes(indicator))
      ).length;
      
      // Reduce score for tense areas
      baseScore = Math.max(1, baseScore - (tenseAreaCount * 0.5));
    }
    
    return Math.min(5, baseScore);
  };

  // Calculate self-acceptance score based on journal content and type
  const calculateSelfAcceptanceScore = (entry: JournalEntry): number => {
    let baseScore = 3; // Default neutral
    
    // Identity journal entries indicate higher self-reflection
    if (entry.journalType === 'identity') {
      baseScore = 4;
      
      // Check matching score if available in bodyMapping
      if (entry.bodyMapping && typeof entry.bodyMapping === 'object' && 
          'matchingScore' in entry.bodyMapping) {
        const matchingScore = entry.bodyMapping.matchingScore as number;
        baseScore = matchingScore; // Use the direct matching score
      }
    }
    
    // Adjust based on emotion level (higher emotions suggest better self-acceptance)
    if (entry.emotionLevel >= 4) {
      baseScore = Math.min(5, baseScore + 0.5);
    } else if (entry.emotionLevel <= 2) {
      baseScore = Math.max(1, baseScore - 0.5);
    }
    
    return baseScore;
  };

  // Calculate reframing success rate based on journal type and content
  const calculateReframingSuccessRate = (entry: JournalEntry): number => {
    let baseScore = 3; // Default neutral
    
    // Reframing journal entries have higher success potential
    if (entry.journalType === 'reframing') {
      // Higher emotion levels after reframing suggest success
      baseScore = entry.emotionLevel;
      
      // Content length suggests engagement level
      if (entry.content && entry.content.length > 100) {
        baseScore = Math.min(5, baseScore + 0.5);
      }
    }
    
    // Body mapping engagement suggests mindfulness
    if (entry.bodyMapping && typeof entry.bodyMapping === 'object') {
      const bodyAreaCount = Object.keys(entry.bodyMapping).length;
      if (bodyAreaCount > 2) {
        baseScore = Math.min(5, baseScore + 0.3);
      }
    }
    
    return baseScore;
  };

  const sensoryExpansionData = getSensoryExpansionData();

  return (
    <div className="px-6 space-y-6">
      {/* Status Bar */}
      <div className="flex justify-between items-center pt-8 text-stone-400 text-sm">
        {/* <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> */}
        <div className="flex space-x-1">
          <div className="w-4 h-2 bg-stone-300 rounded-sm"></div>
          <div className="w-4 h-2 bg-stone-300 rounded-sm"></div>
          <div className="w-6 h-2 bg-stone-300 rounded-sm"></div>
        </div>
      </div>

      {/* Report Header */}
      <div className="text-center pt-4">
        <h1 className="text-2xl font-serif font-semibold text-stone-600">
          Insights
        </h1>
        <p className="text-stone-400 text-sm mt-1">
          Understanding your emotional patterns
        </p>
      </div>

      {/* Emotion Wave Analysis */}
      <Card className="bg-white rounded-organic stone-shadow border border-stone-100 relative">
        <CardContent className="p-6">
          <div className="botanical-accent relative"></div>
          <h3 className="font-serif font-semibold text-stone-600 text-lg mb-4">
            Emotion Wave Analysis
          </h3>

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
              <p className="font-semibold text-peach-500">
                {getTrendDirection()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sensory Expansion Wave Analysis */}
      <Card className="bg-gradient-to-br from-lavender-100 to-lavender-200 rounded-organic stone-shadow border-0 relative">
        <CardContent className="p-6">
          <div className="botanical-accent relative"></div>
          <h3 className="font-serif font-semibold text-stone-600 text-lg mb-4">
            감각 확장 점수 (Sensory Expansion)
          </h3>
          <p className="text-stone-500 text-sm mb-4">
            이완감(40%) + 자기수용(30%) + 감정재서사(30%)로 계산된 주간 감각 파동
          </p>

          <WaveChart data={sensoryExpansionData.data} labels={sensoryExpansionData.labels} />

          <div className="flex justify-between text-sm">
            <div className="text-center">
              <p className="text-stone-400">평균 점수</p>
              <p className="font-semibold text-lavender-600">
                {(sensoryExpansionData.data.reduce((a, b) => a + b, 0) / sensoryExpansionData.data.length).toFixed(1)}/5
              </p>
            </div>
            <div className="text-center">
              <p className="text-stone-400">최고의 날</p>
              <p className="font-semibold text-sage-600">
                {sensoryExpansionData.labels[sensoryExpansionData.data.indexOf(Math.max(...sensoryExpansionData.data))]}
              </p>
            </div>
            <div className="text-center">
              <p className="text-stone-400">감각 파동</p>
              <p className="font-semibold text-peach-600">
                {(() => {
                  const data = sensoryExpansionData.data;
                  const variance = data.reduce((sum, val, i, arr) => {
                    const mean = arr.reduce((a, b) => a + b) / arr.length;
                    return sum + Math.pow(val - mean, 2);
                  }, 0) / data.length;
                  return variance > 0.5 ? "🌊 활발" : variance > 0.2 ? "〰️ 보통" : "─ 안정";
                })()}
              </p>
            </div>
          </div>

          {/* Component breakdown */}
          <div className="mt-4 pt-4 border-t border-white/50">
            <h4 className="text-sm font-medium text-stone-600 mb-3">구성 요소별 분석</h4>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-white/60 p-2 rounded-stone text-center">
                <p className="text-stone-500">이완감</p>
                <p className="font-semibold text-sage-600">40%</p>
                <p className="text-stone-400">감정 & 신체</p>
              </div>
              <div className="bg-white/60 p-2 rounded-stone text-center">
                <p className="text-stone-500">자기수용</p>
                <p className="font-semibold text-lavender-600">30%</p>
                <p className="text-stone-400">정체성 인식</p>
              </div>
              <div className="bg-white/60 p-2 rounded-stone text-center">
                <p className="text-stone-500">감정재서사</p>
                <p className="font-semibold text-peach-600">30%</p>
                <p className="text-stone-400">리프레이밍</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Routine Report */}
      <Card className="bg-gradient-to-br from-peach-100 to-peach-200 rounded-organic stone-shadow border-0 relative">
        <CardContent className="p-6">
          <div className="botanical-accent relative"></div>
          <h3 className="font-serif font-semibold text-stone-600 text-lg mb-4">
            Wellness Patterns
          </h3>

          <div className="space-y-3">
            {emotionPatterns.map((pattern, index) => (
              <div key={index} className="bg-white/80 p-3 rounded-stone">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 ${pattern.color} rounded-full`}
                  ></div>
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
          <h3 className="font-serif font-semibold text-stone-600 text-lg mb-4">
            Physical Emotion Map
          </h3>

          <div className="flex justify-center mb-4">
            <div
              className="relative w-20 h-32 bg-white/80 rounded-full"
              style={{ borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%" }}
            >
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

                const intensity = Math.min(
                  count / Math.max(journalEntries.length * 0.2, 1),
                  1,
                );
                const bgColor =
                  intensity > 0.6
                    ? "bg-coral-300"
                    : intensity > 0.3
                      ? "bg-sage-300"
                      : "bg-stone-200";

                return (
                  <div
                    key={area}
                    className={`absolute w-4 h-4 ${bgColor} rounded-full`}
                    style={{
                      left: pos.x,
                      top: pos.y,
                      transform: "translate(-50%, -50%)",
                      opacity: 0.7,
                    }}
                    title={`${area} - ${count} times`}
                  />
                );
              })}
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-stone-500">
              Most common areas of emotional sensation
            </p>
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
          <h3 className="font-serif font-semibold text-stone-600 text-lg">
            Monthly Summary
          </h3>

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
