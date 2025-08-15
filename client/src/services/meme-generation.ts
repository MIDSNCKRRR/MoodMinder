import OpenAI from "openai";

// Test mode configuration
const TEST_MODE = true; // Set to false to use real GPT API

// Test dummy meme responses for development
const TEST_MEME_RESPONSES: Record<string, string> = {
  creative: "https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Creative+Mastermind",
  ambitious: "https://via.placeholder.com/400x400/4ECDC4/FFFFFF?text=Goal+Crusher",
  empathetic: "https://via.placeholder.com/400x400/45B7D1/FFFFFF?text=Heart+of+Gold",
  resilient: "https://via.placeholder.com/400x400/96CEB4/FFFFFF?text=Bounce+Back+Hero",
  curious: "https://via.placeholder.com/400x400/FFEAA7/000000?text=Wonder+Explorer",
  leader: "https://via.placeholder.com/400x400/DDA0DD/FFFFFF?text=Natural+Born+Leader",
  authentic: "https://via.placeholder.com/400x400/FFB6C1/000000?text=True+to+Self",
  optimistic: "https://via.placeholder.com/400x400/FFE4B5/000000?text=Sunshine+Spirit",
  independent: "https://via.placeholder.com/400x400/D3D3D3/000000?text=Solo+Warrior",
  compassionate: "https://via.placeholder.com/400x400/F0E68C/000000?text=Kind+Soul"
};

interface MemeGenerationRequest {
  keywords: string[];
  reflection: string;
  matchingScore: number;
}

interface MemeGenerationResponse {
  memeUrl: string;
  description: string;
  success: boolean;
  error?: string;
}

class MemeGenerationService {
  private openai: OpenAI | null = null;

  constructor() {
    if (!TEST_MODE && process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ 
        apiKey: process.env.OPENAI_API_KEY,
        dangerouslyAllowBrowser: true // Only for development
      });
    }
  }

  async generateMeme(request: MemeGenerationRequest): Promise<MemeGenerationResponse> {
    try {
      if (TEST_MODE) {
        return this.getTestMeme(request);
      }

      if (!this.openai) {
        throw new Error('OpenAI API key not configured');
      }

      return await this.getGPTMeme(request);
    } catch (error) {
      console.error('Meme generation error:', error);
      return {
        success: false,
        memeUrl: "",
        description: "",
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async getTestMeme(request: MemeGenerationRequest): Promise<MemeGenerationResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get the primary keyword for meme selection
    const primaryKeyword = request.keywords[0]?.toLowerCase() || "authentic";
    
    // Find a matching test meme or use default
    const memeUrl = TEST_MEME_RESPONSES[primaryKeyword] || 
                    TEST_MEME_RESPONSES.authentic;

    const description = this.generateMemeDescription(request.keywords);

    return {
      success: true,
      memeUrl,
      description
    };
  }

  private async getGPTMeme(request: MemeGenerationRequest): Promise<MemeGenerationResponse> {
    // First, get a description for the meme
    const descriptionPrompt = `
사용자가 자신의 정체성을 다음 키워드로 표현했습니다: ${request.keywords.join(', ')}

리플렉션 내용:
${request.reflection}

이 사용자의 정체성을 바탕으로 재미있고 긍정적인 밈 이미지에 대한 설명을 생성해주세요. 
설명은 영어로 작성하고, 이미지 생성 AI가 이해할 수 있도록 구체적이고 명확해야 합니다.

응답 형식:
{
  "description": "meme image description in English",
  "korean_title": "밈의 한국어 제목"
}
`;

    const descriptionResponse = await this.openai!.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a creative designer specializing in positive, humorous meme creation. Generate descriptions for uplifting memes based on personality traits."
        },
        {
          role: "user",
          content: descriptionPrompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
      temperature: 0.8
    });

    const descriptionResult = JSON.parse(descriptionResponse.choices[0].message.content || '{}');
    
    // Generate the actual image using DALL-E
    const imageResponse = await this.openai!.images.generate({
      model: "dall-e-3",
      prompt: `Create a cute and positive meme image: ${descriptionResult.description}. Style: cartoon, colorful, friendly, uplifting, meme format with clear visual hierarchy`,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    return {
      success: true,
      memeUrl: imageResponse.data[0].url || "",
      description: descriptionResult.korean_title || "당신만의 특별한 밈"
    };
  }

  private generateMemeDescription(keywords: string[]): string {
    const primaryKeyword = keywords[0] || "authentic";
    const descriptions: Record<string, string> = {
      creative: "창의적인 천재",
      ambitious: "목표 달성 마스터",
      empathetic: "공감의 달인",
      resilient: "불굴의 전사",
      curious: "호기심 탐험가",
      leader: "타고난 리더",
      authentic: "진정성의 아이콘",
      optimistic: "긍정 에너지 충전기",
      independent: "독립적인 영혼",
      compassionate: "따뜻한 마음의 소유자"
    };

    return descriptions[primaryKeyword.toLowerCase()] || `${primaryKeyword}의 달인`;
  }
}

export const memeGenerationService = new MemeGenerationService();
export type { MemeGenerationRequest, MemeGenerationResponse };