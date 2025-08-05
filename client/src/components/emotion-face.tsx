interface EmotionFaceProps {
  emotion: number;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  selected?: boolean;
}

const emotionConfig = {
  1: { emoji: "😭", color: "bg-coral-200", label: "Very Low" },
  2: { emoji: "😔", color: "bg-stone-200", label: "Low" },
  3: { emoji: "😐", color: "bg-peach-200", label: "Neutral" },
  4: { emoji: "🙂", color: "bg-sage-200", label: "Good" },
  5: { emoji: "😄", color: "bg-lavender-200", label: "Excellent" },
};

export default function EmotionFace({ emotion, size = "md", onClick, selected }: EmotionFaceProps) {
  const config = emotionConfig[emotion as keyof typeof emotionConfig];
  
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-lg",
    lg: "emotion-face",
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]} 
        ${config.color} 
        text-stone-600 
        rounded-full 
        flex items-center justify-center 
        transition-all duration-300 
        hover:scale-110
        ${selected ? "ring-2 ring-peach-400 ring-offset-2" : ""}
      `}
      data-testid={`emotion-${emotion}`}
      title={config.label}
    >
      {config.emoji}
    </button>
  );
}
