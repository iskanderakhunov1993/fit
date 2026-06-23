export function Logo() {
  return (
    <div className="logo" aria-label="Ромашка">
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" role="img">
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
            <ellipse
              key={angle}
              cx="20"
              cy="20"
              rx="3.8"
              ry="9"
              fill="currentColor"
              opacity="0.7"
              transform={`rotate(${angle} 20 20)`}
            />
          ))}
          <circle cx="20" cy="20" r="5.5" fill="#F0B95E" />
          <circle cx="20" cy="20" r="3" fill="#E8A640" />
        </svg>
      </span>
      <span className="logo-copy">
        <strong>Ромашка</strong>
        <small>ТВОЙ ЦИКЛ · ТВОЯ СИЛА</small>
      </span>
    </div>
  );
}
