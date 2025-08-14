interface ConversationState {
  stage: 'greeting' | 'emotion_selection' | 'situation_exploration' | 'deeper_feelings' | 'reframing' | 'conclusion';
  selectedEmotion: string | null;
  emotionName: string | null;
  responses: string[];
  context: string[];
}

interface ConversationResponse {
  message: string;
  shouldListen: boolean;
  isComplete: boolean;
  nextStage?: ConversationState['stage'];
  extractedData?: {
    emotion?: string;
    emotionName?: string;
    response?: string;
  };
}

export class VoiceReframingConversation {
  private state: ConversationState = {
    stage: 'greeting',
    selectedEmotion: null,
    emotionName: null,
    responses: [],
    context: [],
  };

  private emotionKeywords = {
    shame: ['수치심', '부끄러움', '창피', '민망', '쪽팔', '창피해', '부끄러워'],
    emptiness: ['공허함', '허무함', '공허', '텅빈', '공허해', '허무해', '의미없'],
    jealousy: ['질투', '시기', '부러움', '샘', '질투해', '부러워', '시샘'],
    urgency: ['조급함', '초조함', '급함', '조급', '답답', '급해', '조급해'],
    recognition: ['인정욕구', '인정받고싶', '인정', '승인', '칭찬', '인정받', '알아줘'],
    inferiority: ['열등감', '부족함', '못함', '비교', '열등해', '모자라', '딸려'],
  };

  private followUpPatterns = [
    'more', 'tell me more', '더', '자세히', '구체적으로', '어떻게',
    'why', '왜', '어떤', '무엇', '언제', '어디서'
  ];

  private affirmativePatterns = [
    'yes', 'yeah', 'ok', 'okay', '네', '예', '맞아', '그래', '응', '좋아', '알겠'
  ];

  reset() {
    this.state = {
      stage: 'greeting',
      selectedEmotion: null,
      emotionName: null,
      responses: [],
      context: [],
    };
  }

  getInitialMessage(): ConversationResponse {
    return {
      message: "안녕하세요! 리프레이밍 저널에 오신 걸 환영해요. 오늘 어떤 감정을 탐구해보고 싶으신가요? 수치심, 공허함, 질투, 조급함, 인정욕구, 열등감 중에서 말씀해주세요.",
      shouldListen: true,
      isComplete: false,
      nextStage: 'emotion_selection',
    };
  }

  async processUserInput(userInput: string): Promise<ConversationResponse> {
    const trimmedInput = userInput.trim().toLowerCase();
    this.state.context.push(`사용자: ${userInput}`);

    switch (this.state.stage) {
      case 'emotion_selection':
        return this.handleEmotionSelection(trimmedInput, userInput);
      
      case 'situation_exploration':
        return this.handleSituationExploration(userInput);
      
      case 'deeper_feelings':
        return this.handleDeeperFeelings(userInput);
      
      case 'reframing':
        return await this.handleReframing();
      
      case 'conclusion':
        return this.handleConclusion(userInput);
      
      default:
        return {
          message: "죄송해요, 다시 말씀해주세요.",
          shouldListen: true,
          isComplete: false,
        };
    }
  }

