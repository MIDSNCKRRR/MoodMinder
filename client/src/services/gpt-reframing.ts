import OpenAI from "openai";

// Test mode configuration
const TEST_MODE = true; // Set to false to use real GPT API

// Test dummy responses for development
const TEST_RESPONSES: Record<string, string[]> = {
  jealousy: [
    "질투는 내가 무언가를 원한다는 신호이며, 그것을 얻기 위한 동기가 될 수 있다.",
    "다른 사람의 성공을 보며 느끼는 질투는 내 안의 가능성을 발견하는 기회다."
  ],
  shame: [
    "수치심은 과거의 나를 성장시키려는 마음의 신호이며, 더 나은 선택을 할 수 있다는 증거다.",
    "실수를 인정하는 용기는 진정한 성장의 시작점이다."
  ],
  emptiness: [
    "공허함은 새로운 것으로 채워질 수 있는 여백이며, 변화의 준비 상태다.",
    "비어있음을 느낀다는 것은 더 의미 있는 것을 찾고 있다는 신호다."
  ],
  inferiority: [
    "열등감은 나만의 독특함을 아직 발견하지 못했다는 뜻이며, 탐험의 시작이다.",
    "다른 사람과 비교하는 마음은 내 안의 잠재력을 확인하려는 욕구의 표현이다."
  ],
  recognition: [
    "인정받고 싶은 마음은 소중한 나 자신을 드러내려는 건강한 욕구다.",
    "타인의 인정보다 먼저 나 자신을 인정하는 것이 진정한 자존감의 시작이다."
  ],
  urgency: [
    "조급함은 목표를 향한 열정의 다른 표현이며, 방향을 재조정할 시점을 알려준다.",
    "천천히 가더라도 꾸준히 가는 것이 더 멀리 갈 수 있는 지혜다."
  ],
  sadness: [
    "슬픔은 소중했던 것을 잃었다는 증거이며, 그만큼 사랑할 줄 아는 마음이 있다는 뜻이다.",
    "눈물은 마음을 정화하고 새로운 시작을 준비하는 자연스러운 과정이다."
  ],
  anger: [
    "분노는 중요한 가치가 위협받았다는 신호이며, 그것을 지키려는 의지의 표현이다.",
    "화가 난다는 것은 옳고 그름을 구분할 줄 아는 건강한 감정이다."
  ],
  fear: [
    "두려움은 소중한 것을 보호하려는 마음이며, 신중한 선택을 돕는 지혜다.",
    "무서워하는 마음 뒤에는 용기를 낼 준비가 되어 있다."
  ],
  joy: [
    "기쁨은 현재 순간의 소중함을 느끼는 능력이며, 감사할 줄 아는 마음의 증거다.",
    "행복한 순간을 기억하는 것은 어려운 시기를 견디는 힘이 된다."
  ],
  love: [
    "사랑하는 마음은 나 자신이 얼마나 따뜻한 사람인지 보여주는 거울이다.",
    "누군가를 사랑할 수 있다는 것은 내 안에 무한한 긍정의 에너지가 있다는 증거다."
  ]
};

interface ReframingRequest {
  emotion: string;
  emotionName: string;
  answers: string[];
}

interface ReframingResponse {
  reframedSentences: string[];
  success: boolean;
  error?: string;
}

class GPTReframingService {
  private openai: OpenAI | null = null;

  constructor() {
    if (!TEST_MODE && process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ 
        apiKey: process.env.OPENAI_API_KEY,
        dangerouslyAllowBrowser: true // Only for development
      });
    }
  }

  async reframeEmotion(request: ReframingRequest): Promise<ReframingResponse> {
    try {
      if (TEST_MODE) {
        return this.getTestResponse(request);
      }

      if (!this.openai) {
        throw new Error('OpenAI API key not configured');
      }

      return await this.getGPTResponse(request);
    } catch (error) {
      console.error('Reframing error:', error);
      return {
        success: false,
        reframedSentences: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async getTestResponse(request: ReframingRequest): Promise<ReframingResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const testSentences = TEST_RESPONSES[request.emotion] || [
      "이 감정은 나의 성장을 위한 소중한 신호다.",
      "지금 이 순간도 나는 더 나은 내일을 위해 나아가고 있다."
    ];

    return {
      success: true,
      reframedSentences: testSentences.slice(0, 2) // 최대 2문장
    };
  }

  private async getGPTResponse(request: ReframingRequest): Promise<ReframingResponse> {
    const prompt = `
사용자가 "${request.emotionName}" 감정에 대해 다음과 같이 답했습니다:

${request.answers.map((answer, index) => `${index + 1}. ${answer}`).join('\n')}

이 감정과 상황을 긍정적으로 재해석하여 2개의 짧고 따뜻한 문장으로 리프레이밍해주세요. 
각 문장은 50자 이내로 작성하고, 사용자가 자신을 격려하고 성장할 수 있도록 도와주는 내용이어야 합니다.

응답은 다음 JSON 형식으로만 해주세요:
{
  "sentences": [
    "첫 번째 리프레이밍 문장",
    "두 번째 리프레이밍 문장"
  ]
}
`;

    const response = await this.openai!.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "당신은 정신건강 전문가입니다. 사용자의 감정을 긍정적으로 재해석하여 성장과 치유를 도와주세요. 응답은 반드시 JSON 형식으로만 해주세요."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      success: true,
      reframedSentences: result.sentences || []
    };
  }
}

export const gptReframingService = new GPTReframingService();
export type { ReframingRequest, ReframingResponse };