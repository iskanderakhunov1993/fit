type CycleWheelProps = {
  currentDay: number;
  cycleLength: number;
  size?: number;
};

const phases = [
  { name: "Менструация", startDay: 1, endDay: 5, color: "#E88B9C" },
  { name: "Фолликулярная", startDay: 6, endDay: 13, color: "#F0B95E" },
  { name: "Овуляция", startDay: 14, endDay: 16, color: "#B99AE0" },
  { name: "Лютеиновая", startDay: 17, endDay: 28, color: "#7B6FB5" }
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export function CycleWheel({ currentDay, cycleLength, size = 280 }: CycleWheelProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 12;
  const innerR = outerR - 32;
  const strokeWidth = 32;
  const r = (outerR + innerR) / 2;

  const currentPhase = phases.find(
    (p) => currentDay >= p.startDay && currentDay <= p.endDay
  ) ?? phases[0];

  const dotAngle = ((currentDay - 0.5) / cycleLength) * 360;
  const dotPos = polarToCartesian(cx, cy, r, dotAngle);

  const petalCount = 12;
  const flowerR = innerR - 14;

  return (
    <div className="cycle-wheel-container">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {phases.map((phase) => {
          const startAngle = ((phase.startDay - 1) / cycleLength) * 360;
          const endAngle = (phase.endDay / cycleLength) * 360;
          return (
            <path
              key={phase.name}
              d={arcPath(cx, cy, r, startAngle, endAngle)}
              fill="none"
              stroke={phase.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              opacity={0.85}
            />
          );
        })}

        {/* Daisy petals in center */}
        {Array.from({ length: petalCount }).map((_, i) => {
          const angle = (i * 360) / petalCount;
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy - flowerR * 0.42}
              rx={flowerR * 0.14}
              ry={flowerR * 0.34}
              fill="#E8DFF5"
              opacity={0.6}
              transform={`rotate(${angle} ${cx} ${cy})`}
            />
          );
        })}
        <circle cx={cx} cy={cy} r={flowerR * 0.22} fill="#F0B95E" opacity={0.8} />

        {/* Current day dot */}
        <circle
          cx={dotPos.x}
          cy={dotPos.y}
          r={8}
          fill="#fff"
          stroke={currentPhase.color}
          strokeWidth={3}
          filter="url(#dot-shadow)"
        />
        <defs>
          <filter id="dot-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
          </filter>
        </defs>
      </svg>

      <div className="cycle-wheel-center">
        <span className="cycle-wheel-day">{currentDay}</span>
        <span className="cycle-wheel-label">ДЕНЬ</span>
      </div>
    </div>
  );
}

export function CycleLegend({ currentDay, cycleLength }: { currentDay: number; cycleLength: number }) {
  const currentPhase = phases.find(
    (p) => currentDay >= p.startDay && currentDay <= p.endDay
  ) ?? phases[0];

  return (
    <div className="cycle-legend">
      <div className="cycle-phase-badge">
        <span className="phase-dot" style={{ background: currentPhase.color }} />
        {currentPhase.name}
      </div>
      <div className="cycle-legend-grid">
        {phases.map((phase) => (
          <div key={phase.name} className="cycle-legend-item">
            <span className="legend-dot" style={{ background: phase.color }} />
            <span>{phase.name}</span>
            <span className="legend-days">{phase.startDay}–{phase.endDay}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
