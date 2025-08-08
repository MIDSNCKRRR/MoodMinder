import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BodyMap from "@/components/body-map";

interface Step2BodyMapProps {
  selectedBodyAreas: string[];
  onBodyAreasChange: (areas: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2BodyMap({ selectedBodyAreas, onBodyAreasChange, onNext, onBack }: Step2BodyMapProps) {
  const handleBodyAreaSelect = (area: string) => {
    const newAreas = selectedBodyAreas.includes(area) 
      ? selectedBodyAreas.filter(a => a !== area)
      : [...selectedBodyAreas, area];
    onBodyAreasChange(newAreas);
  };

  // Auto-save body areas selection
  useEffect(() => {
    localStorage.setItem('bodyJournal_bodyAreas', JSON.stringify(selectedBodyAreas));
  }, [selectedBodyAreas]);

  return (
    <div className="space-y-6">
      {/* Step Content */}
      <Card 
        className="rounded-organic stone-shadow border-0"
        style={{ background: 'linear-gradient(135deg, hsl(15, 55%, 93%) 0%, hsl(15, 50%, 78%) 100%)' }}
      >
        <CardContent className="p-6">
          <h3 className="font-serif font-semibold text-stone-600 text-xl mb-2 text-center">
            Where do you feel it in your body?
          </h3>
          <p className="text-stone-500 text-sm text-center mb-6">
            Tap areas where you feel emotional sensations
          </p>
          
          {/* Body Mapping Feature */}
          <div className="bg-white/80 p-4 rounded-stone relative">
            <BodyMap 
              selectedAreas={selectedBodyAreas}
              onAreaSelect={handleBodyAreaSelect}
            />
            {selectedBodyAreas.length > 0 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-stone-600 font-medium">
                  Selected areas: {selectedBodyAreas.join(', ')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          className="px-6 py-3 rounded-stone font-medium"
          data-testid="back-to-emotion"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Button
          onClick={onNext}
          className="px-6 py-3 rounded-stone font-medium transition-all"
          style={{ 
            background: "linear-gradient(to right, hsl(15, 60%, 70%), hsl(15, 65%, 60%))",
            color: "white"
          }}
          data-testid="next-to-journal"
        >
          Next Step
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}