  private handleEmotionSelection(input: string, originalInput: string): ConversationResponse {
    // Find matching emotion
    for (const [emotionKey, keywords] of Object.entries(this.emotionKeywords)) {
      if (keywords.some(keyword => input.includes(keyword))) {
        this.state.selectedEmotion = emotionKey;
        this.state.emotionName = keywords[0];
        this.state.stage = 'situation_exploration';
        
        const emotionMessages = {
          shame: "수치심을 느끼셨군요. 그 수치심을 불러일으킨 상황이나 경험에 대해 자세히 말씀해주세요. 어떤 일이 있었나요?",
          emptiness: "공허함을 경험하고 계시는군요. 그 공허함이 어떨 때 더 크게 느껴지는지, 어떤 상황에서 그런 감정이 들었는지 말씀해주세요.",
          jealousy: "질투의 감정을 느끼셨군요. 누구에게, 또는 어떤 상황에서 그런 질투심이 들었는지 편하게 말씀해주세요.",
          urgency: "조급함을 느끼고 계시는군요. 무엇이 당신을 그렇게 조급하게 만드는지, 어떤 상황인지 자세히 말씀해주세요.",
          recognition: "인정받고 싶은 마음이 크시군요. 누구에게서, 어떤 방식으로 인정받고 싶으신지 말씀해주세요.",
          inferiority: "열등감을 느끼고 계시는군요. 어떤 상황에서, 누구와 비교하며 그런 감정이 들었는지 말씀해주세요."
        };

        return {
          message: emotionMessages[emotionKey as keyof typeof emotionMessages] || "그 감정에 대해 더 자세히 말씀해주세요.",
          shouldListen: true,
          isComplete: false,
          extractedData: {
            emotion: emotionKey,
            emotionName: this.state.emotionName,
          },
        };
      }
    }

    return {
      message: "죄송해요, 잘 못 들었어요. 수치심, 공허함, 질투, 조급함, 인정욕구, 열등감 중 어떤 감정을 탐구하고 싶으신지 다시 말씀해주세요.",
      shouldListen: true,
      isComplete: false,
    };
  }

  private handleSituationExploration(userInput: string): ConversationResponse {
    this.state.responses[0] = userInput;
    this.state.stage = 'deeper_feelings';

    const deeperQuestions = {
      shame: "그 수치심을 느끼면서 동시에 어떤 다른 감정들이 스쳤나요? 분노, 슬픔, 두려움 같은 감정들도 함께 있었는지 말씀해주세요.",
      emptiness: "그 공허함 속에서 다른 어떤 감정들을 느꼈나요? 외로움, 슬픔, 불안함 같은 것들도 함께 있었나요?",
      jealousy: "그 질투심과 함께 어떤 감정들이 더 있었나요? 부러움, 분노, 자책감 같은 것들도 느꼈는지 말씀해주세요.",
      urgency: "그 조급함과 함께 어떤 다른 감정들이 있었나요? 불안, 초조, 답답함 같은 감정들도 함께 느꼈나요?",
      recognition: "인정받고 싶은 마음과 함께 어떤 감정들이 더 있었나요? 불안, 외로움, 좌절감 같은 것들도 느꼈나요?",
      inferiority: "열등감과 함께 어떤 다른 감정들을 느꼈나요? 부러움, 자책, 좌절감 같은 것들도 있었는지 말씀해주세요."
    };

    const question = deeperQuestions[this.state.selectedEmotion as keyof typeof deeperQuestions] || 
                    "그 감정과 함께 다른 어떤 감정들을 느꼈는지 말씀해주세요.";

    return {
      message: question,
      shouldListen: true,
      isComplete: false,
      extractedData: {
        response: userInput,
      },
    };
  }

  private handleDeeperFeelings(userInput: string): ConversationResponse {
    this.state.responses[1] = userInput;
    this.state.stage = 'reframing';

    return {
      message: "말씀해주신 내용을 바탕으로 새로운 관점으로 생각해볼 수 있는 문장들을 만들어드릴게요. 잠시만 기다려주세요.",
      shouldListen: false,
      isComplete: false,
      extractedData: {
        response: userInput,
      },
    };
  }

  private async handleReframing(): Promise<ConversationResponse> {
    try {
      // Generate contextual reframing based on emotion and responses
      const reframings = this.generateContextualReframings();
      
      const reframingMessage = "말씀해주신 내용을 새로운 관점으로 바라보면 이렇게 생각해볼 수 있어요.\n\n" +
        reframings.map((r, i) => `${i + 1}. ${r}`).join('\n\n') +
        "\n\n이 중에서 마음에 와닿는 문장이 있나요? 아니면 '다시', '다른 방식으로', '더 구체적으로' 라고 말씀해주시면 다른 관점으로 다시 만들어드릴게요.";

      this.state.stage = 'conclusion';

      return {
        message: reframingMessage,
        shouldListen: true,
        isComplete: false,
      };

    } catch (error) {
      return {
        message: "리프레이밍 문장을 생성하는 중에 오류가 발생했습니다. 다시 시도해주세요.",
        shouldListen: true,
        isComplete: false,
      };
    }
  }

