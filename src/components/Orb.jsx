const TICK_COUNT = 48;
const TURBINE_BLADES = 16;

/**
 * Mechanical Radial Gear & Audio-Reactive Ring
 */
function ArcReactorGears({ amplitude, isListening, state }) {
  const radius = 98;
  const innerRadius = 78;
  const ticks = Array.from({ length: TICK_COUNT });
  const blades = Array.from({ length: TURBINE_BLADES });

  return (
    <svg
      viewBox="0 0 300 300"
      className="absolute inset-0 h-full w-full pointer-events-none"
    >
      {/* Outer Glow Defs */}
      <defs>
        <filter id="core-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="arc-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFB84D" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#E8A33D" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Radial Ticks / Gear Teeth */}
      {ticks.map((_, i) => {
        const angle = (i / TICK_COUNT) * 360;
        const isMajor = i % 4 === 0;
        const variance =
          0.5 + 0.5 * Math.abs(Math.sin((i / TICK_COUNT) * Math.PI * 4));
        const length = isMajor
          ? 8 + (isListening ? amplitude * 24 * variance : 2)
          : 4 + (isListening ? amplitude * 14 * variance : 0);

        const rad = (angle * Math.PI) / 180;
        const x1 = 150 + radius * Math.cos(rad);
        const y1 = 150 + radius * Math.sin(rad);
        const x2 = 150 + (radius + length) * Math.cos(rad);
        const y2 = 150 + (radius + length) * Math.sin(rad);

        return (
          <line
            key={`tick-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={isMajor ? "#FFB84D" : "#E8A33D"}
            strokeWidth={isMajor ? "2" : "1"}
            strokeLinecap="round"
            opacity={isMajor ? 0.8 : 0.35 + (isListening ? amplitude * 0.5 : 0)}
          />
        );
      })}

      {/* Inner Turbine Radial Blades */}
      <g
        className={
          state === "processing"
            ? "animate-spin-fast-reverse"
            : "animate-spin-slow-reverse"
        }
        style={{ transformOrigin: "150px 150px" }}
      >
        {blades.map((_, i) => {
          const angle = (i / TURBINE_BLADES) * 360;
          const rad = (angle * Math.PI) / 180;
          const x1 = 150 + innerRadius * Math.cos(rad);
          const y1 = 150 + innerRadius * Math.sin(rad);
          const x2 = 150 + (innerRadius + 10) * Math.cos(rad + 0.1);
          const y2 = 150 + (innerRadius + 10) * Math.sin(rad + 0.1);
          return (
            <line
              key={`blade-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#E8A33D"
              strokeWidth="2"
              opacity="0.5"
              strokeLinecap="round"
            />
          );
        })}
      </g>

      {/* Concentric Reference Rings */}
      <circle
        cx="150"
        cy="150"
        r="116"
        fill="none"
        stroke="#E8A33D"
        strokeWidth="0.8"
        strokeDasharray="3 6"
        opacity="0.3"
      />
      <circle
        cx="150"
        cy="150"
        r="98"
        fill="none"
        stroke="#E8A33D"
        strokeWidth="1.2"
        opacity="0.4"
      />
      <circle
        cx="150"
        cy="150"
        r="76"
        fill="none"
        stroke="#FFB84D"
        strokeWidth="1"
        strokeDasharray="12 4"
        opacity="0.5"
      />
      <circle
        cx="150"
        cy="150"
        r="62"
        fill="none"
        stroke="#E8A33D"
        strokeWidth="0.8"
        opacity="0.3"
      />

      {/* Heavy Segmented Outer Arc Armor Bezel (As seen in screenshot) */}
      <g
        className={
          state === "listening" ? "animate-spin-slow" : "animate-spin-slow"
        }
        style={{ transformOrigin: "150px 150px" }}
      >
        {/* Major Arc Section 1 */}
        <path
          d="M 150 20 A 130 130 0 0 1 278 135"
          fill="none"
          stroke="url(#arc-gradient)"
          strokeWidth="12"
          strokeLinecap="round"
          filter="url(#core-glow)"
          opacity="0.85"
        />
        {/* Notched Armor Plate */}
        <path
          d="M 150 24 A 126 126 0 0 1 245 80"
          fill="none"
          stroke="#FFB84D"
          strokeWidth="4"
          opacity="0.9"
        />
        {/* Counter Arc Section 2 */}
        <path
          d="M 130 280 A 130 130 0 0 1 22 165"
          fill="none"
          stroke="#E8A33D"
          strokeWidth="8"
          strokeDasharray="40 10 15 10"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>

      {/* Coordinate & Angle Crosshairs */}
      <g stroke="#E8A33D" strokeWidth="0.8" opacity="0.4">
        <line x1="150" y1="10" x2="150" y2="35" />
        <line x1="150" y1="265" x2="150" y2="290" />
        <line x1="10" y1="150" x2="35" y2="150" />
        <line x1="265" y1="150" x2="290" y2="150" />
      </g>
    </svg>
  );
}

