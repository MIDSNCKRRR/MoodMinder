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
    if (draggedFeeling) {
      onFeelingChange(partId, draggedFeeling);
      setDraggedFeeling(null);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-stone-600 text-center">Head & Neck</h4>
      
      {/* Head SVG */}
      <div className="relative bg-white/80 p-6 rounded-stone mx-auto" style={{ width: '200px', height: '240px' }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Head outline */}
          <ellipse cx="50" cy="45" rx="25" ry="30" fill="none" stroke="#d6d3d1" strokeWidth="2"/>
          
          {/* Neck */}
          <rect x="45" y="70" width="10" height="15" fill="none" stroke="#d6d3d1" strokeWidth="2"/>
          
          {/* Interactive areas */}
          {headParts.map((part) => {
            const isSelected = selectedPart === part.id;
            const hasFeeling = selectedFeelings[part.id];
            return (
              <circle
                key={part.id}
                cx={part.x}
                cy={part.y}
                r="6"
                fill={isSelected ? "#f97316" : hasFeeling ? "#22c55e" : "#e7e5e4"}
                stroke={isSelected ? "#ea580c" : hasFeeling ? "#16a34a" : "#a8a29e"}
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200 hover:fill-orange-300"
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