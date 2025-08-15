import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import lowerBodyImage from "@assets/image_1754642975195.png";

interface LowerBodyMapProps {
  selectedFeelings: Record<string, string>;
  onFeelingChange: (bodyPart: string, feeling: string) => void;
}

export default function LowerBodyMap({
  selectedFeelings,
  onFeelingChange,
}: LowerBodyMapProps) {
  const lowerBodyParts = [
    { id: "hips", label: "Hips", x: 65, y: 20 },
    { id: "thighs", label: "Thighs", x: 65, y: 40 },
    { id: "knees", label: "Knees", x: 65, y: 60 },
    { id: "calves", label: "Calves", x: 65, y: 80 },
    { id: "feet", label: "Feet", x: 65, y: 95 },
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

  const handleFeelingSelect = (feelingId: string) => {
    if (selectedPart) {
      onFeelingChange(selectedPart, feelingId);
      setSelectedPart(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, feelingId: string) => {
    e.dataTransfer.setData("text/plain", feelingId);
    setDraggedFeeling(feelingId);
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
      <h4 className="font-medium text-stone-600 text-center">Lower Body</h4>

      {/* Your uploaded Lower Body image */}
      <div className="flex justify-center items-center w-full">
        <div className="relative" style={{ width: "280px", height: "360px" }}>
          <img
            src={lowerBodyImage}
            alt="Lower Body"
            className="w-full h-full object-contain"
          />

          {/* Invisible overlay for interactions */}
          <svg
            viewBox="0 0 100 120"
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: "none" }}
          >
            {/* Interactive areas positioned over your image */}
            {lowerBodyParts.map((part) => {
              const isSelected = selectedPart === part.id;
              const hasFeeling = selectedFeelings[part.id];
              return (
                <circle
                  key={part.id}
                  cx={part.x}
                  cy={part.y}
                  r="8"
                  fill={
                    isSelected
                      ? "hsl(15, 65%, 60%)"
                      : hasFeeling
                        ? "hsl(140, 50%, 50%)"
                        : "hsl(270, 15%, 90%)"
                  }
                  stroke={
                    isSelected
                      ? "hsl(15, 70%, 50%)"
                      : hasFeeling
                        ? "hsl(140, 60%, 40%)"
                        : "hsl(270, 25%, 70%)"
                  }
                  strokeWidth="2.5"
                  className="cursor-pointer transition-all duration-300 hover:scale-110"
                  style={{
                    filter: isSelected
                      ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                      : "none",
                    pointerEvents: "auto",
                    transformOrigin: "center",
                  }}
                  onClick={() => handlePartClick(part.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, part.id)}
                  data-testid={`lower-body-part-${part.id}`}
                >
                  <title>{part.label}</title>
                </circle>
              );
            })}
          </svg>

          {/* Part labels using shared CSS class */}
          {lowerBodyParts.map((part) => (
            <div
              key={part.id}
              className="body-part-emoji"
              style={{
                left: `${part.x}%`,
                top: `${part.y}%`,
              }}
            >
              {selectedFeelings[part.id] && (
                <div className="relative group">
                  <span className="text-lg cursor-pointer">
                    {
                      feelingEmojis.find(
                        (f) => f.id === selectedFeelings[part.id],
                      )?.emoji
                    }
                  </span>
                  {/* Delete button - appears on hover */}
                  <button
                    onClick={() => onFeelingChange(part.id, "")}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600"
                    title="Remove feeling"
                    data-testid={`remove-feeling-${part.id}`}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Feeling selection */}
      {selectedPart && (
        <Card className="rounded-stone border border-orange-200">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-stone-600 mb-3">
              How do your{" "}
              {lowerBodyParts
                .find((p) => p.id === selectedPart)
                ?.label.toLowerCase()}{" "}
              feel?
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
                  onDragStart={(e) => handleDragStart(e, feeling.id)}
                  data-testid={`feeling-${feeling.id}`}
                >
                  <span className="text-lg mb-1">{feeling.emoji}</span>
                  <span className="text-xs">{feeling.label}</span>
                </Button>
              ))}
              <Button
                onClick={() => handleFeelingSelect("")}
                variant="outline"
                size="sm"
                className="flex flex-col items-center p-2 h-auto rounded-stone border-dashed border-red-300 text-red-500 hover:bg-red-50"
                data-testid="clear-feeling"
              >
                <span className="text-lg mb-1">🚫</span>
                <span className="text-xs">Clear</span>
              </Button>
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
