type SparklineProps = {
  points: number[];
  positive?: boolean;
  className?: string;
};

export function Sparkline({ points, positive = true, className = "" }: SparklineProps) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const path = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 44 - ((point - min) / span) * 38;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const gradientId = `spark-${positive ? "up" : "down"}-${points.join("-")}`;

  return (
    <svg className={`sparkline ${className}`} viewBox="0 0 100 48" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={positive ? "#b7f34a" : "#ff725e"} stopOpacity="0.28" />
          <stop offset="100%" stopColor={positive ? "#b7f34a" : "#ff725e"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L100,48 L0,48 Z`} fill={`url(#${gradientId})`} />
      <path d={path} fill="none" stroke={positive ? "#b7f34a" : "#ff725e"} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
