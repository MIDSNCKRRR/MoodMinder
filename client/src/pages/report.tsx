import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Download, Share2, Twitter, Instagram, Eye, Gift, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WaveChart from "@/components/wave-chart";
import SensoryScoreChart from "@/components/sensory-score-chart";
import { socialSharingService } from "@/services/social-sharing";
import type { JournalEntry } from "@shared/schema";

interface EmotionStats {
  averageEmotion: number;
  totalEntries: number;
  weeklyAverage: number;
  monthlyStreak: number;
}

interface ChartData {
  data: number[];
  labels: string[];
}

interface EmotionPattern {
  text: string;
  color: string;
}

interface RoutineExecutionData {
  redButtonExecutions: {
    totalClicks: number;
    weeklyData: number[];
    labels: string[];
  };
  effectivenessRate: {
    totalResponses: number;
    positiveResponses: number;
    rate: number;
    weeklyRates: number[];
  };
}

interface RecoveryTendency {
  grade: string;
  gradeText: string;
  color: string;
  sensoryScore: number;
  interpretation: string;
  suggestions: string[];
  isRecoveryDetected: boolean;
  detectionDate: string;
  summary: string;
  // Decline detection fields
  declineDetected?: boolean;
  declineType?: string | null;
  declineResponse?: {
    cause: string;
    primaryResponse: string;
    secondaryResponse: string;
  } | null;
  historicalData?: {
    currentWeekAvg: number;
    previousWeekAvg: number;
    twoWeeksAvg: number;
    recent3DaysScores: number[];
    recent14DaysChange: number;
    volatility: number;
  };
}

