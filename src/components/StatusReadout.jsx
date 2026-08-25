const STATUS_LABELS = {
  idle: 'TAP TO SPEAK',
  listening: 'LISTENING...',
  processing: 'PROCESSING...',
  speaking: 'SPEAKING...',
};

export default function StatusReadout({ state, lastTurn, errorMessage }) {
  const label = STATUS_LABELS[state] || STATUS_LABELS.idle;

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      {/* System status readout */}
      <div className="flex items-center gap-2 font-mono text-xs tracking-[0.3em] text-accent">
        <span>{label}</span>
        {state === 'idle' && <span className="animate-blink">_</span>}
      </div>

      {/* Terminal-style conversation panel */}
      <div className="min-h-[92px] w-full rounded-md border border-border bg-bg-panel/60 px-4 py-3 font-mono text-sm">
        {errorMessage ? (
          <p className="animate-fade-in-up text-red-400/90">! {errorMessage}</p>
        ) : lastTurn ? (
          <div className="flex flex-col gap-2">
            <p className="animate-fade-in-up text-text-dim">
              <span className="text-text-dim/70">&gt;</span> {lastTurn.input}
            </p>
            <p className="animate-fade-in-up text-text">
              <span className="text-accent">ZAILIX:</span> {lastTurn.reply}
            </p>
          </div>
        ) : (
          <p className="text-text-dim/60">Awaiting input — tap the orb to begin.</p>
        )}
      </div>
    </div>
  );
}
