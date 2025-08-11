interface EmotionFaceProps {
  emotion: number;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  selected?: boolean;
}

const emotionConfig = {
  1: { emoji: "😭", color: "hsl(15, 50%, 88%)", label: "Very Low" },
  2: { emoji: "😔", color: "hsl(45, 6%, 88%)", label: "Low" },
  3: { emoji: "😐", color: "hsl(25, 35%, 88%)", label: "Neutral" },
  4: { emoji: "🙂", color: "hsl(120, 12%, 88%)", label: "Good" },
  5: { emoji: "😄", color: "hsl(260, 40%, 88%)", label: "Excellent" },
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
        text-stone-600 
        rounded-full 
        flex items-center justify-center 
        transition-all duration-300 
        hover:scale-110
        ${selected ? "ring-2 ring-offset-2" : ""}
      `}
      style={{ 
        backgroundColor: config.color,
        ...(selected ? { 
          borderColor: 'hsl(25, 30%, 68%)', 
          ringColor: 'hsl(25, 30%, 68%)' 
        } : {})
      }}
      data-testid={`emotion-${emotion}`}
      title={config.label}
    >
      {config.emoji}
    </button>
  );
}
