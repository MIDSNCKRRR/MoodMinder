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

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      onStart?.();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setInterimTranscript(interimTranscript);
      
      if (finalTranscript) {
        setFinalTranscript(prev => prev + finalTranscript);
        setTranscript(prev => prev + finalTranscript);
        onResult?.(finalTranscript, true);
      } else if (interimTranscript) {
        onResult?.(interimTranscript, false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = `Speech recognition error: ${event.error}`;
      setError(errorMessage);
      setIsListening(false);
      onError?.(errorMessage);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      onEnd?.();
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, [continuous, interimResults, language, onResult, onError, onStart, onEnd, isSupported]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported');
      return;
    }

    if (!isListening && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        setError('Failed to start speech recognition');
      }
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