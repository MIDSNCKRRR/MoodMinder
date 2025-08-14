import { useState, useCallback, useRef } from 'react';
import { useVoiceRecognition } from './use-voice-recognition';
import { useTextToSpeech } from './use-text-to-speech';

interface VoiceMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseVoiceConversationOptions {
  autoListen?: boolean; // Start listening after TTS ends
  silenceTimeout?: number; // ms to wait for user input before prompting
  onConversationUpdate?: (messages: VoiceMessage[]) => void;
  onUserSpeech?: (transcript: string) => void;
  onAssistantSpeech?: (text: string) => void;
}

interface UseVoiceConversationReturn {
  // Conversation state
  messages: VoiceMessage[];
  isConversationActive: boolean;
  isWaitingForUser: boolean;
  
  // Voice states (from underlying hooks)
  isListening: boolean;
  isSpeaking: boolean;
  currentTranscript: string;
  
  // Controls
  startConversation: () => void;
  endConversation: () => void;
  speakAndListen: (text: string) => void;
  addUserMessage: (text: string) => void;
  addAssistantMessage: (text: string) => void;
  clearConversation: () => void;
  
  // Voice controls
  startListening: () => void;
  stopListening: () => void;
  stopSpeaking: () => void;
  
  // Support flags
  isVoiceSupported: boolean;
  error: string | null;
}

export const useVoiceConversation = (
  options: UseVoiceConversationOptions = {}
): UseVoiceConversationReturn => {
  const {
    autoListen = true,
    silenceTimeout = 3000,
    onConversationUpdate,
    onUserSpeech,
    onAssistantSpeech,
  } = options;

  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [isWaitingForUser, setIsWaitingForUser] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageIdCounter = useRef(0);

  // Voice Recognition Hook
  const {
    finalTranscript,
    isListening,
    isSupported: isRecognitionSupported,
    startListening: startVoiceRecognition,
    stopListening: stopVoiceRecognition,
    resetTranscript,
    error: recognitionError,
  } = useVoiceRecognition({
    continuous: false,
    interimResults: true,
    onResult: (transcript, isFinal) => {
      if (isFinal && transcript.trim()) {
        addUserMessage(transcript.trim());
        onUserSpeech?.(transcript.trim());
        resetTranscript();
      }
    },
    onEnd: () => {
      setIsWaitingForUser(false);
    },
    onError: (error) => {
      setError(error);
      setIsWaitingForUser(false);
    },
  });

  // Text-to-Speech Hook (kept for manual speech if needed)
  const {
    speak,
    stop: stopTTS,
    isSpeaking,
    isSupported: isTTSSupported,
    error: ttsError,
  } = useTextToSpeech({
    rate: 0.9,
    pitch: 1,
    volume: 0.8,
    onError: (error) => {
      setError(error);
    },
  });

  const isVoiceSupported = isRecognitionSupported && isTTSSupported;

  // Generate unique message ID
  const generateMessageId = () => {
    messageIdCounter.current += 1;
    return `msg_${messageIdCounter.current}_${Date.now()}`;
  };

  // Add user message
  const addUserMessage = useCallback((content: string) => {
    const message: VoiceMessage = {
      id: generateMessageId(),
      type: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => {
      const updated = [...prev, message];
      onConversationUpdate?.(updated);
      return updated;
    });

    setIsWaitingForUser(false);
    
    // Clear silence timeout when user speaks
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, [onConversationUpdate]);

  // Add assistant message
  const addAssistantMessage = useCallback((content: string) => {
    const message: VoiceMessage = {
      id: generateMessageId(),
      type: 'assistant',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => {
      const updated = [...prev, message];
      onConversationUpdate?.(updated);
      return updated;
    });
  }, [onConversationUpdate]);

  // Add text message and optionally start listening (no speech)
  const speakAndListen = useCallback((text: string) => {
    addAssistantMessage(text);
    onAssistantSpeech?.(text);
    
    // Start listening automatically after adding message
    if (autoListen && isConversationActive) {
      setTimeout(() => {
        startListening();
      }, 1000); // Give user time to read the message
    }
  }, [addAssistantMessage, onAssistantSpeech, autoListen, isConversationActive, startListening]);

  // Start listening for user input
  const startListening = useCallback(() => {
    if (!isVoiceSupported) {
      setError('Voice features are not supported in this browser');
      return;
    }

    if (!isSpeaking && isConversationActive) {
      setIsWaitingForUser(true);
      startVoiceRecognition();

      // Set timeout for silence
      silenceTimeoutRef.current = setTimeout(() => {
        if (isWaitingForUser) {
          stopVoiceRecognition();
          setIsWaitingForUser(false);
        }
      }, silenceTimeout);
    }
  }, [isVoiceSupported, isSpeaking, isConversationActive, isWaitingForUser, startVoiceRecognition, stopVoiceRecognition, silenceTimeout]);

  // Stop listening
  const stopListening = useCallback(() => {
    stopVoiceRecognition();
    setIsWaitingForUser(false);
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, [stopVoiceRecognition]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    stopTTS();
  }, [stopTTS]);

  // Start conversation
  const startConversation = useCallback(() => {
    if (!isVoiceSupported) {
      setError('Voice features are not supported in this browser');
      return;
    }

    setIsConversationActive(true);
    setError(null);
    clearConversation();
  }, [isVoiceSupported]);

  // End conversation
  const endConversation = useCallback(() => {
    setIsConversationActive(false);
    setIsWaitingForUser(false);
    stopListening();
    stopSpeaking();
  }, [stopListening, stopSpeaking]);

  // Clear conversation history
  const clearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
    resetTranscript();
  }, [resetTranscript]);

  // Combine all errors
  const combinedError = error || recognitionError || ttsError;

  return {
    // Conversation state
    messages,
    isConversationActive,
    isWaitingForUser,
    
    // Voice states
    isListening,
    isSpeaking,
    currentTranscript: finalTranscript,
    
    // Controls
    startConversation,
    endConversation,
    speakAndListen,
    addUserMessage,
    addAssistantMessage,
    clearConversation,
    
    // Voice controls
    startListening,
    stopListening,
    stopSpeaking,
    
    // Support and errors
    isVoiceSupported,
    error: combinedError,
  };
};