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
          {/* Professional head silhouette based on reference image */}
          <g>
            {/* Main head shape - clean rounded silhouette */}
            <path 
              d="M50 10
                 C60 10 68 16 72 24
                 C75 30 76 37 75 44
                 C74 50 71 55 67 58
                 C65 60 64 62 64 64
                 C64 66 65 67 66 68
                 L64 70
                 C62 72 59 73 56 74
                 L44 74
                 C41 73 38 72 36 70
                 L34 68
                 C35 67 36 66 36 64
                 C36 62 35 60 33 58
                 C29 55 26 50 25 44
                 C24 37 25 30 28 24
                 C32 16 40 10 50 10 Z" 
              fill="hsl(270, 18%, 82%)" 
              stroke="hsl(270, 25%, 65%)" 
              strokeWidth="2.5"
            />
            
            {/* Left ear */}
            <ellipse 
              cx="28" 
              cy="42" 
              rx="3.5" 
              ry="7" 
              fill="hsl(270, 18%, 82%)" 
              stroke="hsl(270, 25%, 65%)" 
              strokeWidth="2"
            />
            
            {/* Right ear */}
            <ellipse 
              cx="72" 
              cy="42" 
              rx="3.5" 
              ry="7" 
              fill="hsl(270, 18%, 82%)" 
              stroke="hsl(270, 25%, 65%)" 
              strokeWidth="2"
            />
            
            {/* Neck - clean cylindrical shape */}
            <path 
              d="M44 74
                 C46 75 48 76 50 76
                 C52 76 54 75 56 74
                 L58 82
                 C56 85 54 87 50 87
                 C46 87 44 85 42 82
                 L44 74 Z" 
              fill="hsl(270, 18%, 82%)" 
              stroke="hsl(270, 25%, 65%)" 
              strokeWidth="2.5"
            />
            
            {/* Subtle facial features for anatomical reference - very light */}
            <g opacity="0.25">
              {/* Eyes indication */}
              <ellipse cx="43" cy="38" rx="1.5" ry="0.8" fill="hsl(270, 30%, 70%)"/>
              <ellipse cx="57" cy="38" rx="1.5" ry="0.8" fill="hsl(270, 30%, 70%)"/>
              
              {/* Nose indication */}
              <path d="M48 47 L50 50 L52 47" 
                    fill="none" 
                    stroke="hsl(270, 30%, 70%)" 
                    strokeWidth="1.2" 
                    strokeLinecap="round"/>
              
              {/* Mouth indication */}
              <path d="M46 54 Q50 56 54 54" 
                    fill="none" 
                    stroke="hsl(270, 30%, 70%)" 
                    strokeWidth="1" 
                    strokeLinecap="round"/>
            </g>
          </g>
          
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