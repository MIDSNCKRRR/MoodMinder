interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div
            key={stepNumber}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
              ${
                isActive
                  ? "bg-sage-600 shadow-md"
                  : isCompleted
                    ? "bg-sage-200 text-sage-700"
                    : "bg-stone-200 text-stone-500"
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
