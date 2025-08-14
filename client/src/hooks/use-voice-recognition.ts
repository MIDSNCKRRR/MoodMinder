import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface UseVoiceRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

interface UseVoiceRecognitionReturn {
  transcript: string;
  interimTranscript: string;
  finalTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export const useVoiceRecognition = (
  options: UseVoiceRecognitionOptions = {}
): UseVoiceRecognitionReturn => {
  const {
    continuous = true,
    interimResults = true,
    language = 'ko-KR',
    onResult,
    onError,
    onStart,
    onEnd,
  } = options;

  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    // 레퍼런스와 동일한 방식으로 초기화
    const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = "ko"; // 레퍼런스와 동일하게 설정
    recognition.maxAlternatives = 5; // 레퍼런스와 동일하게 설정
    
    // 브라우저 감지 개선
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isChrome = /Chrome/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !isChrome;
    
    console.log('🔍 Browser detection:', {
      userAgent,
      isIOS,
      isMobile, 
      isChrome,
      isSafari,
      platform: navigator.platform
    });
    
    if (isIOS && isSafari) {
      console.log('🍎 iOS Safari detected - applying special settings');
      recognition.continuous = false; 
      recognition.interimResults = true;
    } else {
      console.log('💻 Desktop/Chrome detected - using standard settings');
      // 표준 설정 사용
    }

    // 레퍼런스 방식: addEventListener 사용
    recognition.addEventListener("start", () => {
      console.log('🎤 Speech recognition started');
      console.log('📱 Recognition state:', {
        continuous: recognition.continuous,
        interimResults: recognition.interimResults,
        lang: recognition.lang
      });
      setIsListening(true);
      setError(null);
      onStart?.();
    });

    recognition.addEventListener("speechstart", () => {
      console.log('🗣️ Speech detected');
    });

    recognition.addEventListener("speechend", () => {
      console.log('🔇 Speech ended');
    });

    recognition.addEventListener("result", (event: SpeechRecognitionEvent) => {
      console.log('📝 Speech recognition result received');
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        console.log(`Result ${i}:`, { 
          transcript: result[0].transcript, 
          isFinal: result.isFinal,
          confidence: result[0].confidence 
        });
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      console.log('📊 Processed transcripts:', { interimTranscript, finalTranscript });
      setInterimTranscript(interimTranscript);
      
      if (finalTranscript) {
        console.log('✅ Setting final transcript:', finalTranscript);
        setFinalTranscript(prev => prev + finalTranscript);
        setTranscript(prev => prev + finalTranscript);
        onResult?.(finalTranscript, true);
      }
      
      // interimTranscript는 항상 업데이트 (실시간 표시용)
      if (interimTranscript) {
        console.log('⏳ Setting interim transcript:', interimTranscript);
        onResult?.(interimTranscript, false);
      }
    });

    recognition.addEventListener("error", (event: SpeechRecognitionErrorEvent) => {
      const errorDetails = {
        error: event.error,
        message: event.message,
        timeStamp: event.timeStamp,
        type: event.type
      };
      
      console.error('❌ Speech recognition error details:', errorDetails);
      
      let errorMessage = `Speech recognition error: ${event.error}`;
      let userMessage = '음성 인식 중 오류가 발생했습니다.';
      
      // 에러 타입별 상세 처리
      switch (event.error) {
        case 'not-allowed':
          userMessage = '마이크 권한이 거부되었습니다. 브라우저에서 마이크 권한을 허용해주세요.';
          break;
        case 'network':
          userMessage = '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.';
          break;
        case 'audio-capture':
          userMessage = '마이크에 접근할 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.';
          break;
        case 'no-speech':
          userMessage = '음성이 감지되지 않았습니다. 다시 시도해주세요.';
          console.log('ℹ️ No speech detected - this is normal if user is silent');
          break;
        case 'aborted':
          userMessage = '음성 인식이 중단되었습니다.';
          break;
        case 'language-not-supported':
          userMessage = '지원되지 않는 언어입니다.';
          break;
        default:
          userMessage = `알 수 없는 오류가 발생했습니다: ${event.error}`;
      }
      
      setError(userMessage);
      setIsListening(false);
      onError?.(userMessage);
      
      // no-speech 에러는 사용자에게 알리지 않음 (정상적인 상황)
      if (event.error !== 'no-speech') {
        console.error('🚨 User-facing error:', userMessage);
      }
    });

    recognition.addEventListener("end", () => {
      console.log('⏹️ Speech recognition ended');
      setIsListening(false);
      setInterimTranscript('');
      onEnd?.();
    });

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, [continuous, interimResults, language, onResult, onError, onStart, onEnd, isSupported]);

  const startListening = useCallback(() => {
    console.log('🎯 startListening called', { isSupported, isListening, hasRecognition: !!recognitionRef.current });
    
    if (!isSupported) {
      console.log('❌ Speech recognition not supported');
      setError('Speech recognition is not supported');
      return;
    }

    if (!recognitionRef.current) {
      console.log('❌ Recognition reference is null');
      setError('Speech recognition not initialized');
      return;
    }

    // 표준 시작 로직
    if (!isListening && recognitionRef.current) {
      try {
        console.log('🚀 Starting speech recognition...');
        recognitionRef.current.start();
      } catch (err) {
        console.error('❌ Failed to start speech recognition:', err);
        setError(`Speech recognition failed: ${err}`);
      }
    } else {
      console.log('⚠️ Cannot start speech recognition:', { 
        isListening, 
        hasRecognition: !!recognitionRef.current,
        reason: isListening ? 'Already listening' : 'No recognition reference'
      });
    }
  }, [isListening, isSupported]);

  const stopListening = useCallback(() => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setFinalTranscript('');
    setError(null);
  }, []);

  return {
    transcript,
    interimTranscript,
    finalTranscript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
};