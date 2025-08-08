import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HeadMapProps {
  selectedFeelings: Record<string, string>;
  onFeelingChange: (bodyPart: string, feeling: string) => void;
}

export default function HeadMap({ selectedFeelings, onFeelingChange }: HeadMapProps) {
  const headParts = [
    { id: "forehead", label: "Forehead", x: 50, y: 25 },
    { id: "eyes", label: "Eyes", x: 50, y: 40 },
    { id: "jaw", label: "Jaw", x: 50, y: 65 },
    { id: "neck", label: "Neck", x: 50, y: 85 },
  ];

  const feelingEmojis = [
    { id: "tense", emoji: "😬", label: "Tense" },
    { id: "relaxed", emoji: "😌", label: "Relaxed" },
    { id: "warm", emoji: "🔥", label: "Warm" },
    { id: "cool", emoji: "❄️", label: "Cool" },
    { id: "fluttery", emoji: "🦋", label: "Fluttery" },
    { id: "racing", emoji: "💓", label: "Racing" },
    { id: "calm", emoji: "🌊", label: "Calm" },
    { id: "buzzing", emoji: "⚡", label: "Buzzing" },
  ];

  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [draggedFeeling, setDraggedFeeling] = useState<string | null>(null);

  const handlePartClick = (partId: string) => {
    setSelectedPart(partId);
  };

  const handleFeelingSelect = (feeling: string) => {
    if (selectedPart) {
      onFeelingChange(selectedPart, feeling);
      setSelectedPart(null);
    }
  };

  const handleDragStart = (feeling: string) => {
    setDraggedFeeling(feeling);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, partId: string) => {
    e.preventDefault();
    const draggedData = e.dataTransfer.getData("text/plain");
    const feeling = draggedData || draggedFeeling;
    if (feeling) {
      onFeelingChange(partId, feeling);
      setDraggedFeeling(null);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-stone-600 text-center">Head & Neck</h4>
      
      {/* Head SVG - Enhanced with realistic proportions */}
      <div className="relative bg-white/80 p-6 rounded-stone mx-auto" style={{ width: '200px', height: '240px' }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Enhanced head outline based on reference */}
          <path 
            d="M50 15 
               C65 15 75 25 75 40
               C75 45 73 50 70 52
               C68 54 68 56 70 58
               C72 60 72 62 70 64
               L68 66
               C65 68 62 70 58 70
               L42 70
               C38 70 35 68 32 66
               L30 64
               C28 62 28 60 30 58
               C32 56 32 54 30 52
               C27 50 25 45 25 40
               C25 25 35 15 50 15 Z" 
            fill="hsl(270, 20%, 85%)" 
            stroke="hsl(270, 30%, 60%)" 
            strokeWidth="2"
          />
          
          {/* Ears */}
          <ellipse cx="25" cy="40" rx="4" ry="8" fill="hsl(270, 20%, 85%)" stroke="hsl(270, 30%, 60%)" strokeWidth="1.5"/>
          <ellipse cx="75" cy="40" rx="4" ry="8" fill="hsl(270, 20%, 85%)" stroke="hsl(270, 30%, 60%)" strokeWidth="1.5"/>
          
          {/* Neck */}
          <path 
            d="M42 70 
               C45 72 48 73 50 73
               C52 73 55 72 58 70
               L60 75
               C58 78 55 80 50 80
               C45 80 42 78 40 75
               L42 70 Z" 
            fill="hsl(270, 20%, 85%)" 
            stroke="hsl(270, 30%, 60%)" 
            strokeWidth="2"
          />
          
          {/* Facial features for reference */}
          <ellipse cx="42" cy="35" rx="2" ry="1" fill="hsl(270, 30%, 70%)" opacity="0.3"/>
          <ellipse cx="58" cy="35" rx="2" ry="1" fill="hsl(270, 30%, 70%)" opacity="0.3"/>
          <path d="M46 48 C48 50 52 50 54 48" fill="none" stroke="hsl(270, 30%, 70%)" strokeWidth="1" opacity="0.3"/>
          
          {/* Interactive areas with enhanced styling */}
          {headParts.map((part) => {
            const isSelected = selectedPart === part.id;
            const hasFeeling = selectedFeelings[part.id];
            return (
              <circle
                key={part.id}
                cx={part.x}
                cy={part.y}
                r="7"
                fill={isSelected ? "hsl(15, 65%, 60%)" : hasFeeling ? "hsl(140, 50%, 50%)" : "hsl(270, 15%, 90%)"}
                stroke={isSelected ? "hsl(15, 70%, 50%)" : hasFeeling ? "hsl(140, 60%, 40%)" : "hsl(270, 25%, 70%)"}
                strokeWidth="2.5"
                className="cursor-pointer transition-all duration-300 hover:scale-110"
                style={{
                  filter: isSelected ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" : "none"
                }}
                onClick={() => handlePartClick(part.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, part.id)}
                data-testid={`head-part-${part.id}`}
              >
                <title>{part.label}</title>
              </circle>
            );
          })}
        </svg>
        
        {/* Part labels */}
        {headParts.map((part) => (
          <div
            key={part.id}
            className="absolute text-xs text-stone-500 pointer-events-none"
            style={{
              left: `${part.x + 8}%`,
              top: `${part.y - 2}%`,
              transform: 'translateY(-50%)'
            }}
          >
            {selectedFeelings[part.id] && (
              <span className="text-lg">
                {feelingEmojis.find(f => f.id === selectedFeelings[part.id])?.emoji}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Feeling selection */}
      {selectedPart && (
        <Card className="rounded-stone border border-orange-200">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-stone-600 mb-3">
              How does your {headParts.find(p => p.id === selectedPart)?.label.toLowerCase()} feel?
            </p>
            <div className="grid grid-cols-4 gap-2">
              {feelingEmojis.map((feeling) => (
                <Button
                  key={feeling.id}
                  onClick={() => handleFeelingSelect(feeling.id)}
                  variant="outline"
                  size="sm"
                  className="flex flex-col items-center p-2 h-auto rounded-stone cursor-move"
                  draggable
                  onDragStart={() => handleDragStart(feeling.id)}
                  data-testid={`feeling-${feeling.id}`}
                >
                  <span className="text-lg mb-1">{feeling.emoji}</span>
                  <span className="text-xs">{feeling.label}</span>
                </Button>
              ))}
            </div>
            <Button
              onClick={() => setSelectedPart(null)}
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-stone-500"
              data-testid="cancel-feeling"
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Selected feelings summary */}
      {Object.keys(selectedFeelings).length > 0 && (
        <div className="text-center">
          <p className="text-xs text-stone-500 mb-2">Selected feelings:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(selectedFeelings).map(([part, feeling]) => {
              const partLabel = headParts.find(p => p.id === part)?.label;
              const feelingEmoji = feelingEmojis.find(f => f.id === feeling)?.emoji;
              return (
                <span key={part} className="text-sm bg-stone-100 px-2 py-1 rounded-stone">
                  {partLabel}: {feelingEmoji}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}