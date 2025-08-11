interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div
            key={stepNumber}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
              ${
                isActive
                  ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md scale-110"
                  : isCompleted
                    ? "bg-gradient-to-br from-purple-200 to-purple-300 text-purple-700 shadow-sm"
                    : "bg-white border-2 border-purple-200 text-purple-400"
              }
            `}
            data-testid={`progress-step-${stepNumber}`}
          >
            {stepNumber}
          </div>
        );
      })}
    </div>
  );
}
