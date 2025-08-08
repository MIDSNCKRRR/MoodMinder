import { CheckCircle, Circle } from "lucide-react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const steps = [
    { number: 1, label: "Emotion" },
    { number: 2, label: "Body Map" },
    { number: 3, label: "Journal" },
  ];

  return (
    <div className="flex items-center justify-between mb-8 px-4">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          {/* Step Circle */}
          <div className="flex flex-col items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
              currentStep >= step.number 
                ? "bg-coral-500 border-coral-500" 
                : "bg-white border-stone-300"
            }`}>
              {currentStep > step.number ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <span className={`text-sm font-medium ${
                  currentStep >= step.number ? "text-white" : "text-stone-400"
                }`}>
                  {step.number}
                </span>
              )}
            </div>
            <span className={`text-xs mt-2 font-medium ${
              currentStep >= step.number ? "text-stone-600" : "text-stone-400"
            }`}>
              {step.label}
            </span>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
              currentStep > step.number ? "bg-coral-500" : "bg-stone-200"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}