import { useEffect, useState } from "react";

export default function SettingsPanel({
  isOpen,
  onClose,
  webhookUrl,
  onSave,
  onTestPing,
  onTestSpeech,
  onClearHistory,
  history,
  isPinging,
}) {
  const [draftUrl, setDraftUrl] = useState(webhookUrl);
  const [showValidation, setShowValidation] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDraftUrl(webhookUrl);
      setShowValidation(false);
      setJustSaved(false);
    }
  }, [isOpen, webhookUrl]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!draftUrl.trim()) {
      setShowValidation(true);
      return;
    }
    onSave(draftUrl.trim());
    setShowValidation(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  };

  return (
    <div
      className="hud-panel-chamfer animate-fade-in-up absolute right-0 top-12 z-50 w-[calc(100vw-2.5rem)] max-w-md border-2 border-accent/40 bg-[#101724]/98 p-5 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.85)] hud-border-glow select-none"
      role="dialog"
      aria-label="Zailix HUD configuration"
    >
      <div className="mb-4 flex items-center justify-between border-b border-border/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-xs bg-accent animate-pulse" />
          <h2 className="font-mono text-xs tracking-[0.25em] text-accent uppercase font-bold">
            SYSTEM CONFIG // UPLINK SETTINGS
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close settings"
          className="text-text-dim hover:text-accent font-mono text-sm px-1.5 py-0.5 border border-border/60 rounded bg-bg transition-colors"
        >
          ESC ✕
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-text-dim">
            <span>n8n Webhook Endpoint URL</span>
            <span className="text-accent/70">[POST]</span>
          </label>
          <input
            type="url"
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            placeholder="https://your-n8n-instance.com/webhook/zailix"
            className="w-full rounded border border-border bg-[#090D14] px-3 py-2 font-mono text-xs text-text outline-none placeholder:text-text-dim/40 focus:border-accent shadow-inner transition-colors"
          />
          {showValidation && (
            <p className="mt-1.5 font-mono text-[11px] text-red-400">
              ! Webhook URL cannot be empty.
            </p>
          )}
        </div>

        {/* Action Button Row */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="rounded border border-accent/60 bg-accent/20 py-2 font-mono text-xs uppercase tracking-widest text-accent-light transition-all hover:bg-accent/30 active:scale-98 font-semibold shadow-[0_0_15px_rgba(232,163,61,0.15)]"
          >
            {justSaved ? "SAVED ✓" : "SAVE CONFIG"}
          </button>

          <button
            type="button"
            onClick={onTestPing}
            disabled={isPinging}
            className="rounded border border-border bg-[#141D2B] py-2 font-mono text-xs uppercase tracking-widest text-text-dim transition-all hover:border-accent/50 hover:text-accent active:scale-98 disabled:opacity-50"
          >
            {isPinging ? "PINGING..." : "TEST PING"}
          </button>
        </div>

        {/* Voice Synthesis Test */}
        <div className="flex items-center justify-between pt-1 border-t border-border/40">
          <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider">
            VOICE SYNTHESIS TEST:
          </span>
          <button
            type="button"
            onClick={onTestSpeech}
            className="font-mono text-[10px] uppercase tracking-wider text-accent border border-border px-2 py-1 rounded bg-[#090D14] hover:border-accent transition-colors"
          >
            TEST TTS 🔊
          </button>
        </div>

        {/* History Accordion */}
        <div className="border-t border-border/40 pt-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-text-dim hover:text-text transition-colors"
            >
              <span>{showHistory ? "[-]" : "[+]"}</span>
              <span>
                CONVERSATION HISTORY (
                {Array.isArray(history) ? history.length : 0})
              </span>
            </button>
            {Array.isArray(history) && history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="font-mono text-[9px] text-red-400/80 hover:text-red-400 underline"
              >
                CLEAR
              </button>
            )}
          </div>

          {showHistory && (
            <div className="zailix-scroll mt-2 max-h-36 space-y-2 overflow-y-auto pr-1">
              {!Array.isArray(history) || history.length === 0 ? (
                <p className="font-mono text-[10px] text-text-dim/60 p-2">
                  No conversations recorded yet.
                </p>
              ) : (
                history
                  .slice()
                  .reverse()
                  .map((turn, i) => (
                    <div
                      key={i}
                      className="rounded border border-border/70 bg-[#090D14] p-2 space-y-1"
                    >
                      <p className="truncate font-mono text-[10px] text-text-dim">
                        <strong className="text-accent/70">&gt;</strong>{" "}
                        {turn.input}
                      </p>
                      <p className="truncate font-mono text-[10px] text-accent-light">
                        <strong>ZAILIX:</strong> {turn.reply}
                      </p>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
