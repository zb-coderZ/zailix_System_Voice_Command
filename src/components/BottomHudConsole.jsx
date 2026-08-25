import { useEffect, useRef, useState } from "react";

/**
 * Bottom HUD Console, 24-band Spectrum Equalizer & Manual Command Prompt
 * (Matches the bottom-left chamfered module and HUD console from the screenshot)
 */
export default function BottomHudConsole({
  state,
  amplitude,
  systemLogs,
  onSubmitText,
  disabled,
}) {
  const [inputText, setInputText] = useState("");
  const logEndRef = useRef(null);

  const isListening = state === "listening";
  const isSpeaking = state === "speaking";
  const isProcessing = state === "processing";

  // Auto scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [systemLogs]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || disabled) return;
    onSubmitText(inputText.trim());
    setInputText("");
  };

  return (
    <div className="hud-panel-chamfer relative w-full border border-border bg-[#101724]/90 p-3 sm:p-4 hud-border-glow select-none">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left Side: Real-time System Event Terminal */}
        <div className="flex-1">
          <div className="flex items-center justify-between border-b border-border/40 pb-1 mb-2">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-[10px] tracking-[0.2em] font-semibold text-accent uppercase">
                SYSTEM CONSOLE LOGS
              </span>
            </div>
            <span className="font-mono text-[9px] text-text-dim">
              AUTOSCROLL [ON]
            </span>
          </div>

          <div className="h-16 sm:h-20 overflow-y-auto zailix-scroll space-y-1 font-mono text-[10px] sm:text-[11px] pr-1">
            {systemLogs.map((log, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-text-dim leading-none"
              >
                <span className="text-accent/60 shrink-0">[{log.time}]</span>
                <span
                  className={
                    log.type === "error"
                      ? "text-red-400"
                      : log.type === "success"
                        ? "text-emerald-400"
                        : log.type === "action"
                          ? "text-accent-light"
                          : "text-text-dim"
                  }
                >
                  {log.text}
                </span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

        {/* Middle: 24-Band Live Audio Spectrum Equalizer */}
        <div className="hidden md:flex flex-col items-center justify-center px-4 border-y lg:border-y-0 lg:border-x border-border/40 py-2 lg:py-0">
          <span className="font-mono text-[8px] tracking-widest text-text-dim mb-1">
            AUDIO SPECTRUM EQUALIZER
          </span>
          <div className="flex items-end gap-1 h-12 w-48 sm:w-56 px-2 py-1 rounded bg-[#090D14] border border-border/60">
            {Array.from({ length: 24 }).map((_, i) => {
              const variance = 0.3 + 0.7 * Math.sin((i / 24) * Math.PI);
              const height = isListening
                ? Math.min(
                    100,
                    Math.max(
                      12,
                      amplitude * 100 * variance + Math.random() * 20,
                    ),
                  )
                : isSpeaking
                  ? Math.min(
                      100,
                      Math.max(15, 60 * variance + Math.random() * 30),
                    )
                  : isProcessing
                    ? Math.min(
                        100,
                        Math.max(8, 30 * Math.sin(Date.now() / 200 + i)),
                      )
                    : 8 + (i % 3) * 4;

              return (
                <div
                  key={i}
                  className="flex-1 rounded-t-xs transition-all duration-75"
                  style={{
                    height: `${height}%`,
                    backgroundColor: height > 70 ? "#FFB84D" : "#E8A33D",
                    opacity: height > 20 ? 0.9 : 0.3,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Right: Manual Prompt Input Bar */}
        <div className="w-full lg:w-80 flex flex-col justify-center">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                disabled ? "Processing command..." : "Type command or query..."
              }
              disabled={disabled}
              className="w-full rounded border border-border bg-[#090D14] pl-3 pr-16 py-2 font-mono text-xs text-text placeholder:text-text-dim/50 outline-none focus:border-accent/80 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || disabled}
              className="absolute right-1 px-2.5 py-1 rounded border border-accent/40 bg-accent/15 text-accent hover:bg-accent/30 disabled:opacity-40 disabled:hover:bg-accent/15 font-mono text-[10px] tracking-wider uppercase transition-colors"
            >
              EXEC
            </button>
          </form>
          <div className="flex items-center justify-between mt-1 px-1 font-mono text-[8px] text-text-dim">
            <span>MIC OR TEXT INPUT</span>
            <span>ENTER TO TRANSMIT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
