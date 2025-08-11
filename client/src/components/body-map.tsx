import { useState } from "react";

interface BodyMapProps {
  selectedAreas: string[];
  onAreaSelect: (area: string) => void;
}

const bodyAreas = [
  { id: "head", x: "50%", y: "8%", label: "Head" },
  { id: "chest", x: "50%", y: "25%", label: "Chest" },
  { id: "stomach", x: "50%", y: "40%", label: "Stomach" },
  { id: "arms", x: "30%", y: "25%", label: "Arms" },
  { id: "legs", x: "50%", y: "65%", label: "Legs" },
];

export default function BodyMap({ selectedAreas, onAreaSelect }: BodyMapProps) {
  return (
    <div className="flex justify-center">
      <div className="relative w-20 h-32 bg-stone-200 rounded-full" style={{ borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%" }}>
        {/* Head */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-stone-300 rounded-full"></div>
        
        {/* Body Areas */}
        {bodyAreas.map((area) => (
          <button
            key={area.id}
            onClick={() => onAreaSelect(area.id)}
            className={`
              absolute w-4 h-4 rounded-full transition-all duration-300
              ${selectedAreas.includes(area.id) 
                ? "bg-coral-300 ring-2 ring-coral-400" 
                : "bg-transparent hover:bg-coral-200"
              }
            `}
            style={{
              left: area.x,
              top: area.y,
              transform: "translate(-50%, -50%)"
            }}
            title={area.label}
            data-testid={`body-area-${area.id}`}
          />
        ))}
      </div>
    </div>
  );
}
