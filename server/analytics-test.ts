// ===== TEST SCRIPT FUNCTIONS =====
// Use these functions first, then replace with analytics-db.ts later
// All function names match analytics-db.ts exactly

export async function getWeeklyEmotionData() {
  // Test implementation - returns static realistic data
  const testData = [2.5, 3.0, 4.0, 5.0, 4.0, 3.0, 4.0]; // Mon-Sun progression
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  return { data: testData, labels };
}

export async function getSensoryExpansionData() {
  // Test implementation - realistic sensory expansion scores
  // Monday: Low start with stress/tension
  // Tuesday: Building up with some self-reflection  
  // Wednesday: Good progress with reframing success
  // Thursday: Peak day with high self-acceptance
  // Friday: Sustained high performance
  // Saturday: Weekend dip but stable
  // Sunday: Balanced close to week
  const testSensoryScores = [2.2, 2.8, 3.6, 4.5, 4.1, 3.3, 3.8]; // Mon-Sun
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  return { data: testSensoryScores, labels };
}

export async function getEmotionStats() {
  // Test implementation - realistic stats
  return {
    averageEmotion: 3.6,
    totalEntries: 10,
    weeklyAverage: 3.6,
    monthlyStreak: 7,
  };
}

export async function getBodyMappingInsights() {
  // Test implementation - body areas from test data
  return {
    head: 3,
    chest: 5,
    shoulders: 2,
    stomach: 4,
    arms: 2,
    legs: 1,
  };
}

export async function getEmotionPatterns() {
  // Test implementation - predefined insights
  return [
    {
      text: "Mornings show 15% higher emotional balance",
      color: "bg-sage-400",
    },
    {
      text: "Average journaling session: 4 minutes", 
      color: "bg-lavender-400",
    },
    {
      text: "Most frequent emotion: hopeful (30%)",
      color: "bg-coral-400",
    },
  ];
}

export async function getRoutineExecutionData() {
  // Test implementation - routine execution report
  return {
    redButtonExecutions: {
      totalClicks: 24,
      weeklyData: [2, 4, 3, 5, 4, 3, 3], // Mon-Sun
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    },
    effectivenessRate: {
      totalResponses: 18,
      positiveResponses: 15,
      rate: 83.3, // percentage
      weeklyRates: [75, 80, 100, 85, 90, 70, 85] // Mon-Sun percentage
    }
  };
}

export async function getSelfAcceptanceData() {
  // Test implementation - self-acceptance graph based on check-out matching scores
  return {
    weeklyData: [2.8, 3.2, 3.8, 4.2, 4.0, 3.5, 4.1], // Mon-Sun matching scores
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    averageScore: 3.7,
    trend: "increasing" // increasing, decreasing, stable
  };
}

