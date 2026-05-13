export default function ActivationGauge({ score, status, size = 160 }) {
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const arcDegrees = 270;
  const arcLength = (arcDegrees / 360) * circumference;
  const progress = Math.min(Math.max(score / 100, 0), 1);
  const filled = progress * arcLength;

  const tierColors = {
    fully:    '#7ed957',
    highly:   '#16a34a',
    moderate: '#ca8a04',
    low:      '#dc2626',
    none:     '#9ca3af',
  };
  const color = tierColors[status?.tier] || '#9ca3af';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-225deg)' }}
      >
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.7s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-4xl font-bold text-slate-800 leading-none">{score}</span>
        <span className="text-xs text-slate-400 mt-1">/ 100</span>
      </div>
    </div>
  );
}
