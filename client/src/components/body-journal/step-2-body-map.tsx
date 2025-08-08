import { useState, useCallback } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeadMap from "./body-parts/head-map";
import UpperBodyMap from "./body-parts/upper-body-map";
import LowerBodyMap from "./body-parts/lower-body-map";

interface Step2BodyMapProps {
  selectedBodyFeelings: Record<string, string>;
  onBodyFeelingsChange: (feelings: Record<string, string>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2BodyMap({
  selectedBodyFeelings,
  onBodyFeelingsChange,
  onNext,
  onBack,
}: Step2BodyMapProps) {
  const [draggedFeeling, setDraggedFeeling] = useState<string | null>(null);

  const handleFeelingChange = useCallback(
    (part: string, feeling: string) => {
      const newFeelings = { ...selectedBodyFeelings, [part]: feeling };
      localStorage.setItem(
        "bodyJournal_bodyFeelings",
        JSON.stringify(newFeelings),
      );
      onBodyFeelingsChange(newFeelings);
    },
    [selectedBodyFeelings, onBodyFeelingsChange],
  );

  // Separate feelings by body area for display
  const headParts = ["forehead", "eyes", "jaw", "neck"];
  const upperBodyParts = [
    "chest",
    "heart",
    "shoulders",
    "arms",
    "hands",
    "stomach",
  ];
  const lowerBodyParts = ["hips", "thighs", "knees", "calves", "feet"];

  const headFeelings = Object.fromEntries(
    Object.entries(selectedBodyFeelings).filter(([part]) =>
      headParts.includes(part),
    ),
  );
  const upperBodyFeelings = Object.fromEntries(
    Object.entries(selectedBodyFeelings).filter(([part]) =>
      upperBodyParts.includes(part),
    ),
  );
  const lowerBodyFeelings = Object.fromEntries(
    Object.entries(selectedBodyFeelings).filter(([part]) =>
      lowerBodyParts.includes(part),
    ),
  );

  const totalSelectedFeelings = Object.keys(selectedBodyFeelings).length;

  return (
    <div className="space-y-6">
      {/* Step Content */}
      <Card
        className="rounded-organic stone-shadow border-0"
        style={{
          background:
            "linear-gradient(135deg, hsl(15, 55%, 93%) 0%, hsl(15, 50%, 78%) 100%)",
        }}
      >
        <CardContent className="p-6">
          {/* <h3 className="font-serif font-semibold text-stone-600 text-xl mb-2 text-center">
            Map your body feelings
          </h3>
          <p className="text-stone-500 text-sm text-center mb-6">
            Select body parts and describe how they feel with emoji tags
          </p> */}

          {/* Body Mapping Tabs */}
          <div className="bg-white/80 p-4 rounded-stone relative">
            {/* Floating Emoji Palette */}
            <div className="mb-4 p-3 bg-stone-50 rounded-stone border border-stone-200">
              <p className="text-xs text-stone-600 mb-2 font-medium">
                Drag feelings onto body parts:
              </p>
              <div className="flex flex-wrap gap-1 justify-center">
                {[
                  { id: "tense", emoji: "😬" },
                  { id: "relaxed", emoji: "😌" },
                  { id: "warm", emoji: "🔥" },
                  { id: "cool", emoji: "❄️" },
                  { id: "fluttery", emoji: "🦋" },
                  { id: "racing", emoji: "💓" },
                  { id: "calm", emoji: "🌊" },
                  { id: "buzzing", emoji: "⚡" },
                ].map((feeling) => (
                  <div
                    key={feeling.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggedFeeling(feeling.id);
                      e.dataTransfer.setData("text/plain", feeling.id);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-lg bg-white rounded-full border border-stone-200 cursor-move hover:bg-orange-50 hover:border-orange-200 transition-all"
                    data-testid={`floating-feeling-${feeling.id}`}
                  >
                    {feeling.emoji}
                  </div>
                ))}
              </div>
            </div>

            <Tabs defaultValue="head" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="head" className="text-xs">
                  Head
                </TabsTrigger>
                <TabsTrigger value="upper" className="text-xs">
                  Upper
                </TabsTrigger>
                <TabsTrigger value="lower" className="text-xs">
                  Lower
                </TabsTrigger>
              </TabsList>

              <TabsContent value="head" className="mt-0">
                <HeadMap
                  selectedFeelings={headFeelings}
                  onFeelingChange={handleFeelingChange}
                />
              </TabsContent>

              <TabsContent value="upper" className="mt-0">
                <UpperBodyMap
                  selectedFeelings={upperBodyFeelings}
                  onFeelingChange={handleFeelingChange}
                />
              </TabsContent>

              <TabsContent value="lower" className="mt-0">
                <LowerBodyMap
                  selectedFeelings={lowerBodyFeelings}
                  onFeelingChange={handleFeelingChange}
                />
              </TabsContent>
            </Tabs>
          </div>

          {totalSelectedFeelings > 0 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-stone-600 font-medium">
                {totalSelectedFeelings} body feeling
                {totalSelectedFeelings > 1 ? "s" : ""} selected
              </p>
            </div>
          )}
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
            background:
              "linear-gradient(to right, hsl(15, 60%, 70%), hsl(15, 65%, 60%))",
            color: "white",
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
