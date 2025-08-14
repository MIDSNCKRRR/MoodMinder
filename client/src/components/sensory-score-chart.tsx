import { useState } from "react";

interface SensoryScoreChartProps {
  data: number[];
  labels: string[];
}

export default function SensoryScoreChart({ data, labels }: SensoryScoreChartProps) {
  // Convert 1-5 scale to 0-100 percentage scale
  const convertToPercentage = (value: number) => ((value - 1) / 4) * 100;
  const percentageData = data.map(convertToPercentage);
  
  // State for clicked tooltip
  const [clickedPoint, setClickedPoint] = useState<number | null>(null);
  
  // Handle point selection
  const handlePointSelect = (index: number, event: any) => {
    event.preventDefault();
    event.stopPropagation();
    setClickedPoint(clickedPoint === index ? null : index);
  };
  
  // Chart dimensions - ADJUST THESE TO CHANGE SIZE
  const chartWidth = 300;   // Fit better in mobile container
  const chartHeight = 160;  // Make taller for better visibility
  const padding = { left: 50, right: 30, top: 15, bottom: 40 }; // More space between axes
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  
  // Y-axis scale (0-100)
  const yTicks = [0, 25, 50, 75, 100];
  
  // Calculate positions
  const points = percentageData.map((value, index) => ({
    x: padding.left + (index / (data.length - 1)) * plotWidth,
    y: padding.top + ((100 - value) / 100) * plotHeight,
    originalValue: data[index],
    percentage: value
  }));
  
  // Create path for line connection
  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return (
    <div className="sensory-score-chart mb-4 relative overflow-visible">
      {/* Fixed height area for selected point info */}
      <div className="mb-3 text-center h-10 flex items-center justify-center">
        {clickedPoint !== null && (
          <div className="inline-flex items-center space-x-2 bg-black/80 text-white px-3 py-2 rounded-lg text-sm">
            <span className="font-medium">{labels[clickedPoint]}</span>
            <span className="font-semibold">{data[clickedPoint].toFixed(1)}/5</span>
          </div>
        )}
      </div>
      
      <svg 
        width={chartWidth} 
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto max-w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {yTicks.map((tick) => {
          const y = padding.top + ((100 - tick) / 100) * plotHeight;
          return (
            <line
              key={tick}
              x1={padding.left}
              y1={y}
              x2={chartWidth - padding.right}
              y2={y}
              stroke="hsl(var(--stone-200))"
              strokeWidth="1"
              opacity="0.5"
            />
          );
        })}
        
        {/* Vertical grid lines for days */}
        {points.map((point, index) => (
          <line
            key={index}
            x1={point.x}
            y1={padding.top}
            x2={point.x}
            y2={chartHeight - padding.bottom}
            stroke="hsl(var(--stone-200))"
            strokeWidth="1"
            opacity="0.3"
          />
        ))}
        
        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={chartHeight - padding.bottom}
          stroke="hsl(var(--stone-300))"
          strokeWidth="2"
        />
        
        {/* X-axis */}
        <line
          x1={padding.left - 5}
          y1={chartHeight - padding.bottom}
          x2={chartWidth - padding.right}
          y2={chartHeight - padding.bottom}
          stroke="hsl(var(--stone-300))"
          strokeWidth="2"
        />
        
        {/* Y-axis labels */}
        {yTicks.map((tick) => {
          const y = padding.top + ((100 - tick) / 100) * plotHeight;
          return (
            <text
              key={tick}
              x={padding.left - 25}
              y={y + 4}
              textAnchor="end"
              className="text-xs fill-stone-400"
              fontSize="10"
            >
              {tick}
            </text>
          );
        })}
        
        {/* Connection line - drawn first so dots appear on top */}
        <path
          d={pathData}
          stroke="#8B7FB8"
          strokeWidth="3"
          fill="none"
          className="opacity-90"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {points.map((point, index) => (
          <g key={index}>
            {/* Larger background circle for better visibility */}
            <circle
              cx={point.x}
              cy={point.y}
              r={clickedPoint === index ? "8" : "6"}
              fill="white"
              stroke="#8B7FB8"
              strokeWidth="2"
              style={{ 
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                touchAction: 'manipulation'
              }}
              onClick={(e) => handlePointSelect(index, e)}
              onTouchEnd={(e) => handlePointSelect(index, e)}
            />
            {/* Inner dot */}
            <circle
              cx={point.x}
              cy={point.y}
              r={clickedPoint === index ? "4" : "3"}
              fill="#8B7FB8"
              style={{ 
                transition: 'all 0.2s ease',
                pointerEvents: 'none'
              }}
            />
          </g>
        ))}
        
        {/* X-axis labels (days) */}
        {points.map((point, index) => (
          <text
            key={index}
            x={point.x}
            y={chartHeight - padding.bottom + 20}
            textAnchor="middle"
            className="text-xs fill-stone-500 font-medium"
            fontSize="11"
          >
            {labels[index]}
          </text>
        ))}
        
        {/* Chart title */}
        {/* <text
          x={chartWidth / 2}
          y={15}
          textAnchor="middle"
          className="text-xs fill-stone-500 font-medium"
          fontSize="10"
        >
          Sensory Expansion Score (%)
        </text> */}
      </svg>
      
      {/* Legend */}
      <div className="mt-3 flex justify-center">
        <div className="text-xs text-stone-500 bg-white/60 px-3 py-1 rounded-full">
          이완감(40%) + 자기수용(30%) + 감정재서사(30%)
        </div>
      </div>
    </div>
  );
}