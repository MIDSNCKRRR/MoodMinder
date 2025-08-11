import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Heart, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BoxBreathing } from "@/components/crisis-support/box-breathing";
import { ButterflyHug } from "@/components/crisis-support/butterfly-hug";

type CrisisType = "panic" | "loneliness" | null;

export default function CrisisSupport() {
  const [selectedType, setSelectedType] = useState<CrisisType>(null);

  if (selectedType === "panic") {
    return <PanicAttackSupport onBack={() => setSelectedType(null)} />;
  }

  if (selectedType === "loneliness") {
    return <LonelinessSupport onBack={() => setSelectedType(null)} />;
  }

  return (
    <div className="px-6 py-6 space-y-4 min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </Button>
        </Link>
        <h1 className="text-xl font-medium text-stone-800">Crisis Support</h1>
        <div className="w-9" /> {/* Spacer */}
      </div>

      {/* Introduction */}
      <Card className="rounded-organic stone-shadow border-0 bg-white/80">
        <CardContent className="p-4 text-center">
          <h2 className="text-lg font-medium text-stone-800 mb-2">
            You're not alone. We're here to help.
          </h2>
          <p className="text-stone-600 text-sm">
            Choose what you're experiencing and we'll guide you through gentle techniques.
          </p>
        </CardContent>
      </Card>

      {/* Crisis Type Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-stone-700 text-center mb-3">
          What are you experiencing?
        </h3>

        {/* Panic Attack Option */}
        <Card 
          className="rounded-organic stone-shadow border-0 cursor-pointer hover:scale-[1.02] transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, hsl(0, 60%, 95%) 0%, hsl(0, 50%, 88%) 100%)",
          }}
          onClick={() => setSelectedType("panic")}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-stone-800">Panic Attack</h3>
                <p className="text-stone-600 text-xs mt-1">
                  Racing heart, difficulty breathing, overwhelming anxiety
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loneliness Option */}
        <Card 
          className="rounded-organic stone-shadow border-0 cursor-pointer hover:scale-[1.02] transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, hsl(220, 60%, 95%) 0%, hsl(220, 50%, 88%) 100%)",
          }}
          onClick={() => setSelectedType("loneliness")}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-stone-800">Loneliness</h3>
                <p className="text-stone-600 text-xs mt-1">
                  Feeling isolated, disconnected, or emotionally alone
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Resources */}
      <Card className="rounded-organic stone-shadow border-0 bg-red-50/50 border border-red-100">
        <CardContent className="p-4">
          <p className="text-red-700 text-sm text-center">
            <strong>In immediate danger?</strong><br />
            Call 988 (Suicide & Crisis Lifeline) or your local emergency services
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function PanicAttackSupport({ onBack }: { onBack: () => void }) {
  return (
    <div className="px-6 py-4 space-y-4 min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="p-2" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </Button>
        <h1 className="text-lg font-medium text-stone-800">Panic Attack Support</h1>
        <Button variant="ghost" size="sm" className="p-2" onClick={onBack}>
          <X className="w-5 h-5 text-stone-600" />
        </Button>
      </div>

      {/* Comforting Message */}
      <Card className="rounded-organic stone-shadow border-0 bg-white/90">
        <CardContent className="p-4 text-center">
          <p className="text-stone-700 text-sm">
            You're experiencing a panic attack, and that's okay. This feeling is temporary and will pass. 
            Let's focus on your breathing together to help you feel calmer.
          </p>
        </CardContent>
      </Card>

      {/* Box Breathing Animation */}
      <BoxBreathing onExit={onBack} showExitButton={false} />
    </div>
  );
}

function LonelinessSupport({ onBack }: { onBack: () => void }) {
  return (
    <div className="px-6 py-4 space-y-4 min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="p-2" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </Button>
        <h1 className="text-lg font-medium text-stone-800">Loneliness Support</h1>
        <Button variant="ghost" size="sm" className="p-2" onClick={onBack}>
          <X className="w-5 h-5 text-stone-600" />
        </Button>
      </div>

      {/* Comforting Message */}
      <Card className="rounded-organic stone-shadow border-0 bg-white/90">
        <CardContent className="p-4 text-center">
          <p className="text-stone-700 text-sm">
            Feeling lonely is a human experience, and you're not alone in feeling this way. 
            Let's practice a gentle self-compassion exercise to help you feel more connected.
          </p>
        </CardContent>
      </Card>

      {/* Butterfly Hug Animation */}
      <ButterflyHug onExit={onBack} showExitButton={false} />
    </div>
  );
}