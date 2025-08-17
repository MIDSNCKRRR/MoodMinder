import OpenAI from "openai";
import memeCommentsData from "@/data/meme/text/identity.json";

// Test mode configuration
const TEST_MODE = true; // Set to false to use real GPT API

// Available local meme images
const LOCAL_MEME_IMAGES = [
  "/src/data/meme/brave_capibara.png",
  "/src/data/meme/dummy_cat.png"
];

// Keyword to image mapping for better selection
const KEYWORD_TO_IMAGE_MAP: Record<string, string> = {
  creative: "/src/data/meme/dummy_cat.png",
  ambitious: "/src/data/meme/brave_capibara.png",
  empathetic: "/src/data/meme/dummy_cat.png",
  resilient: "/src/data/meme/brave_capibara.png",
  curious: "/src/data/meme/dummy_cat.png",
  leader: "/src/data/meme/brave_capibara.png",
  authentic: "/src/data/meme/dummy_cat.png",
  optimistic: "/src/data/meme/dummy_cat.png",
  independent: "/src/data/meme/brave_capibara.png",
  compassionate: "/src/data/meme/dummy_cat.png",
  brave: "/src/data/meme/brave_capibara.png",
  confident: "/src/data/meme/brave_capibara.png",
  strong: "/src/data/meme/brave_capibara.png",
  calm: "/src/data/meme/brave_capibara.png",
  peaceful: "/src/data/meme/brave_capibara.png",
  playful: "/src/data/meme/dummy_cat.png",
  cute: "/src/data/meme/dummy_cat.png",
  funny: "/src/data/meme/dummy_cat.png",
  friendly: "/src/data/meme/dummy_cat.png"
};

interface MemeGenerationRequest {
  keywords: string[];
  reflection: string;
  matchingScore: number;
  dailyJournalData?: {
    bodyJournal?: {
      emotionLevel: number;
      bodyFeelings: string[];
      content: string;
    };
    reframingJournal?: {
      content: string;
      hasReframing: boolean;
    };
  };
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
    
    // Find a matching local meme image based on keywords
    let selectedImage = KEYWORD_TO_IMAGE_MAP[primaryKeyword];
    
    // If no specific mapping found, look for any keyword match
    if (!selectedImage) {
      for (const keyword of request.keywords) {
        const lowerKeyword = keyword.toLowerCase();
        if (KEYWORD_TO_IMAGE_MAP[lowerKeyword]) {
          selectedImage = KEYWORD_TO_IMAGE_MAP[lowerKeyword];
          break;
        }
      }
    }
    
    // Fallback to random selection from available images
    if (!selectedImage) {
      const randomIndex = Math.floor(Math.random() * LOCAL_MEME_IMAGES.length);
      selectedImage = LOCAL_MEME_IMAGES[randomIndex];
    }

    const description = this.generateFunnyComment(request);

    return {
      success: true,
      memeUrl: selectedImage,
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
      memeUrl: imageResponse.data?.[0]?.url || "",
      description: descriptionResult.korean_title || "당신만의 특별한 밈"
    };
  }

  private generateFunnyComment(request: MemeGenerationRequest): string {
    try {
      const templates = memeCommentsData.identity.templates;
      const fallbackComments = memeCommentsData.identity.fallback_comments;
      
      // Find matching template based on keywords, emotion level, and body feelings
      for (const template of templates) {
        if (this.matchesTemplate(template, request)) {
          const comments = template.comments;
          const randomIndex = Math.floor(Math.random() * comments.length);
          return comments[randomIndex];
        }
      }
      
      // If no template matches, use fallback comment
      const randomIndex = Math.floor(Math.random() * fallbackComments.length);
      return fallbackComments[randomIndex];
      
    } catch (error) {
      console.error('Error generating funny comment:', error);
      return this.generateMemeDescription(request.keywords);
    }
  }

  private matchesTemplate(template: any, request: MemeGenerationRequest): boolean {
    const condition = template.condition;
    
    // Check keywords match
    if (condition.keywords && !condition.keywords.includes("any")) {
      const hasMatchingKeyword = condition.keywords.some((keyword: string) => 
        request.keywords.some(userKeyword => 
          userKeyword.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      if (!hasMatchingKeyword) return false;
    }
    
    // Check emotion level (assume default level 3 if no daily data)
    const emotionLevel = request.dailyJournalData?.bodyJournal?.emotionLevel || 3;
    if (condition.emotion_level && !condition.emotion_level.includes(emotionLevel)) {
      return false;
    }
    
    // Check body feelings
    if (condition.body_feelings && request.dailyJournalData?.bodyJournal?.bodyFeelings) {
      const hasMatchingBodyFeeling = condition.body_feelings.some((feeling: string) =>
        request.dailyJournalData?.bodyJournal?.bodyFeelings.includes(feeling)
      );
      if (!hasMatchingBodyFeeling) return false;
    }
    
    // Check for reframing completion
    if (condition.has_reframing && !request.dailyJournalData?.reframingJournal?.hasReframing) {
      return false;
    }
    
    // Check for triple completion (this would need to be passed in from the caller)
    if (condition.has_body && condition.has_identity && condition.has_reframing) {
      return !!(
        request.dailyJournalData?.bodyJournal && 
        request.keywords.length > 0 && 
        request.dailyJournalData?.reframingJournal?.hasReframing
      );
    }
    
    return true;
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