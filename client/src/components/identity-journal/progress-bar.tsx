interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export default function ProgressBar({ currentStep, totalSteps, className = "" }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-sage-600">Step {currentStep} of {totalSteps}</span>
        <span className="text-sage-500">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-sage-200 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-sage-400 to-sage-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}