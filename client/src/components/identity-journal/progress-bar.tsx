interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export default function ProgressBar({ currentStep, totalSteps, className = "" }: ProgressBarProps) {
  const steps = [
    { number: 1, label: "Keywords" },
    { number: 2, label: "Reflection" }
  ];

  return (
    <div className={`flex justify-center items-center space-x-8 ${className}`}>
      {steps.map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        
        return (
          <div key={step.number} className="flex flex-col items-center">
            {/* Circle with number */}
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                ${isActive 
                  ? "bg-sage-600 text-white ring-4 ring-sage-200" 
                  : isCompleted 
                    ? "bg-sage-500 text-white" 
                    : "bg-sage-200 text-sage-400"
                }
              `}
            >
              {step.number}
            </div>
            
            {/* Step label */}
            <span 
              className={`
                mt-2 text-xs font-medium transition-colors duration-300
                ${isActive 
                  ? "text-sage-700" 
                  : isCompleted 
                    ? "text-sage-600" 
                    : "text-sage-400"
                }
              `}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}