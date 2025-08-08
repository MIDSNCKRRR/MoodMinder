import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HeadMapProps {
  selectedFeelings: Record<string, string>;
  onFeelingChange: (bodyPart: string, feeling: string) => void;
}

export default function HeadMap({ selectedFeelings, onFeelingChange }: HeadMapProps) {
  const headParts = [
    { id: "forehead", label: "Forehead", x: 50, y: 22 },
    { id: "eyes", label: "Eyes", x: 50, y: 35 },
    { id: "jaw", label: "Jaw", x: 50, y: 48 },
    { id: "neck", label: "Neck", x: 50, y: 61 },
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
          {/* Head and shoulders silhouette based on reference image */}
          <g>
            {/* Main head shape - perfect circle top */}
            <circle 
              cx="50" 
              cy="35" 
              r="20" 
              fill="hsl(270, 15%, 80%)" 
              stroke="hsl(270, 30%, 60%)" 
              strokeWidth="3"
            />
            
            {/* Left ear - small rounded rectangle */}
            <ellipse 
              cx="32" 
              cy="35" 
              rx="2.5" 
              ry="6" 
              fill="hsl(270, 15%, 80%)" 
              stroke="hsl(270, 30%, 60%)" 
              strokeWidth="2.5"
            />
            
            {/* Right ear - small rounded rectangle */}
            <ellipse 
              cx="68" 
              cy="35" 
              rx="2.5" 
              ry="6" 
              fill="hsl(270, 15%, 80%)" 
              stroke="hsl(270, 30%, 60%)" 
              strokeWidth="2.5"
            />
            
            {/* Neck - straight cylindrical */}
            <rect 
              x="45" 
              y="55" 
              width="10" 
              height="12" 
              fill="hsl(270, 15%, 80%)" 
              stroke="hsl(270, 30%, 60%)" 
              strokeWidth="3"
            />
            
            {/* Shoulders - wide curved base */}
            <path 
              d="M20 67
                 C20 67 25 65 35 65
                 C40 65 45 66 50 67
                 C55 66 60 65 65 65
                 C75 65 80 67 80 67
                 L80 85
                 C80 87 78 88 76 88
                 L24 88
                 C22 88 20 87 20 85
                 L20 67 Z" 
              fill="hsl(270, 15%, 80%)" 
              stroke="hsl(270, 30%, 60%)" 
              strokeWidth="3"
            />
            
            {/* Small shoulder line breaks for realistic look */}
            <line x1="20" y1="75" x2="20" y2="85" stroke="hsl(270, 30%, 60%)" strokeWidth="2"/>
            <line x1="80" y1="75" x2="80" y2="85" stroke="hsl(270, 30%, 60%)" strokeWidth="2"/>
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