export default function Report() {
  const { toast } = useToast();
  
  // State for meme reveal game mechanics
  const [revealedMemes, setRevealedMemes] = useState<Set<string>>(new Set());
  const [celebrationMode, setCelebrationMode] = useState(false);
  
  // Fetch journal entries to check for memes and reframing completion
  const { data: journalEntries = [] } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
  });

  // Fetch analytics data from new endpoints
  const { data: weeklyEmotionData } = useQuery<ChartData>({
    queryKey: ["/api/weekly-emotion-data"],
  });

  const { data: sensoryExpansionData } = useQuery<ChartData>({
    queryKey: ["/api/sensory-expansion-data"], 
  });

  const { data: emotionStats } = useQuery<EmotionStats>({
    queryKey: ["/api/emotion-stats"],
  });

  const { data: bodyMappingData } = useQuery<Record<string, number>>({
    queryKey: ["/api/body-mapping-insights"],
  });

  const { data: emotionPatterns = [] } = useQuery<EmotionPattern[]>({
    queryKey: ["/api/emotion-patterns"],
  });

  const { data: routineExecutionData } = useQuery<RoutineExecutionData>({
    queryKey: ["/api/routine-execution-data"],
  });

  const { data: selfAcceptanceData } = useQuery<ChartData & { averageScore: number; trend: string }>({
    queryKey: ["/api/self-acceptance-data"],
  });

  const { data: recoveryTendency } = useQuery<RecoveryTendency>({
    queryKey: ["/api/recovery-tendency"],
  });

  // Helper functions for meme unlock logic
  const getIdentityMemes = () => {
    return journalEntries
      .filter(entry => entry.journalType === "identity" && entry.bodyMapping?.memeUrl)
      .map(entry => ({
        id: entry.id,
        memeUrl: entry.bodyMapping.memeUrl,
        description: entry.bodyMapping.memeDescription || "개인 밈",
        keywords: entry.bodyMapping.keywords || [],
        createdAt: entry.createdAt,
        // Extract journal context data
        bodyFeelings: entry.bodyMapping?.dailyJournalContext?.bodyJournal?.bodyFeelings || [],
        emotionLevel: entry.bodyMapping?.dailyJournalContext?.bodyJournal?.emotionLevel,
        reframingContent: entry.bodyMapping?.dailyJournalContext?.reframingJournal?.content,
        hasReframing: entry.bodyMapping?.dailyJournalContext?.reframingJournal?.hasReframing || false,
        reflection: entry.content || ""
      }));
  };

  const hasCompletedJournalType = (journalType: string) => {
    return journalEntries.some(entry => entry.journalType === journalType);
  };

  const hasCompletedAllJournals = () => {
    const requiredJournals = ["body", "identity", "reframing"];
    return requiredJournals.every(journalType => hasCompletedJournalType(journalType));
  };

  const getCompletionStatus = () => {
    const requiredJournals = [
      { type: "body", name: "Body Journal" },
      { type: "identity", name: "Identity Journal" },
      { type: "reframing", name: "Re-Framing Journal" }
    ];
    
    return requiredJournals.map(journal => ({
      ...journal,
      completed: hasCompletedJournalType(journal.type)
    }));
  };

  const identityMemes = getIdentityMemes();
  const canViewMemes = hasCompletedAllJournals();
  const completionStatus = getCompletionStatus();

  // Use data from API endpoints directly
  const weeklyData = weeklyEmotionData || { data: [3, 3, 3, 3, 3, 3, 3], labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] };
  const sensoryData = sensoryExpansionData || { data: [3, 3, 3, 3, 3, 3, 3], labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] };
  // const bodyMapping = bodyMappingData || {};

  // All data now comes from API endpoints

  const getTrendDirection = () => {
    if (!weeklyData?.data || weeklyData.data.length < 2) return "📊 Building data";

    const firstHalf = weeklyData.data.slice(0, 3);
    const secondHalf = weeklyData.data.slice(-3);
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    if (secondAvg > firstAvg) return "↗️ Rising";
    if (secondAvg < firstAvg) return "↘️ Declining";
    return "→ Stable";
  };

  const getBestDay = () => {
    if (!weeklyData?.data) return "Mon";
    const dayAverages = weeklyData.data;
    const maxIndex = dayAverages.indexOf(Math.max(...dayAverages));
    return weeklyData.labels[maxIndex];
  };

  // Helper to extract reframing result from content
  const extractReframingResult = (content: string) => {
    if (!content) return "";
    
    const reframingMarker = "=== 리프레이밍 결과 ===";
    const startIndex = content.indexOf(reframingMarker);
    
    if (startIndex === -1) return "";
    
    const resultContent = content.substring(startIndex + reframingMarker.length).trim();
    return resultContent;
  };

  // Meme sharing handlers
  const handleTwitterShare = async (meme: any) => {
    try {
      await socialSharingService.shareToTwitter({
        memeUrl: meme.memeUrl,
        description: meme.description,
        keywords: meme.keywords,
        reflection: `오늘의 정체성: ${meme.keywords.join(', ')} | 몸의 감각: ${meme.bodyFeelings?.join(', ') || '없음'} | 리프레이밍: ${meme.hasReframing ? '완료' : '미완료'}`
      });
      toast({
        title: "트위터 공유",
        description: "트위터 공유 창이 열렸습니다!",
      });
    } catch (error) {
      toast({
        title: "공유 실패",
        description: "트위터 공유에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleInstagramShare = async (meme: any) => {
    try {
      await socialSharingService.shareToInstagram({
        memeUrl: meme.memeUrl,
        description: meme.description,
        keywords: meme.keywords,
        reflection: `오늘의 정체성: ${meme.keywords.join(', ')} | 몸의 감각: ${meme.bodyFeelings?.join(', ') || '없음'} | 리프레이밍: ${meme.hasReframing ? '완료' : '미완료'}`
      });
      toast({
        title: "Instagram 준비 완료",
        description: "메시지가 클립보드에 복사되었습니다!",
      });
    } catch (error) {
      toast({
        title: "공유 실패",
        description: "Instagram 공유 준비에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadMeme = async (meme: any) => {
    try {
      await socialSharingService.downloadMeme(meme.memeUrl, `identity-meme-${meme.id}.png`);
      toast({
        title: "다운로드 완료",
        description: "밈이 다운로드되었습니다!",
      });
    } catch (error) {
      toast({
        title: "다운로드 실패",
        description: "다운로드에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // Meme reveal game mechanics
  const handleRevealMeme = (memeId: string) => {
    setRevealedMemes(prev => new Set([...Array.from(prev), memeId]));
    
    // Add celebration effect
    setCelebrationMode(true);
    setTimeout(() => setCelebrationMode(false), 2000);
    
    toast({
      title: "🎉 밈 발견!",
      description: "새로운 개인 밈을 발견했습니다! 공유해보세요!",
    });
  };

  const isMemeRevealed = (memeId: string) => revealedMemes.has(memeId);

  // All calculations now done in backend

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
      <div className="text-center pt-2 pb-2">
        <h1 className="text-2xl font-serif font-semibold text-stone-600">
          Insights
        </h1>
        <p className="text-stone-400 text-sm mt-1">
          Understanding your emotional patterns
        </p>
      </div>

      {/* Emotion Wave Analysis */}
      {/* <Card className="bg-white rounded-organic stone-shadow border border-stone-100 relative">
        <CardContent className="p-6">
          <div className="botanical-accent relative"></div>
          <h3 className="font-serif font-semibold text-stone-600 text-lg mb-4">
            Emotion Wave Analysis
          </h3>

          <WaveChart data={weeklyData?.data || []} labels={weeklyData?.labels || []} />

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
      </Card> */}

      {/* Sensory Expansion Wave Analysis */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-organic stone-shadow border-0 relative -mt-4">
        <CardContent className="p-4">
          <div className="absolute top-3 right-4 text-purple-400">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2h12v12H2z" opacity="0.3"/>
              <path d="M1 8l3-3 3 3 4-4 4 4" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          <h3 className="font-sans font-semibold text-stone-600 text-lg mb-3 border-b border-purple-300 pb-2">
            감정 루프 분석
          </h3>
          {/* <p className="text-stone-500 text-sm mb-4">
            이완감(40%) + 자기수용(30%) + 감정재서사(30%)로 계산된 주간 감각 파동
          </p> */}

          <SensoryScoreChart data={sensoryData?.data || []} labels={sensoryData?.labels || []} />

          <div className="flex justify-between text-sm">
            <div className="text-center">
              <p className="text-stone-400">평균 점수</p>
              <p className="font-semibold text-purple-600">
                {sensoryData?.data ? (sensoryData.data.reduce((a: number, b: number) => a + b, 0) / sensoryData.data.length).toFixed(1) : "3.0"}/5
              </p>
            </div>
            <div className="text-center">
              <p className="text-stone-400">최고의 날</p>
              <p className="font-semibold text-purple-700">
                {sensoryData?.data && sensoryData?.labels ? sensoryData.labels[sensoryData.data.indexOf(Math.max(...sensoryData.data))] : "Thu"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-stone-400">감각 파동</p>
              <p className="font-semibold text-purple-600">
                {(() => {
                  if (!sensoryData?.data) return "─ 안정";
                  const data = sensoryData.data;
                  const variance = data.reduce((sum: number, val: number) => {
                    const mean = data.reduce((a: number, b: number) => a + b) / data.length;
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

      {/* Recovery Tendency Highlight - Only shown when recovery is detected */}
      {recoveryTendency?.isRecoveryDetected && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-organic shadow-lg border-2 border-emerald-300 relative">
          <CardContent className="p-5">
            <div className="absolute top-3 right-4 text-emerald-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {/* <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white ${
                  recoveryTendency?.grade === 'S' ? 'bg-green-500' :
                  recoveryTendency?.grade === 'A' ? 'bg-blue-500' :
                  recoveryTendency?.grade === 'B' ? 'bg-yellow-500' :
                  recoveryTendency?.grade === 'C' ? 'bg-orange-500' : 'bg-red-500'
                }`}>
                  {recoveryTendency?.grade}
                </div> */}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  <h3 className="font-semibold text-lg text-emerald-800">
                    {recoveryTendency?.gradeText} 감지됨
                  </h3>
                </div>
                <p className="text-sm text-stone-600 mb-3">
                  {recoveryTendency?.summary}
                </p>
                <div className="bg-white/80 p-3 rounded-lg mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-stone-700">회복 등급</span>
                    <span className={`font-bold ${recoveryTendency?.color}`}>
                      {recoveryTendency?.gradeText}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-stone-700">감각 확장 점수</span>
                    <span className="font-bold text-emerald-600">
                      {recoveryTendency?.sensoryScore}점/100점
                    </span>
                  </div>
                </div>
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-stone-700 mb-2">제안 루틴</h4>
                  <div className="flex flex-wrap gap-1">
                    {recoveryTendency?.suggestions?.map((suggestion, index) => (
                      <span key={index} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                        {suggestion}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-stone-500">
                  감지일: {recoveryTendency?.detectionDate}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decline Detection Alert - Only shown when decline is detected */}
      {recoveryTendency?.declineDetected && (
        <Card className="bg-gradient-to-br from-red-50 to-orange-100 rounded-organic shadow-lg border-2 border-red-300 relative">
          <CardContent className="p-5">
            <div className="absolute top-3 right-4 text-red-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.76 0L4.054 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {/* <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div> */}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="inline-block w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                  <h3 className="font-semibold text-lg text-red-800">
                    {recoveryTendency?.declineType} 패턴 감지
                  </h3>
                </div>
                
                {recoveryTendency?.declineResponse && (
                  <>
                    <div className="bg-white/80 p-3 rounded-lg mb-3">
                      <div className="mb-2">
                        <span className="text-sm font-medium text-stone-700">가능 원인:</span>
                        <p className="text-sm text-stone-600 mt-1">{recoveryTendency.declineResponse.cause}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                        <h4 className="text-sm font-medium text-amber-800 mb-2">1차 대응</h4>
                        <p className="text-sm text-amber-700">{recoveryTendency.declineResponse.primaryResponse}</p>
                      </div>
                      
                      <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                        <h4 className="text-sm font-medium text-orange-800 mb-2">2차 대응</h4>
                        <p className="text-sm text-orange-700">{recoveryTendency.declineResponse.secondaryResponse}</p>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="text-xs text-stone-500 mt-3">
                  패턴 감지일: {recoveryTendency?.detectionDate}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wellness Patterns */}
      {/* <Card className="bg-gradient-to-br from-peach-100 to-peach-200 rounded-organic stone-shadow border-0 relative">
        <CardContent className="p-6">
          <h3 className="font-serif font-semibold text-stone-600 text-lg mb-4 border-b border-peach-300 pb-2">
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
      </Card> */}

      {/* Routine Execution Report */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-organic stone-shadow border-0 relative">
        <CardContent className="p-4">
          <div className="absolute top-3 right-4 text-purple-400">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="8" r="6" opacity="0.3"/>
              <path d="M6 8l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          <h3 className="font-sans font-semibold text-stone-600 text-lg mb-3 border-b border-purple-300 pb-2">
            루틴 실행 리포트
          </h3>

          <div className="space-y-4">
            {/* Red Button Execution Count */}
            <div className="bg-white/80 p-4 rounded-stone">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-stone-700">Red Button 실행 횟수</h4>
                <span className="text-2xl font-bold text-red-500">
                  {routineExecutionData?.redButtonExecutions?.totalClicks || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm text-stone-500">
                {routineExecutionData?.redButtonExecutions?.labels?.map((day: string, index: number) => (
                  <div key={day} className="text-center">
                    <div className="text-xs mb-1">{day}</div>
                    <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center text-xs font-medium">
                      {routineExecutionData?.redButtonExecutions?.weeklyData?.[index] || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Effectiveness Rate */}
            <div className="bg-white/80 p-4 rounded-stone">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-stone-700">효과 응답 비율</h4>
                <span className="text-2xl font-bold text-green-500">
                  {routineExecutionData?.effectivenessRate?.rate?.toFixed(1) || 0}%
                </span>
              </div>
              <div className="text-sm text-stone-500 mb-2">
                {routineExecutionData?.effectivenessRate?.positiveResponses || 0} / {routineExecutionData?.effectivenessRate?.totalResponses || 0} 긍정적 응답
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full" 
                  style={{ width: `${routineExecutionData?.effectivenessRate?.rate || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Self-Acceptance Graph */}
      {/* <Card className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-organic stone-shadow border-0 relative">
        <CardContent className="p-4">
          <div className="absolute top-3 right-4 text-amber-600">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2C5.8 2 4 3.8 4 6c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z" opacity="0.3"/>
              <circle cx="8" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <h3 className="font-sans font-semibold text-stone-600 text-lg mb-3 border-b border-amber-400 pb-2">
            자기 수용 그래프
          </h3>

          <SensoryScoreChart 
            data={selfAcceptanceData?.data || []} 
            labels={selfAcceptanceData?.labels || []} 
          />

          <div className="flex justify-between text-sm mt-4">
            <div className="text-center">
              <p className="text-stone-400">평균 점수</p>
              <p className="font-semibold text-amber-700">
                {selfAcceptanceData?.averageScore?.toFixed(1) || "0.0"}/5
              </p>
            </div>
            <div className="text-center">
              <p className="text-stone-400">변화 추세</p>
              <p className="font-semibold text-stone-600">
                {selfAcceptanceData?.trend === "increasing" ? "↗️ 상승" : 
                 selfAcceptanceData?.trend === "decreasing" ? "↘️ 하락" : "→ 안정"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-stone-400">기반 데이터</p>
              <p className="font-semibold text-stone-600 text-xs">
                체크아웃 일치도
              </p>
            </div>
          </div>

          <div className="mt-3 text-center">
            <div className="text-xs text-stone-500 bg-white/60 px-3 py-1 rounded-full">
              Check-out 기반 자기 일치도 변화 추적
            </div>
          </div>
        </CardContent> 
      </Card> */}

      {/* Identity Meme Gallery */}
      <Card className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-organic stone-shadow border-0 relative">
          <CardContent className="p-4">
            <div className="absolute top-3 right-4 text-pink-400">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z" opacity="0.7"/>
              </svg>
            </div>
            <h3 className="font-sans font-semibold text-stone-600 text-lg mb-3 border-b border-pink-300 pb-2">
              개인 밈 갤러리
            </h3>

            {!canViewMemes ? (
              // Locked state - show completion requirements
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-stone-400" />
                </div>
                <h4 className="font-medium text-stone-600 mb-2">밈 갤러리 잠금 상태</h4>
                <p className="text-sm text-stone-500 mb-4">
                  3개의 저널을 모두 완료하면 개인 밈을 확인할 수 있습니다
                </p>
                
                {/* Completion Checklist */}
                <div className="bg-white/60 p-4 rounded-stone mb-4">
                  <h5 className="text-sm font-medium text-stone-600 mb-3">완료 현황</h5>
                  <div className="space-y-2">
                    {completionStatus.map((journal, index) => (
                      <div key={journal.type} className="flex items-center justify-between text-sm">
                        <span className="text-stone-600">{journal.name}</span>
                        {journal.completed ? (
                          <span className="text-green-600 font-medium">✓ 완료</span>
                        ) : (
                          <span className="text-stone-400">미완료</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white/60 p-3 rounded-stone text-xs text-stone-600">
                  💡 모든 저널을 완료하면 개인 맞춤 밈을 생성하고 공유할 수 있습니다
                </div>
              </div>
            ) : (
              // Unlocked state - show memes with reveal mechanics
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-stone-600">
                    🎉 축하합니다! 모든 저널을 완료하여 밈 갤러리가 열렸습니다
                  </p>
                  <p className="text-xs text-stone-500 mt-2">
                    💎 밈을 클릭해서 발견해보세요! 개인 맞춤 밈을 Twitter와 Instagram에 공유해보세요!
                  </p>
                  {celebrationMode && (
                    <div className="text-center py-2">
                      <div className="inline-flex items-center space-x-1 text-yellow-600 animate-bounce">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">새로운 밈 발견!</span>
                        <Sparkles className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {identityMemes.map((meme) => {
                    const isRevealed = isMemeRevealed(meme.id);
                    
                    return (
                      <div key={meme.id} className="bg-white/80 p-4 rounded-stone relative">
                        {!isRevealed ? (
                          // Hidden state - clickable mystery box
                          <div 
                            className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-3 overflow-hidden cursor-pointer hover:from-purple-200 hover:to-pink-200 transition-all duration-300 border-2 border-dashed border-purple-300 flex flex-col items-center justify-center group"
                            onClick={() => handleRevealMeme(meme.id)}
                          >
                            <div className="text-center space-y-3">
                              <div className="relative">
                                <Gift className="w-12 h-12 text-purple-400 group-hover:text-purple-600 transition-colors animate-pulse" />
                                <div className="absolute -top-1 -right-1">
                                  <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-purple-600 group-hover:text-purple-800">
                                  🎁 신비한 밈 상자
                                </p>
                                <p className="text-xs text-purple-500 mt-1">
                                  클릭해서 발견하세요!
                                </p>
                              </div>
                            </div>
                            <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-all duration-300 rounded-lg"></div>
                          </div>
                        ) : (
                          // Revealed state - show actual meme
                          <div className="aspect-square bg-stone-100 rounded-lg mb-3 overflow-hidden relative">
                            <img 
                              src={meme.memeUrl} 
                              alt={meme.description}
                              className="w-full h-full object-cover transition-all duration-500 ease-out animate-in slide-in-from-bottom-4 fade-in-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x400/E5E7EB/9CA3AF?text=Meme";
                              }}
                            />
                            {/* Revealed badge */}
                            <div className="absolute top-2 right-2">
                              <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                                <Eye className="w-3 h-3" />
                                <span>발견됨</span>
                              </div>
                            </div>
                          </div>
                        )}
                      
                      {isRevealed && (
                        <div className="text-center transition-all duration-500 ease-out animate-in slide-in-from-bottom-2 fade-in-0">
                          <h4 className="font-medium text-stone-700 mb-3">{meme.description}</h4>
                        
                        {/* Identity Keywords */}
                        <div className="mb-4">
                          <h5 className="text-xs font-medium text-stone-500 mb-2">🎭 정체성 키워드</h5>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {meme.keywords.map((keyword: string) => (
                              <span 
                                key={keyword}
                                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Body Feelings */}
                        {meme.bodyFeelings && meme.bodyFeelings.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-xs font-medium text-stone-500 mb-2">🫀 몸의 감각</h5>
                            <div className="flex flex-wrap gap-1 justify-center">
                              {meme.bodyFeelings.map((feeling: string) => (
                                <span 
                                  key={feeling}
                                  className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                                >
                                  {feeling}
                                </span>
                              ))}
                            </div>
                            {meme.emotionLevel && (
                              <p className="text-xs text-stone-500 mt-1">
                                감정 레벨: {meme.emotionLevel}/5
                              </p>
                            )}
                          </div>
                        )}

                        {/* Reframing Comments */}
                        {meme.hasReframing && meme.reframingContent && (
                          <div className="mb-4">
                            <h5 className="text-xs font-medium text-stone-500 mb-2">🔄 리프레이밍 결과</h5>
                            <div className="bg-green-50 p-2 rounded-lg">
                              <p className="text-xs text-green-700 leading-relaxed">
                                {(() => {
                                  const reframingResult = extractReframingResult(meme.reframingContent);
                                  const displayText = reframingResult || meme.reframingContent;
                                  return displayText.length > 120 
                                    ? `${displayText.substring(0, 120)}...` 
                                    : displayText;
                                })()}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Date */}
                        <div className="mb-3">
                          <p className="text-xs text-stone-400">
                            생성일: {new Date(meme.createdAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-xs bg-[#1DA1F2] text-white border-[#1DA1F2] hover:bg-[#1a8cd8]"
                            onClick={() => handleTwitterShare(meme)}
                          >
                            <Twitter className="w-3 h-3 mr-1" />
                            Twitter
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-500 hover:from-purple-600 hover:to-pink-600"
                            onClick={() => handleInstagramShare(meme)}
                          >
                            <Instagram className="w-3 h-3 mr-1" />
                            Instagram
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-xs"
                            onClick={() => handleDownloadMeme(meme)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            저장
                          </Button>
                        </div>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>

                {identityMemes.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-stone-500">
                      아직 생성된 밈이 없습니다. Identity Journal을 작성해보세요!
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

      {/* Body Emotion Mapping Report */}
  
     
    </div>
  );
}