export async function getRecoveryTendency() {
  // Test implementation - recovery tendency analysis with decline detection
  const sensoryScore = 78; // Average sensory expansion score (0-100 scale) - A grade recovery
  
  // Mock historical data for decline detection testing - Testing Stagnation Pattern
  const currentWeekAvg = 78;
  const previousWeekAvg = 78; // No significant change  
  const twoWeeksAvg = 78; // No significant change
  const recent3DaysScores = [77, 78, 79]; // Recent 3 days for volatility check (low volatility)
  const recent14DaysChange = 1; // 14-day change (less than ±5 = stagnation pattern)
  
  // Decline detection logic
  let declineType = null;
  let declineResponse = null;
  
  // Check for decline patterns
  const weeklyDrop = previousWeekAvg - currentWeekAvg;
  const twoWeekDrop = twoWeeksAvg - currentWeekAvg;
  const volatility = Math.max(...recent3DaysScores) - Math.min(...recent3DaysScores);
  
  // Debug logging (remove in production)
  console.log("Decline Detection Debug:", {
    weeklyDrop,
    twoWeekDrop, 
    volatility,
    recent14DaysChange,
    absChange: Math.abs(recent14DaysChange)
  });
  
  if (weeklyDrop >= 20) {
    // 급격한 하락: 7일 평균 점수가 이전 주 대비 20점 이상 하락
    declineType = "급격한 하락";
    declineResponse = {
      cause: "갑작스러운 스트레스, 환경 변화, 관계 트리거",
      primaryResponse: "레드버튼 루틴 즉시 실행 (호흡 4-7-8, 나비포옹, 워킹)",
      secondaryResponse: "하루 1회 심층 리프레이밍 저널, 감각 복원 루틴 2회"
    };
  } else if (twoWeekDrop >= 10 && twoWeekDrop < 20) {
    // 완만한 하락: 2주 평균이 10~19점 하락
    declineType = "완만한 하락";
    declineResponse = {
      cause: "누적 피로, 루틴 불규칙, 자기 돌봄 부족",
      primaryResponse: "아침/저녁 미니 루틴 2회 재도입",
      secondaryResponse: "'감정-루프 매핑표' 기반 원인 추적"
    };
  } else if (volatility >= 25) {
    // 변동성 심화: 3일 내 최고점과 최저점 차이가 25점 이상
    declineType = "변동성 심화";
    declineResponse = {
      cause: "특정 감정 트리거 반복",
      primaryResponse: "트리거별 미니 루틴 세트 실행",
      secondaryResponse: "하루 저널 기록 의무화 + 다음 주 점검"
    };
  } else if (Math.abs(recent14DaysChange) <= 5) {
    // 정체·무반응: 14일간 평균 변화 ±5점
    declineType = "정체·무반응";
    declineResponse = {
      cause: "루틴 효과 둔화, 자기인식 저하",
      primaryResponse: "새로운 루틴·환경 자극 도입",
      secondaryResponse: "1:1 맞춤형 루틴 조정 또는 그룹 세션"
    };
  }
  
  // Determine recovery grade based on sensory score
  let grade = "";
  let gradeText = "";
  let color = "";
  let interpretation = "";
  let suggestions = [];
  
  if (sensoryScore >= 80) {
    grade = "S";
    gradeText = "안정·확장";
    color = "text-green-600";
    interpretation = "현재 루틴이 잘 맞고 있으며, 자기 조절력이 강화된 상태입니다.";
    suggestions = ["루틴 유지", "심화 리추얼 추가", "깊이 있는 호흡 명상", "창작 활동"];
  } else if (sensoryScore >= 65) {
    grade = "A";
    gradeText = "회복 진행";
    color = "text-blue-600";
    interpretation = "회복 궤도에 있습니다. 다만 변동성 낮추기가 필요합니다.";
    suggestions = ["루틴 규칙성 유지", "예방형 미니 루틴 하루 2회", "일정한 시간대 루틴"];
  } else if (sensoryScore >= 50) {
    grade = "B";
    gradeText = "변동성 있음";
    color = "text-yellow-600";
    interpretation = "회복 경로를 유지하되 불안정 구간 점검이 필요합니다.";
    suggestions = ["트리거 감정별 즉시 루틴", "하루 저널 기록 의무화", "패턴 분석 강화"];
  } else if (sensoryScore >= 35) {
    grade = "C";
    gradeText = "정체/느린 회복";
    color = "text-orange-600";
    interpretation = "루프를 끊는 시도가 부족하거나 비효과적입니다.";
    suggestions = ["루틴 재구성", "1:1 맞춤형 회복 계획", "새로운 접근 방식 도입"];
  } else {
    grade = "D";
    gradeText = "하락세";
    color = "text-red-600";
    interpretation = "긴급 개입이 필요합니다.";
    suggestions = ["레드버튼 즉시 발동", "하루 3회 규칙적 루틴", "외부 도움 연결"];
  }
  
  return {
    grade,
    gradeText,
    color,
    sensoryScore,
    interpretation,
    suggestions,
    isRecoveryDetected: sensoryScore >= 65, // A급 이상일 때 회복 경향성 감지
    detectionDate: new Date().toISOString().split('T')[0],
    summary: `최근 7일간의 감각 확장 점수가 ${sensoryScore}점으로 ${gradeText} 단계에 해당합니다. ${interpretation}`,
    // Decline detection data
    declineDetected: declineType !== null,
    declineType,
    declineResponse,
    historicalData: {
      currentWeekAvg,
      previousWeekAvg,
      twoWeeksAvg,
      recent3DaysScores,
      recent14DaysChange,
      volatility
    }
  };
}