import emotionsData from "/data/emotion_color.json";

export interface StandardEmotion {
  emotion_id: number;
  emotion_kr: string;
  emotion_en: string;
  emoji: string;
  colorName: string;
  hex: string;
}

export const getEmotions = (): StandardEmotion[] => {
  return emotionsData as StandardEmotion[];
};

export const getEmotionById = (id: number): StandardEmotion | undefined => {
  return emotionsData.find(emotion => emotion.emotion_id === id);
};

export const getEmotionByName = (name: string, language: 'kr' | 'en' = 'kr'): StandardEmotion | undefined => {
  const key = language === 'kr' ? 'emotion_kr' : 'emotion_en';
  return emotionsData.find(emotion => emotion[key].toLowerCase() === name.toLowerCase());
};

export const formatEmotionForBody = (emotion: StandardEmotion) => ({
  id: emotion.emotion_id,
  emoji: emotion.emoji,
  label: emotion.emotion_en,
  labelKr: emotion.emotion_kr,
  type: emotion.emotion_en.toLowerCase(),
  hex: emotion.hex
});

export const formatEmotionForReframing = (emotion: StandardEmotion) => ({
  id: emotion.emotion_id.toString(),
  name: emotion.emotion_kr,
  english: emotion.emotion_en,
  emoji: emotion.emoji,
  hex: emotion.hex
});

export const getEmotionQuestions = (emotionId: string): string[] => {
  const questionMap: Record<string, string[]> = {
    "1": [ // Joy
      "오늘 느낀 기쁜 감정/상황은?",
      "그 기쁨을 보며 어떤 감정이 스쳤지?",
    ],
    "2": [ // Trust
      "오늘 느낀 신뢰 감정/상황은?",
      "그 신뢰를 보며 어떤 감정이 스쳤지?",
    ],
    "3": [ // Fear
      "오늘 느낀 두려운 감정/상황은?",
      "그 두려움을 보며 어떤 감정이 스쳤지?",
    ],
    "4": [ // Surprise
      "오늘 느낀 놀라운 감정/상황은?",
      "그 놀람을 보며 어떤 감정이 스쳤지?",
    ],
    "5": [ // Sadness
      "오늘 느낀 슬픈 감정/상황은?",
      "이 슬픔 속에서 어떤 감정이 스쳤지?",
    ],
    "6": [ // Disgust
      "오늘 느낀 혐오 감정/상황은?",
      "그 혐오를 보며 어떤 감정이 스쳤지?",
    ],
    "7": [ // Anger
      "오늘 느낀 분노 감정/상황은?",
      "그 분노를 보며 어떤 감정이 스쳤지?",
    ],
    "8": [ // Anticipation
      "오늘 느낀 기대 감정/상황은?",
      "그 기대를 보며 어떤 감정이 스쳤지?",
    ],
  };
  
  return questionMap[emotionId] || [];
};