  private generateContextualReframings(): string[] {
    const emotion = this.state.selectedEmotion;
    const situation = this.state.responses[0] || '';
    const feelings = this.state.responses[1] || '';

    // Contextual reframings based on emotion type
    const reframingTemplates = {
      shame: [
        "이런 상황에서 수치심을 느끼는 것은 당신이 더 나은 사람이 되고자 하는 양심이 있다는 증거예요.",
        "완벽하지 않은 모습도 당신의 진실한 인간적인 면이며, 이를 인정하는 용기가 성장의 시작이에요.",
        "지금의 경험이 앞으로 더 현명한 선택을 할 수 있게 도와주는 소중한 교훈이 될 거예요.",
      ],
      emptiness: [
        "공허함을 느낀다는 것은 당신이 더 의미 있는 것을 추구하고 있다는 신호일 수 있어요.",
        "지금의 빈 공간은 새로운 가능성과 기회들로 채워질 수 있는 여유 공간이기도 해요.",
        "모든 감정은 일시적이며, 지금의 공허함 뒤에 새로운 충만함이 기다리고 있을 거예요.",
      ],
      jealousy: [
        "질투심은 당신이 무엇을 원하는지 명확하게 알려주는 나침반 역할을 하고 있어요.",
        "다른 사람을 부러워한다는 것은 당신도 그것을 이룰 수 있는 가능성이 있다는 뜻이에요.",
        "지금의 질투 감정을 성장의 동력으로 바꿔서 자신만의 길을 만들어갈 수 있어요.",
      ],
      urgency: [
        "조급함은 당신이 목표를 향해 열정적으로 나아가고 있다는 증거예요.",
        "모든 것에는 적절한 때가 있으며, 지금은 준비하고 기다리는 시간일 수도 있어요.",
        "천천히 가더라도 꾸준히 가는 것이 결국 더 멀리, 더 확실하게 갈 수 있는 방법이에요.",
      ],
      recognition: [
        "인정받고 싶은 마음은 당신이 가치 있는 사람이라는 것을 스스로 알고 있다는 뜻이에요.",
        "가장 중요한 인정은 자기 자신으로부터 받는 것이며, 그것이 진정한 자신감의 원천이에요.",
        "당신의 가치는 다른 사람의 평가에 의존하지 않으며, 이미 충분히 소중한 존재예요.",
      ],
      inferiority: [
        "다른 사람과 비교하는 마음은 당신이 성장하고 싶어하는 욕구의 표현이에요.",
        "모든 사람에게는 고유한 장점과 속도가 있으며, 당신만의 특별한 강점이 분명히 있어요.",
        "지금의 부족함을 느끼는 것이 앞으로 더 발전할 수 있는 출발점이 될 거예요.",
      ],
    };

    return reframingTemplates[emotion as keyof typeof reframingTemplates] || [
      "이 경험을 통해 당신은 더 성숙하고 지혜로운 사람이 되어가고 있어요.",
      "모든 감정은 당신을 더 깊이 이해하게 도와주는 소중한 신호예요.",
      "지금의 어려움은 미래의 더 강한 당신을 만들어가는 과정이에요.",
    ];
  }

  private generateReframingPrompt(): string {
    return `
    사용자가 ${this.state.emotionName} 감정에 대해 다음과 같이 답변했습니다:
    
    상황: ${this.state.responses[0]}
    추가 감정: ${this.state.responses[1]}
    
    이를 바탕으로 긍정적이고 건설적인 관점으로 리프레이밍할 수 있는 문장 3개를 만들어주세요.
    각 문장은 한국어로, 따뜻하고 격려하는 톤으로 작성해주세요.
    `;
  }

  getConversationData() {
    return {
      emotion: this.state.selectedEmotion,
      emotionName: this.state.emotionName,
      responses: this.state.responses,
      context: this.state.context,
    };
  }

