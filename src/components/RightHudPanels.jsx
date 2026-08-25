import { useEffect, useState } from "react";

/**
 * 3 Stacked Chamfered HUD Cards & Top Telemetry Metrics
 * (Matches the right-side stacked panels and telemetry numbers from screenshot)
 */
export default function RightHudPanels({
  state,
  lastTurn,
  currentTranscript,
  webhookUrl,
  connectionStatus,
  latencyMs,
  errorMessage,
}) {
  // Telemetry dummy state that actively changes when asking questions
  const [telemetry, setTelemetry] = useState({
    rgba: 2547,
    tgt: 42,
    lgm: "00",
    gfx: 42,
    sdc: 90,
    n20: "G22 00H",
    fps: 60,
    cpu: 24,
    txBytes: 1042,
    rxBytes: 4218,
  });

  const isListening = state === "listening";
  const isProcessing = state === "processing";
  const isSpeaking = state === "speaking";
  const isActive = isListening || isProcessing || isSpeaking;

  // Animate and fluctuate telemetry whenever voice activity or webhook processing occurs
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        rgba: 2500 + Math.floor(Math.random() * 99),
        tgt: Math.floor(40 + Math.random() * 25),
        lgm: Math.random() > 0.5 ? "01" : "00",
        gfx: Math.floor(40 + Math.random() * 20),
        sdc: Math.floor(85 + Math.random() * 15),
        n20: `G${Math.floor(20 + Math.random() * 5)} 00H`,
        fps: 58 + Math.floor(Math.random() * 4),
        cpu: isProcessing
          ? 78 + Math.floor(Math.random() * 15)
          : isListening
            ? 45 + Math.floor(Math.random() * 10)
            : 28,
        txBytes: prev.txBytes + Math.floor(Math.random() * 120),
        rxBytes:
          prev.rxBytes + (isSpeaking ? Math.floor(Math.random() * 280) : 0),
      }));
    }, 150);

    return () => clearInterval(interval);
  }, [isActive, isListening, isProcessing, isSpeaking]);

  return (
    <div className="flex w-full max-w-sm sm:max-w-md flex-col gap-3.5 select-none">
      {/* Top Telemetry Header Grid (Directly matching screenshot top-right text) */}
      <div className="flex items-center justify-between border-b border-border/60 pb-2 px-1 font-mono text-[10px] sm:text-[11px] tracking-wider text-text-dim">
        <div className="flex items-center gap-3">
          <span>
            RGBA{" "}
            <strong className="text-accent font-normal">
              {telemetry.rgba}
            </strong>
          </span>
          <span>
            TGT{" "}
            <strong className="text-accent font-normal">{telemetry.tgt}</strong>
          </span>
          <span>
            LGM{" "}
            <strong className="text-accent font-normal">{telemetry.lgm}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">
            GFX{" "}
            <strong className="text-accent font-normal">{telemetry.gfx}</strong>
          </span>
          <span>
            SDC{" "}
            <strong className="text-accent font-normal">{telemetry.sdc}</strong>
          </span>
          <span className="border border-border/80 px-1 py-0.2 rounded bg-bg text-accent/80 text-[9px]">
            [{telemetry.n20}]
          </span>
        </div>
      </div>

      {/* STACKED PANEL 1 (TOP CARD): Core Diagnostics & Neural Metrics */}
      <div className="hud-panel-topleft relative border border-border bg-[#101724]/90 p-3.5 sm:p-4 hud-border-glow transition-all duration-300">
        <div className="flex items-center justify-between mb-2 border-b border-border/40 pb-1.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-xs bg-accent animate-pulse" />
            <h3 className="font-mono text-[11px] tracking-[0.2em] font-semibold text-accent uppercase">
              MODULE // 01 · SYSTEM TELEMETRY
            </h3>
          </div>
          <span className="font-mono text-[9px] text-text-dim">
            {isActive ? "STREAMING" : "STANDBY"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
          <div className="rounded border border-border/50 bg-[#090D14]/70 p-2">
            <span className="block text-text-dim text-[8px] tracking-wider">
              PROC LOAD
            </span>
            <span className="text-sm font-semibold text-text">
              {telemetry.cpu}%
            </span>
          </div>
          <div className="rounded border border-border/50 bg-[#090D14]/70 p-2">
            <span className="block text-text-dim text-[8px] tracking-wider">
              REFRESH
            </span>
            <span className="text-sm font-semibold text-accent-light">
              {telemetry.fps} FPS
            </span>
          </div>
          <div className="rounded border border-border/50 bg-[#090D14]/70 p-2">
            <span className="block text-text-dim text-[8px] tracking-wider">
              CORE STATE
            </span>
            <span
              className={
                isActive
                  ? "text-sm font-semibold text-emerald-400"
                  : "text-sm font-semibold text-text-dim"
              }
            >
              {state.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* STACKED PANEL 2 (MIDDLE CARD): Live Dialogue Stream & Transcript */}
      <div className="hud-panel-chamfer relative border border-border bg-[#101724]/90 p-3.5 sm:p-4 hud-border-glow transition-all duration-300">
        <div className="flex items-center justify-between mb-2 border-b border-border/40 pb-1.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-xs bg-accent-light" />
            <h3 className="font-mono text-[11px] tracking-[0.2em] font-semibold text-accent-light uppercase">
              MODULE // 02 · ACTIVE DIALOGUE
            </h3>
          </div>
          <span className="font-mono text-[9px] text-accent/80">
            {isListening
              ? "LISTENING..."
              : isSpeaking
                ? "SPEAKING..."
                : isProcessing
                  ? "THINKING..."
                  : "IDLE"}
          </span>
        </div>

        <div className="min-h-[85px] sm:min-h-[95px] max-h-32 overflow-y-auto zailix-scroll rounded border border-border/60 bg-[#090D14]/90 p-2.5 font-mono text-xs flex flex-col justify-center">
          {errorMessage ? (
            <p className="animate-fade-in-up text-red-400/90 font-medium">
              ! {errorMessage}
            </p>
          ) : isListening && currentTranscript ? (
            <p className="animate-fade-in-up text-accent-light">
              <span className="text-text-dim">&gt; </span>
              {currentTranscript}
              <span className="animate-blink font-bold text-accent">_</span>
            </p>
          ) : lastTurn ? (
            <div className="space-y-1.5">
              <p className="text-text-dim truncate">
                <span className="text-accent/80 font-bold">&gt; </span>{" "}
                {lastTurn.input}
              </p>
              <p className="text-text font-medium leading-relaxed">
                <span className="text-accent font-bold">ZAILIX: </span>{" "}
                {lastTurn.reply}
              </p>
            </div>
          ) : (
            <p className="text-text-dim/60 text-[11px] tracking-wide">
              Awaiting voice or text input — tap the center Arc Reactor to
              begin.
            </p>
          )}
        </div>
      </div>

      {/* STACKED PANEL 3 (BOTTOM CARD): Webhook & Gateway Link */}
      <div className="hud-panel-bottomright relative border border-border bg-[#101724]/90 p-3.5 sm:p-4 hud-border-glow transition-all duration-300">
        <div className="flex items-center justify-between mb-2 border-b border-border/40 pb-1.5">
          <div className="flex items-center gap-2">
            <span
              className={[
                "h-2 w-2 rounded-xs",
                connectionStatus === "online"
                  ? "bg-emerald-400"
                  : connectionStatus === "offline"
                    ? "bg-red-400"
                    : "bg-accent/60",
              ].join(" ")}
            />
            <h3 className="font-mono text-[11px] tracking-[0.2em] font-semibold text-accent uppercase">
              MODULE // 03 · N8N GATEWAY UPLINK
            </h3>
          </div>
          <span
            className={[
              "font-mono text-[9px] px-1.5 py-0.5 rounded border",
              connectionStatus === "online"
                ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                : connectionStatus === "offline"
                  ? "border-red-500/40 text-red-400 bg-red-500/10"
                  : "border-border text-text-dim bg-bg",
            ].join(" ")}
          >
            {connectionStatus.toUpperCase()}
          </span>
        </div>

        <div className="space-y-1.5 font-mono text-[10px]">
          <div className="flex items-center justify-between text-text-dim">
            <span>ENDPOINT:</span>
            <span className="text-text truncate max-w-[180px] sm:max-w-[220px]">
              {webhookUrl
                ? webhookUrl.replace(/^https?:\/\//, "")
                : "NOT CONFIGURED"}
            </span>
          </div>
          <div className="flex items-center justify-between text-text-dim">
            <span>PACKET TRANSIT:</span>
            <span className="text-accent">
              TX {telemetry.txBytes} B / RX {telemetry.rxBytes} B
            </span>
          </div>
          <div className="flex items-center justify-between text-text-dim">
            <span>PING LATENCY:</span>
            <span className={latencyMs ? "text-emerald-400" : "text-text-dim"}>
              {latencyMs ? `${latencyMs} ms` : "124 ms (EST)"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
