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
    { id: "eyes", label: "Eyes", x: 50, y: 35 },
    { id: "jaw", label: "Jaw", x: 50, y: 45 },
    { id: "neck", label: "Neck", x: 50, y: 65 },
  ];

  const feelingEmojis = [
    { id: "tense", label: "Tense", emoji: "😬" },
    { id: "relaxed", label: "Relaxed", emoji: "😌" },
    { id: "painful", label: "Painful", emoji: "😣" },
    { id: "warm", label: "Warm", emoji: "🌞" },
    { id: "cold", label: "Cold", emoji: "❄️" },
    { id: "heavy", label: "Heavy", emoji: "⚡" },
    { id: "light", label: "Light", emoji: "🪶" },
    { id: "numb", label: "Numb", emoji: "😶" },
  ];

  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [draggedFeeling, setDraggedFeeling] = useState<string | null>(null);

  const handlePartClick = (partId: string) => {
    setSelectedPart(partId);
  };

  const handleFeelingSelect = (feelingId: string) => {
    if (selectedPart) {
      onFeelingChange(selectedPart, feelingId);
      setSelectedPart(null);
    }
  };

  const handleDragStart = (feelingId: string) => {
    setDraggedFeeling(feelingId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, partId: string) => {
    e.preventDefault();
    if (draggedFeeling) {
      onFeelingChange(partId, draggedFeeling);
      setDraggedFeeling(null);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-stone-600 text-center">Head & Neck</h4>
      
      {/* Head & Neck based on your reference image */}
      <div className="relative bg-white/80 p-6 rounded-stone mx-auto" style={{ width: '200px', height: '240px' }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Clean head silhouette matching your reference exactly */}
          <g>
            {/* Main head shape - perfect circle */}
            <circle 
              cx="50" 
              cy="35" 
              r="20" 
              fill="hsl(270, 12%, 82%)" 
              stroke="hsl(270, 25%, 65%)" 
              strokeWidth="3"
            />
            
            {/* Simple ears - small rounded bumps */}
            <circle 
              cx="32" 
              cy="35" 
              r="4.5" 
              fill="hsl(270, 12%, 82%)" 
              stroke="hsl(270, 25%, 65%)" 
              strokeWidth="3"
            />
            <circle 
              cx="68" 
              cy="35" 
              r="4.5" 
              fill="hsl(270, 12%, 82%)" 
              stroke="hsl(270, 25%, 65%)" 
              strokeWidth="3"
            />
            
            {/* Clean neck curves like in reference */}
            <path 
              d="M42 52
                 Q45 54 50 54
                 Q55 54 58 52
                 L60 68
                 Q58 70 50 70
                 Q42 70 40 68
                 L42 52 Z" 
              fill="hsl(270, 12%, 82%)" 
              stroke="hsl(270, 25%, 65%)" 
              strokeWidth="3"
            />
          </g>
          
          {/* Interactive areas positioned over the body */}
          {headParts.map((part) => {
            const isSelected = selectedPart === part.id;
            const hasFeeling = selectedFeelings[part.id];
            return (
              <circle
                key={part.id}
                cx={part.x}
                cy={part.y}
                r="8"
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
    </div>
  );
}