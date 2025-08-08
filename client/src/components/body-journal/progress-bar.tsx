// Progress bar component - shows current step number and greys out remaining steps

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const stepLabels = ["Emotion", "Body Map", "Journal"];
  const currentLabel = stepLabels[currentStep - 1];

  return (
    <div className="flex justify-center items-center mb-8">
      <div className="flex flex-col items-center">
        {/* Current Step Circle */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-coral-500 border-2 border-coral-500 shadow-lg">
          <span className="text-lg font-bold text-white">
            {currentStep}
          </span>
        </div>
        {/* Current Step Label */}
        <span className="text-sm mt-2 font-semibold text-stone-600">
          {currentLabel}
        </span>
        {/* Step Counter */}
        <span className="text-xs mt-1 text-stone-400">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
    </div>
  );
}