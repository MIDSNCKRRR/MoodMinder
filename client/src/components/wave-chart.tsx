interface WaveChartProps {
  data: number[];
  labels: string[];
}

export default function WaveChart({ data, labels }: WaveChartProps) {
  // Create SVG path for wave visualization
  const maxValue = Math.max(...data, 5);
  const minValue = Math.min(...data, 1);
  const range = maxValue - minValue || 1;
  
  const pathData = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 200;
    const y = 60 - ((value - minValue) / range) * 40;
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="wave-chart mb-4">
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 200 80"
        preserveAspectRatio="none"
      >
        <path
          d={pathData}
          stroke="hsl(var(--lavender-500))"
          strokeWidth="3"
          fill="none"
          className="opacity-80"
        />
        {/* Data points */}
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * 200;
          const y = 60 - ((value - minValue) / range) * 40;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="hsl(var(--peach-400))"
              className="opacity-90"
            />
          );
        })}
      </svg>
      
      <div className="absolute bottom-2 left-4 right-4 flex justify-between text-xs text-stone-400">
        {labels.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>
    </div>
  );
}
