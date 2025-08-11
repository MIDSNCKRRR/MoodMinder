import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, RotateCcw, X } from 'lucide-react';

interface BoxBreathingProps {
  onExit: () => void;
  showExitButton?: boolean;
}

type BreathingPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

const phaseInstructions = {
  inhale: 'Breathe In',
  hold1: 'Hold',
  exhale: 'Breathe Out', 
  hold2: 'Hold'
};

const phaseColors = {
  inhale: 'hsl(120, 50%, 70%)', // Green
  hold1: 'hsl(45, 50%, 70%)',  // Yellow
  exhale: 'hsl(200, 50%, 70%)', // Blue
  hold2: 'hsl(280, 50%, 70%)'  // Purple
};

export function BoxBreathing({ onExit, showExitButton = true }: BoxBreathingProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [seconds, setSeconds] = useState(4);
  const [cycles, setCycles] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);

  // Generate white noise using Web Audio API
  useEffect(() => {
    let audioContext: AudioContext | null = null;
    let gainNode: GainNode | null = null;
    let whiteNoiseNode: AudioBufferSourceNode | null = null;

    const startWhiteNoise = async () => {
      try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create white noise buffer
        const bufferSize = audioContext.sampleRate * 2; // 2 seconds of audio
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        // Generate white noise
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        
        whiteNoiseNode = audioContext.createBufferSource();
        whiteNoiseNode.buffer = buffer;
        whiteNoiseNode.loop = true;
        
        gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Very quiet
        
        whiteNoiseNode.connect(gainNode);
        gainNode.connect(audioContext.destination);
        whiteNoiseNode.start();
      } catch (error) {
        console.log('Audio not supported or blocked');
      }
    };

    if (isPlaying) {
      startWhiteNoise();
    }

    return () => {
      if (whiteNoiseNode) whiteNoiseNode.stop();
      if (audioContext) audioContext.close();
    };
  }, [isPlaying]);

  // Breathing cycle timer
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          // Move to next phase
          setPhase(current => {
            switch (current) {
              case 'inhale': return 'hold1';
              case 'hold1': return 'exhale';
              case 'exhale': return 'hold2';
              case 'hold2': 
                setCycles(c => c + 1);
                return 'inhale';
              default: return 'inhale';
            }
          });
          
          // Vibration on phase change
          if (navigator.vibrate) {
            navigator.vibrate(100);
          }
          
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Session timer
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const toggleBreathing = () => {
    setIsPlaying(!isPlaying);
  };

  const resetSession = () => {
    setIsPlaying(false);
    setPhase('inhale');
    setSeconds(4);
    setCycles(0);
    setSessionTime(0);
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate square size based on phase
  const getSquareSize = () => {
    const baseSize = 120;
    const maxSize = 200;
    
    if (phase === 'inhale') {
      const progress = (4 - seconds) / 4;
      return baseSize + (maxSize - baseSize) * progress;
    } else if (phase === 'exhale') {
      const progress = seconds / 4;
      return baseSize + (maxSize - baseSize) * progress;
    }
    return phase === 'hold1' ? maxSize : baseSize;
  };

  return (
    <div className="space-y-4">
      {/* Exit Button */}
      {showExitButton && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onExit}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Session Stats */}
      <Card className="rounded-organic stone-shadow border-0 bg-white/90">
        <CardContent className="p-4">
          <div className="flex justify-between text-center">
            <div>
              <p className="text-stone-500 text-sm">Time</p>
              <p className="font-medium text-stone-700">{formatTime(sessionTime)}</p>
            </div>
            <div>
              <p className="text-stone-500 text-sm">Cycles</p>
              <p className="font-medium text-stone-700">{cycles}</p>
            </div>
            <div>
              <p className="text-stone-500 text-sm">Phase</p>
              <p className="font-medium text-stone-700">{phaseInstructions[phase]}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breathing Animation */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative flex items-center justify-center h-48">
          <motion.div
            className="rounded-lg shadow-lg flex items-center justify-center"
            animate={{
              width: getSquareSize(),
              height: getSquareSize(),
              backgroundColor: phaseColors[phase],
            }}
            transition={{
              duration: 1,
              ease: "easeInOut"
            }}
          >
            <div className="text-white text-center">
              <p className="text-xl font-medium">{phaseInstructions[phase]}</p>
              <p className="text-3xl font-bold">{seconds}</p>
            </div>
          </motion.div>
        </div>

        {/* Instructions */}
        <Card className="rounded-organic stone-shadow border-0 bg-white/80">
          <CardContent className="p-3 text-center">
            <p className="text-stone-600 text-xs">
              Follow the square: breathe in as it expands, hold when it pauses, breathe out as it contracts.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <Button
          onClick={toggleBreathing}
          className="flex-1 font-medium rounded-stone"
          style={{
            background: isPlaying 
              ? "linear-gradient(to right, hsl(0, 60%, 60%), hsl(0, 65%, 50%))"
              : "linear-gradient(to right, hsl(120, 60%, 60%), hsl(120, 65%, 50%))",
            color: "white"
          }}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Start
            </>
          )}
        </Button>

        <Button
          onClick={resetSession}
          variant="outline"
          className="px-4 rounded-stone border-stone-300"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}