  getCurrentStage() {
    return this.state.stage;
  }

  private handleConclusion(userInput: string): ConversationResponse {
    const input = userInput.toLowerCase().trim();
    
    // Handle requests for different reframings
    if (input.includes('다시') || input.includes('다른') || input.includes('더')) {
      const newReframings = this.generateAlternativeReframings();
      return {
        message: "다른 관점으로 다시 말씀드릴게요.\n\n" +
          newReframings.map((r, i) => `${i + 1}. ${r}`).join('\n\n') +
          "\n\n이번에는 어떠세요?",
        shouldListen: true,
        isComplete: false,
      };
    }
    
    // Handle positive responses
    if (this.affirmativePatterns.some(pattern => input.includes(pattern))) {
      return {
        message: "좋아요! 이런 새로운 관점들이 도움이 되었기를 바라요. 오늘의 리프레이밍 저널이 완성되었습니다. 언제든 다시 대화하러 오세요!",
        shouldListen: false,
        isComplete: true,
      };
    }
    
    // Default conclusion
    return {
      message: "오늘 대화해주셔서 감사해요. 새로운 관점으로 생각해보는 시간이 되었기를 바랍니다. 저널이 저장되었어요!",
      shouldListen: false,
      isComplete: true,
    };
  }

  private generateAlternativeReframings(): string[] {
    const emotion = this.state.selectedEmotion;
    
    const alternativeTemplates = {
      shame: [
        "실수는 인간다운 것이며, 이를 인정하고 배우려는 자세가 진정한 용기예요.",
        "지금의 부끄러움이 앞으로 더 현명한 판단을 할 수 있게 도와주는 내면의 나침반이에요.",
        "완벽하지 않아도 괜찮다는 것을 받아들이는 것이 진정한 자기 수용의 시작이에요.",
      ],
      emptiness: [
        "비어있다고 느끼는 순간이 새로운 것들로 채워질 준비가 된 상태일 수 있어요.",
        "공허함 뒤에 숨어있는 진정한 욕구와 필요를 발견할 수 있는 기회예요.",
        "때로는 고요함 속에서 진정한 자신의 목소리를 들을 수 있어요.",
      ],
      jealousy: [
        "질투심은 당신의 잠재력이 무엇인지 알려주는 신호등 같은 역할을 하고 있어요.",
        "다른 사람의 성공을 보며 느끼는 감정을 자신만의 동기부여로 바꿀 수 있어요.",
        "질투보다는 영감을 받는 관점으로 바꿔보면 새로운 가능성이 보일 거예요.",
      ],
      urgency: [
        "급한 마음은 당신이 얼마나 간절히 목표를 원하는지 보여주는 열정의 표현이에요.",
        "때로는 기다림이 더 좋은 결과를 가져다주는 지혜로운 선택일 수 있어요.",
        "자신만의 속도로 나아가는 것이 결국 가장 지속 가능한 방법이에요.",
      ],
      recognition: [
        "자신의 가치를 스스로 인정하는 것이 다른 누구의 승인보다 더 의미 있고 지속적이에요.",
        "인정받고 싶은 마음은 당신이 소중한 존재라는 것을 이미 알고 있다는 증거예요.",
        "내 안의 목소리에 귀 기울이는 것이 진정한 자신감의 출발점이에요.",
      ],
      inferiority: [
        "각자의 출발점과 속도가 다르기 때문에, 자신만의 페이스로 가는 것이 가장 현명해요.",
        "지금 부족함을 느끼는 부분이 앞으로 가장 크게 성장할 수 있는 영역이에요.",
        "비교보다는 어제의 나와 오늘의 나를 비교해보는 것이 더 건설적이에요.",
      ],
    };

    return alternativeTemplates[emotion as keyof typeof alternativeTemplates] || [
      "당신의 감정을 솔직하게 마주하는 것 자체가 이미 큰 성장이에요.",
      "이 경험이 더 깊은 자기 이해로 이어질 거예요.",
      "지금 이 순간도 당신의 소중한 성장 과정의 일부예요.",
    ];
  }
}