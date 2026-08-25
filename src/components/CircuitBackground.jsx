/**
 * High-tech Sci-Fi HUD Background Grid, Crosshairs, Circuit Bus Traces,
 * and Bottom Coordinate Axis (inspired by the screenshot reference).
 */
export default function CircuitBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="hud-grid-overlay absolute inset-0 opacity-40" />

      {/* SVG Layer with HUD markings, crosshairs, circuit lines & bottom ruler */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="pcb-traces"
            width="200"
            height="200"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 100 H70 L90 80 H140 L160 100 H200 M100 0 V60 L80 80 V130 L100 150 V200 M30 30 H70 L90 50 H120 M170 170 H130 L110 150 H80"
              fill="none"
              stroke="#E8A33D"
              strokeWidth="0.8"
              opacity="0.12"
            />
            <circle cx="70" cy="100" r="1.5" fill="#E8A33D" opacity="0.25" />
            <circle cx="140" cy="80" r="1.5" fill="#E8A33D" opacity="0.25" />
            <circle cx="90" cy="50" r="1.5" fill="#E8A33D" opacity="0.25" />
            <circle cx="110" cy="150" r="1.5" fill="#E8A33D" opacity="0.25" />
          </pattern>

          {/* Radial vignette fade */}
          <radialGradient id="hud-vignette" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#090D14" stopOpacity="0" />
            <stop offset="60%" stopColor="#090D14" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#090D14" stopOpacity="0.85" />
          </radialGradient>
        </defs>

        {/* PCB pattern */}
        <rect width="100%" height="100%" fill="url(#pcb-traces)" />

        {/* Global HUD Targeting Crosshair Lines */}
        <line
          x1="0"
          y1="50%"
          x2="100%"
          y2="50%"
          stroke="#E8A33D"
          strokeWidth="0.5"
          strokeDasharray="6 8"
          opacity="0.12"
        />
        <line
          x1="50%"
          y1="0"
          x2="50%"
          y2="100%"
          stroke="#E8A33D"
          strokeWidth="0.5"
          strokeDasharray="6 8"
          opacity="0.12"
        />

        {/* Horizontal HUD alignment guides */}
        <line
          x1="5%"
          y1="22%"
          x2="95%"
          y2="22%"
          stroke="#E8A33D"
          strokeWidth="0.5"
          opacity="0.08"
        />
        <line
          x1="5%"
          y1="78%"
          x2="95%"
          y2="78%"
          stroke="#E8A33D"
          strokeWidth="0.5"
          opacity="0.08"
        />

        {/* Decorative corner target brackets */}
        <g stroke="#E8A33D" strokeWidth="1.2" fill="none" opacity="0.3">
          {/* Top Left */}
          <path d="M 24 44 V 24 H 44" />
          {/* Top Right */}
          <path d="M calc(100% - 44px) 24 H calc(100% - 24px) V 44" />
          {/* Bottom Left */}
          <path d="M 24 calc(100% - 44px) V calc(100% - 24px) H 44" />
          {/* Bottom Right */}
          <path d="M calc(100% - 44px) calc(100% - 24px) H calc(100% - 24px) V calc(100% - 44px)" />
        </g>

        {/* Bottom Horizontal Axis Ruler Scale (00 10 20 30 ... 90) */}
        <g className="hidden sm:block">
          <line
            x1="30"
            y1="calc(100% - 28px)"
            x2="calc(100% - 30px)"
            y2="calc(100% - 28px)"
            stroke="#E8A33D"
            strokeWidth="0.8"
            opacity="0.25"
          />
          {Array.from({ length: 41 }).map((_, i) => {
            const isMajor = i % 4 === 0;
            const percent = 3 + (i / 40) * 94;
            return (
              <g key={i}>
                <line
                  x1={`${percent}%`}
                  y1={`calc(100% - ${isMajor ? "34px" : "30px"})`}
                  x2={`${percent}%`}
                  y2="calc(100% - 28px)"
                  stroke="#E8A33D"
                  strokeWidth={isMajor ? "1" : "0.6"}
                  opacity={isMajor ? 0.45 : 0.2}
                />
                {isMajor && (
                  <text
                    x={`${percent}%`}
                    y="calc(100% - 16px)"
                    fill="#E8A33D"
                    opacity="0.35"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {String(i * 2.5).padStart(2, "0")}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Vignette overlay */}
        <rect width="100%" height="100%" fill="url(#hud-vignette)" />
      </svg>
    </div>
  );
}
