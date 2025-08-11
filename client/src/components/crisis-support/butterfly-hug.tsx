import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, RotateCcw, X } from 'lucide-react';

interface ButterflyHugProps {
  onExit: () => void;
  showExitButton?: boolean;
}

type HugPhase = 'left' | 'right';

const phaseInstructions = {
  left: 'Left Hand',
  right: 'Right Hand'
};

export function ButterflyHug({ onExit, showExitButton = true }: ButterflyHugProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<HugPhase>('left');
  const [seconds, setSeconds] = useState(3);
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
        gainNode.gain.setValueAtTime(0.08, audioContext.currentTime); // Very quiet
        
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

  // Butterfly hug cycle timer
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          // Move to next phase
          setPhase(current => {
            if (current === 'left') {
              return 'right';
            } else {
              setCycles(c => c + 1);
              return 'left';
            }
          });
          
          // Gentle vibration on each tap
          if (navigator.vibrate) {
            navigator.vibrate(150);
          }
          
          return 3;
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

  const toggleHug = () => {
    setIsPlaying(!isPlaying);
  };

  const resetSession = () => {
    setIsPlaying(false);
    setPhase('left');
    setSeconds(3);
    setCycles(0);
    setSessionTime(0);
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
              <p className="text-stone-500 text-sm">Current</p>
              <p className="font-medium text-stone-700">{phaseInstructions[phase]}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Butterfly Hug Animation */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative flex items-center justify-center h-64">
          {/* Body silhouette */}
          <div className="absolute w-20 h-32 bg-gradient-to-b from-blue-200 to-blue-300 rounded-full opacity-80"></div>
          
          {/* Left arm */}
          <motion.div
            className="absolute w-12 h-24 bg-gradient-to-r from-blue-300 to-blue-400 rounded-full origin-bottom"
            style={{
              left: '35%',
              top: '20%',
            }}
            animate={{
              rotate: phase === 'left' ? -25 : -10,
              scale: phase === 'left' ? 1.1 : 1,
            }}
            transition={{
              duration: 0.8,
              ease: "easeInOut"
            }}
          />
          
          {/* Right arm */}
          <motion.div
            className="absolute w-12 h-24 bg-gradient-to-l from-blue-300 to-blue-400 rounded-full origin-bottom"
            style={{
              right: '35%',
              top: '20%',
            }}
            animate={{
              rotate: phase === 'right' ? 25 : 10,
              scale: phase === 'right' ? 1.1 : 1,
            }}
            transition={{
              duration: 0.8,
              ease: "easeInOut"
            }}
          />

          {/* Left hand */}
          <motion.div
            className="absolute w-6 h-6 bg-blue-400 rounded-full"
            style={{
              left: '25%',
              top: '45%',
            }}
            animate={{
              scale: phase === 'left' ? 1.3 : 1,
              backgroundColor: phase === 'left' ? 'hsl(200, 70%, 60%)' : 'hsl(200, 50%, 70%)',
            }}
            transition={{
              duration: 0.8,
              ease: "easeInOut"
            }}
          />

          {/* Right hand */}
          <motion.div
            className="absolute w-6 h-6 bg-blue-400 rounded-full"
            style={{
              right: '25%',
              top: '45%',
            }}
            animate={{
              scale: phase === 'right' ? 1.3 : 1,
              backgroundColor: phase === 'right' ? 'hsl(200, 70%, 60%)' : 'hsl(200, 50%, 70%)',
            }}
            transition={{
              duration: 0.8,
              ease: "easeInOut"
            }}
          />

          {/* Tap indicator */}
          <motion.div
            className="absolute text-center"
            style={{
              top: '70%',
            }}
            animate={{
              scale: isPlaying ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 1,
              repeat: isPlaying ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            <div className="text-blue-600 text-xl font-medium">
              {phaseInstructions[phase]} Tap
            </div>
            <div className="text-blue-500 text-2xl font-bold">
              {seconds}
            </div>
          </motion.div>

          {/* Heart pulse effect */}
          {isPlaying && (
            <motion.div
              className="absolute w-8 h-8 rounded-full border-2 border-pink-300"
              style={{
                top: '35%',
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.8, 0.3, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </div>

        {/* Instructions */}
        <Card className="rounded-organic stone-shadow border-0 bg-white/80">
          <CardContent className="p-3 text-center">
            <p className="text-stone-600 text-xs">
              Cross your arms and gently tap your shoulders alternately for a soothing, calming rhythm.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <Button
          onClick={toggleHug}
          className="flex-1 font-medium rounded-stone"
          style={{
            background: isPlaying 
              ? "linear-gradient(to right, hsl(0, 60%, 60%), hsl(0, 65%, 50%))"
              : "linear-gradient(to right, hsl(200, 60%, 60%), hsl(200, 65%, 50%))",
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