export default function Orb({ state, amplitude, onClick, disabled }) {
  // state: 'idle' | 'listening' | 'processing' | 'speaking'
  const isListening = state === "listening";
  const isSpeaking = state === "speaking";
  const isProcessing = state === "processing";

  const liveScale = isListening
    ? 1 + Math.min(amplitude, 1) * 0.18
    : isSpeaking
      ? 1.04
      : 1;

  return (
    <div className="relative flex h-72 w-72 sm:h-80 sm:w-80 items-center justify-center select-none">
      {/* Dynamic Ambient Energy Halo */}
      <div
        className="ambient-glow absolute inset-0 rounded-full blur-3xl pointer-events-none transition-all duration-500"
        style={{
          background: isListening
            ? "radial-gradient(circle, rgba(232,163,61,0.55) 0%, rgba(255,184,77,0.2) 50%, rgba(9,13,20,0) 75%)"
            : isProcessing
              ? "radial-gradient(circle, rgba(56,189,248,0.4) 0%, rgba(232,163,61,0.25) 50%, rgba(9,13,20,0) 75%)"
              : "radial-gradient(circle, rgba(232,163,61,0.3) 0%, rgba(232,163,61,0.05) 50%, rgba(9,13,20,0) 70%)",
          transform: `scale(${liveScale * 1.1})`,
        }}
      />

      {/* Multi-layered Mechanical Arc Reactor Visual Assembly */}
      <ArcReactorGears
        amplitude={amplitude}
        isListening={isListening}
        state={state}
      />

      {/* Outer Static Bracket Frame */}
      <div className="absolute inset-2 rounded-full border border-border/60 pointer-events-none" />
      <div className="absolute inset-6 rounded-full border border-dashed border-accent/20 pointer-events-none" />

      {/* Center Interactive Core Trigger Button */}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={isListening ? "Stop listening" : "Tap to speak"}
        className={[
          "orb-scale relative z-20 flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-full",
          "bg-gradient-to-b from-[#141D2B] to-[#0B1019] border-2",
          isListening
            ? "border-accent-light shadow-[0_0_35px_rgba(255,184,77,0.5)] scale-105"
            : isProcessing
              ? "border-accent-cyan shadow-[0_0_30px_rgba(56,189,248,0.4)] animate-pulse"
              : isSpeaking
                ? "border-accent shadow-[0_0_30px_rgba(232,163,61,0.45)] animate-pulse-speak"
                : "border-accent/40 shadow-[0_0_20px_rgba(232,163,61,0.18)] hover:border-accent hover:shadow-[0_0_25px_rgba(232,163,61,0.35)]",
          "transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 group",
        ].join(" ")}
        style={{ transform: `scale(${liveScale})` }}
      >
        {/* Core Center Lens Ring */}
        <div className="absolute inset-2.5 rounded-full border border-accent/30 bg-[#090D14]/80 flex items-center justify-center overflow-hidden">
          {/* Animated Core Iris Waves */}
          <div
            className={[
              "absolute inset-0 rounded-full transition-opacity duration-300",
              isListening ? "opacity-80" : "opacity-20 group-hover:opacity-40",
            ].join(" ")}
            style={{
              background:
                "radial-gradient(circle, rgba(255,184,77,0.4) 0%, rgba(232,163,61,0.1) 60%, transparent 100%)",
            }}
          />

          {/* Holographic Center Microphone / Energy Eye Icon */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <svg
                  className="h-7 w-7 sm:h-8 sm:w-8 animate-spin text-accent-light"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="mt-1 font-mono text-[9px] tracking-widest text-accent-light">
                  SYNC
                </span>
              </div>
            ) : (
              <>
                <svg
                  className={[
                    "h-7 w-7 sm:h-8 sm:w-8 transition-transform duration-200",
                    isListening
                      ? "scale-110 text-accent-light"
                      : "text-accent group-hover:scale-105",
                  ].join(" ")}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="2" width="6" height="12" rx="3" />
                  <path d="M5 10a7 7 0 0 0 14 0" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
                <span className="mt-1 font-mono text-[8px] sm:text-[9px] tracking-[0.2em] text-accent/80 group-hover:text-accent font-semibold uppercase">
                  {isListening ? "LIVE" : isSpeaking ? "VOICE" : "SPEAK"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Live Audio Reaction Wave Rings */}
        {isListening && amplitude > 0.08 && (
          <div
            className="absolute -inset-4 rounded-full border border-accent/40 animate-ping pointer-events-none opacity-60"
            style={{ animationDuration: "1.4s" }}
          />
        )}
      </button>

      {/* Target Reticle Coordinate Badges */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-widest text-accent/60 bg-bg-panel/90 px-2 py-0.5 rounded border border-border">
        [CORE-01]
      </div>
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-widest text-text-dim bg-bg-panel/90 px-2 py-0.5 rounded border border-border">
        {state.toUpperCase()}
      </div>
    </div>
  );
}
