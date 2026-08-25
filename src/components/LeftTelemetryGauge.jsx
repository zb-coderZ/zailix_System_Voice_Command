import { useEffect, useState } from "react";

/**
 * Vertical HUD Calibration Gauge & Telemetry Ruler
 * (Matches the left ruler, 370.04 badge, and vertical graduated scale from screenshot)
 */
export default function LeftTelemetryGauge({ state, amplitude }) {
  const [val, setVal] = useState(370.04);
  const [freq, setFreq] = useState(432.8);
  const [gain, setGain] = useState(84.2);

  const isListening = state === "listening";
  const isProcessing = state === "processing";
  const isSpeaking = state === "speaking";

  // Dynamic telemetry fluctuation when active (listening / speaking / processing)
  useEffect(() => {
    if (!isListening && !isProcessing && !isSpeaking) {
      setVal(370.04);
      setFreq(432.8);
      return;
    }

    const interval = setInterval(() => {
      const delta = (Math.random() - 0.5) * (amplitude > 0.1 ? 8 : 2);
      setVal((v) => Number((370.04 + delta).toFixed(2)));
      setFreq((f) =>
        Number((430 + Math.random() * 20 + amplitude * 50).toFixed(1)),
      );
      setGain(Number((80 + amplitude * 20 + Math.random() * 5).toFixed(1)));
    }, 120);

    return () => clearInterval(interval);
  }, [isListening, isProcessing, isSpeaking, amplitude]);

  // Position of sliding marker reticle (0% to 100% of vertical ruler height)
  const markerPos = Math.min(
    100,
    Math.max(10, 45 + amplitude * 40 + (val - 370.04) * 4),
  );

  const scaleMarks = [
    { num: "24.00", pct: 15 },
    { num: "25.00", pct: 30 },
    { num: "26.00", pct: 45 },
    { num: "27.00", pct: 60 },
    { num: "28.00", pct: 75 },
    { num: "29.00", pct: 90 },
  ];

  return (
    <div className="relative flex flex-row items-center gap-3 select-none py-4">
      {/* Leftmost Vertical Power Bar / Segmented LED Track */}
      <div className="flex flex-col items-center gap-1">
        <span className="font-mono text-[8px] text-accent/60 tracking-wider">
          PWR
        </span>
        <div className="relative h-64 sm:h-80 w-3 rounded border border-border bg-bg/90 p-0.5 flex flex-col-reverse justify-between overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => {
            const activeCount = Math.floor(
              (isListening
                ? amplitude
                : isSpeaking
                  ? 0.45
                  : isProcessing
                    ? 0.6
                    : 0.15) * 24,
            );
            const isActive = i <= activeCount;
            return (
              <div
                key={i}
                className={[
                  "w-full h-1 rounded-xs transition-colors duration-100",
                  isActive
                    ? i > 18
                      ? "bg-amber-400 shadow-[0_0_6px_#f59e0b]"
                      : "bg-accent shadow-[0_0_4px_#e8a33d]"
                    : "bg-border/30",
                ].join(" ")}
              />
            );
          })}
        </div>
        <div className="hud-tag-badge bg-accent/10 border border-accent/40 px-1.5 py-0.5">
          <span className="font-mono text-[9px] font-bold text-accent">
            [357]
          </span>
        </div>
      </div>

      {/* Vertical Graduated Scale Ruler (as seen in screenshot) */}
      <div className="relative h-64 sm:h-80 w-16 sm:w-20 flex flex-col justify-between">
        {/* Continuous background ruler ticks */}
        <div className="absolute left-2 top-0 bottom-0 w-3 flex flex-col justify-between py-2">
          {Array.from({ length: 48 }).map((_, i) => {
            const isMajor = i % 8 === 0;
            const isMedium = i % 4 === 0;
            return (
              <div
                key={i}
                className={[
                  "border-t transition-all",
                  isMajor
                    ? "w-4 border-accent opacity-80"
                    : isMedium
                      ? "w-2.5 border-accent/60 opacity-50"
                      : "w-1.5 border-accent/40 opacity-30",
                ].join(" ")}
              />
            );
          })}
        </div>

        {/* Major Scale Labels (24.00, 25.00, 26.00...) */}
        <div className="absolute left-8 top-0 bottom-0 flex flex-col justify-between py-2 font-mono text-[10px] sm:text-[11px] text-accent/70 tracking-wider">
          {scaleMarks.map((mark) => (
            <span
              key={mark.num}
              className="transition-opacity duration-200 hover:text-accent"
            >
              {mark.num}
            </span>
          ))}
        </div>

        {/* Dynamic Floating Reticle with Value (e.g. 370.04) */}
        <div
          className="absolute left-0 -translate-y-1/2 flex items-center gap-1.5 transition-all duration-75 ease-out z-20 pointer-events-none"
          style={{ top: `${markerPos}%` }}
        >
          {/* Reticle horizontal pointer line */}
          <div className="w-4 sm:w-6 h-[1.5px] bg-accent-light shadow-[0_0_8px_#ffb84d]" />

          {/* Angled Value Tag Box */}
          <div className="hud-tag-badge flex items-center gap-1 border border-accent-light bg-[#141D2B]/95 px-2 py-0.5 shadow-[0_0_12px_rgba(232,163,61,0.3)]">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-light animate-pulse" />
            <span className="font-mono text-[10px] sm:text-[11px] font-bold text-accent-light tracking-wider">
              {val}
            </span>
          </div>
        </div>

        {/* Vertical boundary rail */}
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-border to-transparent" />
      </div>

      {/* Sub-telemetry labels */}
      <div className="hidden md:flex flex-col justify-between h-64 sm:h-80 py-4 font-mono text-[9px] text-text-dim border-l border-border/40 pl-2">
        <div>
          <p className="text-accent/60">SYS.CALIB</p>
          <p className="text-text">{freq} Hz</p>
        </div>
        <div>
          <p className="text-accent/60">MIC.GAIN</p>
          <p className="text-text">+{gain} dB</p>
        </div>
        <div>
          <p className="text-accent/60">SIGNAL</p>
          <p className={isListening ? "text-emerald-400" : "text-accent"}>
            {isListening ? "LOCKED" : "READY"}
          </p>
        </div>
      </div>
    </div>
  );
}
