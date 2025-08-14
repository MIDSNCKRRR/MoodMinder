import { useState, useCallback, useRef, useEffect } from 'react';

interface UseTextToSpeechOptions {
  voice?: SpeechSynthesisVoice | null;
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  onPause?: () => void;
  onResume?: () => void;
}

interface UseTextToSpeechReturn {
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  currentVoice: SpeechSynthesisVoice | null;
  setVoice: (voice: SpeechSynthesisVoice | null) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
}

export const useTextToSpeech = (
  options: UseTextToSpeechOptions = {}
): UseTextToSpeechReturn => {
  const {
    voice = null,
    rate = 1,
    pitch = 1,
    volume = 1,
    lang = 'ko-KR',
    onStart,
    onEnd,
    onError,
    onPause,
    onResume,
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(voice);
  const [currentRate, setCurrentRate] = useState(rate);
  const [currentPitch, setCurrentPitch] = useState(pitch);
  const [currentVolume, setCurrentVolume] = useState(volume);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Try to find a Korean voice if no voice is set
      if (!currentVoice && availableVoices.length > 0) {
        const koreanVoice = availableVoices.find(v => 
          v.lang.startsWith('ko') || v.name.includes('Korean')
        );
        setCurrentVoice(koreanVoice || availableVoices[0]);
      }
    };

    loadVoices();
    
    // Some browsers load voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isSupported, currentVoice]);

  const speak = useCallback((text: string) => {
    if (!isSupported) {
      onError?.('Text-to-speech is not supported in this browser');
      return;
    }

    if (!text.trim()) {
      onError?.('No text provided');
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = currentVoice;
    utterance.rate = currentRate;
    utterance.pitch = currentPitch;
    utterance.volume = currentVolume;
    utterance.lang = lang;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      onStart?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      onEnd?.();
    };

    utterance.onerror = (event) => {
      const errorMessage = `Speech synthesis error: ${event.error}`;
      setIsSpeaking(false);
      setIsPaused(false);
      onError?.(errorMessage);
    };

    utterance.onpause = () => {
      setIsPaused(true);
      onPause?.();
    };

    utterance.onresume = () => {
      setIsPaused(false);
      onResume?.();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, currentVoice, currentRate, currentPitch, currentVolume, lang, onStart, onEnd, onError, onPause, onResume]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.pause();
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported && isPaused) {
      window.speechSynthesis.resume();
    }
  }, [isSupported, isPaused]);

  const setVoice = useCallback((voice: SpeechSynthesisVoice | null) => {
    setCurrentVoice(voice);
  }, []);

  const setRate = useCallback((rate: number) => {
    const clampedRate = Math.max(0.1, Math.min(10, rate));
    setCurrentRate(clampedRate);
  }, []);

  const setPitch = useCallback((pitch: number) => {
    const clampedPitch = Math.max(0, Math.min(2, pitch));
    setCurrentPitch(clampedPitch);
  }, []);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setCurrentVolume(clampedVolume);
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    currentVoice,
    setVoice,
    setRate,
    setPitch,
    setVolume,
  };
};