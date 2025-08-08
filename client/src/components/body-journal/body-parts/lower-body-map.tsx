import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LowerBodyMapProps {
  selectedFeelings: Record<string, string>;
  onFeelingChange: (bodyPart: string, feeling: string) => void;
}

export default function LowerBodyMap({ selectedFeelings, onFeelingChange }: LowerBodyMapProps) {
  const lowerBodyParts = [
    { id: "hips", label: "Hips", x: 50, y: 25 },
    { id: "thighs", label: "Thighs", x: 50, y: 45 },
    { id: "knees", label: "Knees", x: 50, y: 65 },
    { id: "calves", label: "Calves", x: 50, y: 80 },
    { id: "feet", label: "Feet", x: 50, y: 95 },
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
    if (draggedFeeling) {
      onFeelingChange(partId, draggedFeeling);
      setDraggedFeeling(null);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-stone-600 text-center">Lower Body</h4>
      
      {/* Lower Body SVG */}
      <div className="relative bg-white/80 p-6 rounded-stone mx-auto" style={{ width: '200px', height: '280px' }}>
        <svg viewBox="0 0 100 120" className="w-full h-full">
          {/* Legs outline */}
          <ellipse cx="40" cy="60" rx="8" ry="40" fill="none" stroke="#d6d3d1" strokeWidth="2"/>
          <ellipse cx="60" cy="60" rx="8" ry="40" fill="none" stroke="#d6d3d1" strokeWidth="2"/>
          
          {/* Feet */}
          <ellipse cx="40" cy="105" rx="12" ry="6" fill="none" stroke="#d6d3d1" strokeWidth="2"/>
          <ellipse cx="60" cy="105" rx="12" ry="6" fill="none" stroke="#d6d3d1" strokeWidth="2"/>
          
          {/* Interactive areas */}
          {lowerBodyParts.map((part) => {
            const isSelected = selectedPart === part.id;
            const hasFeeling = selectedFeelings[part.id];
            const leftX = part.id === "feet" ? 40 : part.x - 10;
            const rightX = part.id === "feet" ? 60 : part.x + 10;
            
            return (
              <g key={part.id}>
                {/* Left side */}
                <circle
                  cx={leftX}
                  cy={part.y}
                  r="5"
                  fill={isSelected ? "#f97316" : hasFeeling ? "#22c55e" : "#e7e5e4"}
                  stroke={isSelected ? "#ea580c" : hasFeeling ? "#16a34a" : "#a8a29e"}
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200 hover:fill-orange-300"
                  onClick={() => handlePartClick(part.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, part.id)}
                  data-testid={`lower-body-part-${part.id}-left`}
                >
                  <title>{part.label}</title>
                </circle>
                
                {/* Right side */}
                <circle
                  cx={rightX}
                  cy={part.y}
                  r="5"
                  fill={isSelected ? "#f97316" : hasFeeling ? "#22c55e" : "#e7e5e4"}
                  stroke={isSelected ? "#ea580c" : hasFeeling ? "#16a34a" : "#a8a29e"}
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200 hover:fill-orange-300"
                  onClick={() => handlePartClick(part.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, part.id)}
                  data-testid={`lower-body-part-${part.id}-right`}
                >
                  <title>{part.label}</title>
                </circle>
              </g>
            );
          })}
        </svg>
        
        {/* Feeling emojis */}
        {lowerBodyParts.map((part) => (
          <div
            key={part.id}
            className="absolute text-xs text-stone-500 pointer-events-none"
            style={{
              left: `${part.x + 12}%`,
              top: `${(part.y / 120) * 100 - 2}%`,
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
              How do your {lowerBodyParts.find(p => p.id === selectedPart)?.label.toLowerCase()} feel?
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
              const partLabel = lowerBodyParts.find(p => p.id === part)?.label;
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