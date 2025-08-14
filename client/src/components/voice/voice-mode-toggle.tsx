import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff, Play } from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/use-voice-recognition';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { VoiceReframingConversation } from '@/services/voice-reframing-conversation';

interface VoiceModeToggleProps {
  onConversationData?: (data: any) => void;
  className?: string;
}

interface VoiceMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function VoiceModeToggle({ onConversationData, className }: VoiceModeToggleProps) {
  const [conversation] = useState(() => new VoiceReframingConversation());
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [messageIdCounter, setMessageIdCounter] = useState(0);

  // TTS hook for manual speech of AI messages
  const { speak: speakMessage, isSpeaking: isTTSSpeaking, stop: stopTTS } = useTextToSpeech({
    rate: 0.9,
    pitch: 1,
    volume: 0.8,
  });

  // Voice recognition hook
  const {
    finalTranscript,
    isListening,
    isSupported: isVoiceSupported,
    startListening,
    stopListening,
    resetTranscript,
    error: voiceError,
  } = useVoiceRecognition({
    continuous: false,
    interimResults: true,
    onResult: async (transcript, isFinal) => {
      if (isFinal && transcript.trim() && isConversationActive) {
        await handleUserSpeech(transcript.trim());
        resetTranscript();
      }
    },
    onEnd: () => {
      // Voice recognition ended
    },
    onError: (error) => {
      console.error('Voice recognition error:', error);
    },
  });

  const generateMessageId = () => {
    setMessageIdCounter(prev => prev + 1);
    return `msg_${messageIdCounter}_${Date.now()}`;
  };

  const addMessage = (type: 'user' | 'assistant', content: string) => {
    const message: VoiceMessage = {
      id: generateMessageId(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const handleUserSpeech = async (transcript: string) => {
    addMessage('user', transcript);
    
    try {
      const response = await conversation.processUserInput(transcript);
      
      if (response.extractedData) {
        onConversationData?.(response.extractedData);
      }
      
      if (response.message) {
        addMessage('assistant', response.message);
      }
      
      if (response.isComplete) {
        const data = conversation.getConversationData();
        onConversationData?.(data);
        setIsConversationActive(false);
      } else if (response.shouldListen) {
        // Start listening again after a delay
        setTimeout(() => {
          if (isConversationActive) {
            startListening();
          }
        }, 1500);
      }
    } catch (error) {
      console.error('Conversation error:', error);
      addMessage('assistant', '죄송해요, 오류가 발생했습니다. 다시 시도해주세요.');
      setTimeout(() => {
        if (isConversationActive) {
          startListening();
        }
      }, 1500);
    }
  };

  const handleStartConversation = () => {
    if (!isVoiceSupported) {
      alert('음성 기능이 지원되지 않는 브라우저입니다.');
      return;
    }

    conversation.reset();
    setIsConversationActive(true);
    setMessages([]);
    setMessageIdCounter(0);
    
    // Start with initial message (text only)
    const initialMessage = conversation.getInitialMessage();
    addMessage('assistant', initialMessage.message);
    
    // Start listening after showing the message
    setTimeout(() => {
      startListening();
    }, 1500);
  };

  const handleEndConversation = () => {
    setIsConversationActive(false);
    stopListening();
    stopTTS();
    conversation.reset();
  };

  if (!isVoiceSupported) {
    return (
      <Card className={`rounded-organic border-red-200 ${className}`}>
        <CardContent className="p-4 text-center">
          <p className="text-red-600 text-sm">
            음성 기능이 지원되지 않는 브라우저입니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`rounded-organic border-purple-200 ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="text-center">
            <h3 className="font-medium text-stone-800 mb-2">🎤 음성 저널</h3>
            <p className="text-xs text-stone-600">
              {isConversationActive 
                ? '대화가 진행 중입니다' 
                : '음성으로 리프레이밍 저널을 작성해보세요'}
            </p>
          </div>

          {/* Status Indicators */}
          {isConversationActive && (
            <div className="flex items-center justify-center gap-4 py-2">
              <div className={`flex items-center gap-2 text-sm ${
                isListening ? 'text-green-600' : 'text-stone-400'
              }`}>
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                {isListening ? '듣는 중...' : '대기 중'}
              </div>
              
              <div className={`flex items-center gap-2 text-sm ${
                isTTSSpeaking ? 'text-blue-600' : 'text-stone-400'
              }`}>
                {isTTSSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                {isTTSSpeaking ? 'AI 음성 재생' : 'AI는 텍스트'}
              </div>
            </div>
          )}

          {/* Current Transcript */}
          {finalTranscript && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>들은 내용:</strong> {finalTranscript}
              </p>
            </div>
          )}

          {/* Error Display */}
          {voiceError && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">{voiceError}</p>
            </div>
          )}

          {/* Conversation Messages */}
          {messages.length > 0 && (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {messages.slice(-4).map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg text-sm ${
                    message.type === 'user'
                      ? 'bg-blue-50 border border-blue-200 text-blue-800'
                      : 'bg-purple-50 border border-purple-200 text-purple-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <strong className="text-xs">{message.type === 'user' ? '👤 나:' : '🤖 AI:'}</strong>
                      <p className="mt-1 whitespace-pre-line">{message.content}</p>
                    </div>
                    {message.type === 'assistant' && (
                      <Button
                        onClick={() => speakMessage(message.content)}
                        disabled={isTTSSpeaking}
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto text-purple-600 hover:text-purple-800"
                        title="AI 메시지 음성으로 듣기"
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            {!isConversationActive ? (
              <Button
                onClick={handleStartConversation}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-stone hover:from-purple-600 hover:to-purple-700"
                size="sm"
              >
                <Phone className="w-4 h-4 mr-2" />
                음성 대화 시작
              </Button>
            ) : (
              <>
                <Button
                  onClick={stopListening}
                  disabled={!isListening}
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-stone"
                >
                  <MicOff className="w-4 h-4 mr-2" />
                  듣기 중단
                </Button>
                
                <Button
                  onClick={stopTTS}
                  disabled={!isTTSSpeaking}
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-stone"
                >
                  <VolumeX className="w-4 h-4 mr-2" />
                  음성 중단
                </Button>
                
                <Button
                  onClick={handleEndConversation}
                  variant="destructive"
                  size="sm"
                  className="rounded-stone"
                >
                  <PhoneOff className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {/* Instructions */}
          {!isConversationActive && (
            <div className="text-xs text-stone-500 text-center space-y-1">
              <p>💡 음성 대화를 시작하면 AI와 자연스럽게 대화하며 리프레이밍 저널을 작성할 수 있습니다.</p>
              <p>🎤 당신은 음성으로 말하고, AI는 텍스트로 응답합니다. AI 메시지 옆의 ▶️ 버튼으로 음성 재생 가능합니다.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}