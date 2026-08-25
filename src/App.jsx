import { useCallback, useEffect, useRef, useState } from "react";
import CircuitBackground from "./components/CircuitBackground.jsx";
import Orb from "./components/Orb.jsx";
import LeftTelemetryGauge from "./components/LeftTelemetryGauge.jsx";
import RightHudPanels from "./components/RightHudPanels.jsx";
import BottomHudConsole from "./components/BottomHudConsole.jsx";
import SettingsPanel from "./components/SettingsPanel.jsx";
import { useLocalStorage } from "./hooks/useLocalStorage.js";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition.js";
import { useSpeak } from "./hooks/useSpeak.js";

const MAX_HISTORY = 10;

function GearIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function formatTime() {
  const d = new Date();
  return [
    String(d.getHours()).padStart(2, "0"),
    String(d.getMinutes()).padStart(2, "0"),
    String(d.getSeconds()).padStart(2, "0"),
  ].join(":");
}

export default function App() {
  const [webhookUrl, setWebhookUrl] = useLocalStorage("zailix.webhookUrl", "");
  const [history, setHistory] = useLocalStorage("zailix.history", []);

  const [connectionStatus, setConnectionStatus] = useState("unknown"); // 'unknown' | 'online' | 'offline'
  const [assistantState, setAssistantState] = useState("idle"); // idle | listening | processing | speaking
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPinging, setIsPinging] = useState(false);
  const [latencyMs, setLatencyMs] = useState(null);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [systemLogs, setSystemLogs] = useState([
    {
      time: formatTime(),
      text: "ZAILIX HUD CORE INITIALIZED · SEC-04",
      type: "info",
    },
    {
      time: formatTime(),
      text: "VOICE RECOGNITION & AUDIO SUBSYSTEM READY",
      type: "success",
    },
  ]);

  const addLog = useCallback((text, type = "info") => {
    setSystemLogs((prev) => [
      ...prev.slice(-40),
      { time: formatTime(), text, type },
    ]);
  }, []);

  const lastTurn =
    Array.isArray(history) && history.length > 0
      ? history[history.length - 1]
      : null;

  const { speak, cancelSpeaking } = useSpeak();

  // Dynamic ambient glow
  useEffect(() => {
    const target =
      assistantState === "listening"
        ? 0.45
        : assistantState === "speaking"
          ? 0.35
          : assistantState === "processing"
            ? 0.25
            : 0.08;
    document.documentElement.style.setProperty(
      "--glow-opacity",
      String(target),
    );
  }, [assistantState]);

  const sendToWebhook = useCallback(
    async (text) => {
      if (!webhookUrl) {
        setErrorMessage("No webhook URL configured — add one in settings.");
        addLog("ERR: Webhook URL missing in settings", "error");
        setSettingsOpen(true);
        setAssistantState("idle");
        return;
      }

      setAssistantState("processing");
      setErrorMessage("");
      addLog(`TRANSMIT: "${text}" -> n8n Webhook`, "action");

      const startTime = performance.now();

      try {
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command_text: text }),
        });

        const roundTrip = Math.round(performance.now() - startTime);
        setLatencyMs(roundTrip);

        if (!res.ok) {
          throw new Error(`Webhook responded with HTTP ${res.status}`);
        }

        const data = await res.json().catch(() => ({}));
        const reply =
          data.output ||
          data.reply ||
          data.text ||
          "Response received from webhook with no text field.";

        addLog(`REPLY: 200 OK (${roundTrip}ms)`, "success");

        const turn = { input: text, reply };
        setHistory((prev) =>
          [...(Array.isArray(prev) ? prev : []), turn].slice(-MAX_HISTORY),
        );
        setConnectionStatus("online");

        setAssistantState("speaking");
        speak(reply, {
          onEnd: () => {
            setAssistantState("idle");
            addLog("AUDIO: Voice synthesis output completed", "info");
          },
        });
      } catch (err) {
        setConnectionStatus("offline");
        setErrorMessage(
          "Could not reach webhook endpoint. Verify URL or CORS.",
        );
        addLog(`ERR: Webhook unreachable (${err.message})`, "error");
        setAssistantState("idle");
      }
    },
    [addLog, setHistory, speak, webhookUrl],
  );

  const { isSupported, isListening, amplitude, startListening, stopListening } =
    useSpeechRecognition({
      silenceTimeoutMs: 750,
      onInterimResult: (text) => {
        setLiveTranscript(text);
      },
      onResult: (text) => {
        setLiveTranscript(text);
        setAssistantState("processing");
        addLog(`MIC RECOGNIZED: "${text}"`, "info");
        sendToWebhook(text);
      },
      onError: (message) => {
        setErrorMessage(message);
        addLog(`MIC ERR: ${message}`, "error");
        setAssistantState("idle");
      },
    });

  useEffect(() => {
    setAssistantState((prev) => {
      if (isListening) return "listening";
      if (prev === "listening") return "idle";
      return prev;
    });
  }, [isListening]);

  const handleOrbClick = () => {
    if (!isSupported) {
      setErrorMessage(
        "Speech recognition is not supported in this browser. Try Chrome or Edge.",
      );
      addLog("ERR: Web Speech API unsupported in this browser", "error");
      return;
    }
    if (assistantState === "listening") {
      // User tapped orb while speaking -> immediately flush & deliver message
      stopListening({ forceSend: true });
      addLog("MIC: Instant commit triggered by user", "action");
      return;
    }
    if (assistantState === "speaking") {
      cancelSpeaking();
      setAssistantState("idle");
      addLog("AUDIO: Speech canceled", "info");
      return;
    }
    if (assistantState !== "idle") return;

    setErrorMessage("");
    setLiveTranscript("");
    addLog("MIC: Audio stream capturing live...", "action");
    startListening();
  };

  const handleTestConnection = async () => {
    if (!webhookUrl) {
      setErrorMessage("No webhook configured — add one in settings.");
      setSettingsOpen(true);
      return;
    }
    setIsPinging(true);
    addLog("PING: Testing gateway reachability...", "action");
    const start = performance.now();
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command_text: "__ping__" }),
      });
      const dur = Math.round(performance.now() - start);
      setLatencyMs(dur);
      if (res.ok) {
        setConnectionStatus("online");
        addLog(`PING SUCCESS: 200 OK (${dur}ms)`, "success");
      } else {
        setConnectionStatus("offline");
        addLog(`PING WARN: HTTP ${res.status}`, "error");
      }
    } catch (err) {
      setConnectionStatus("offline");
      addLog(`PING FAILED: ${err.message}`, "error");
    } finally {
      setIsPinging(false);
    }
  };

  const handleSaveWebhook = (url) => {
    setWebhookUrl(url);
    setConnectionStatus("unknown");
    addLog(`CONFIG: Webhook endpoint updated`, "info");
  };

  const handleTestSpeech = () => {
    addLog("TTS: Running test voice synthesis", "action");
    speak("Zailix neural voice interface operational and ready.", {
      onEnd: () => addLog("TTS: Voice test complete", "success"),
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    addLog("HISTORY: Conversation records cleared", "info");
  };

  return (
    <div className="relative flex h-screen w-screen flex-col justify-between overflow-hidden bg-bg text-text p-3 sm:p-5 select-none">
      {/* Sci-Fi Background Layer */}
      <CircuitBackground />

      {/* Ambient center reactor glow */}
      <div
        className="ambient-glow pointer-events-none fixed left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(232,163,61,0.8) 0%, rgba(232,163,61,0) 70%)",
        }}
      />

      {/* TOP HEADER BAR */}
      <header className="relative z-30 flex w-full items-center justify-between border-b border-border/80 pb-3">
        {/* Left: Branding & Core ID */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-xs bg-accent shadow-[0_0_8px_#e8a33d] animate-pulse" />
            <h1 className="font-display text-base sm:text-lg font-bold tracking-[0.35em] text-text">
              ZAILIX{" "}
              <span className="text-accent text-xs font-mono font-normal tracking-widest">
                // HUD-v2
              </span>
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 rounded-xs border border-border bg-bg-panel/80 px-2.5 py-0.5 font-mono text-[9px] tracking-widest text-text-dim">
            <span>SEC: 04</span>
            <span className="text-accent/60">|</span>
            <span>GRID: ACTIVE</span>
          </div>
        </div>

        {/* Right: State Pill & Settings Gear */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded border border-border bg-[#101724]/90 px-3 py-1 font-mono text-[10px] tracking-widest">
            <span
              className={[
                "h-2 w-2 rounded-full",
                assistantState === "listening"
                  ? "bg-amber-400 animate-ping"
                  : assistantState === "processing"
                    ? "bg-accent-cyan animate-pulse"
                    : assistantState === "speaking"
                      ? "bg-accent animate-pulse-speak"
                      : "bg-emerald-400",
              ].join(" ")}
            />
            <span className="font-semibold text-accent-light">
              {assistantState === "listening"
                ? "RECOGNIZING"
                : assistantState === "processing"
                  ? "THINKING"
                  : assistantState === "speaking"
                    ? "SPEAKING"
                    : "STANDBY"}
            </span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
              aria-label="Open settings"
              className="flex h-9 w-9 items-center justify-center rounded border border-border bg-[#101724] text-text-dim transition-all hover:border-accent hover:text-accent hover:shadow-[0_0_15px_rgba(232,163,61,0.25)]"
            >
              <GearIcon />
            </button>
            <SettingsPanel
              isOpen={settingsOpen}
              onClose={() => setSettingsOpen(false)}
              webhookUrl={webhookUrl}
              onSave={handleSaveWebhook}
              onTestPing={handleTestConnection}
              onTestSpeech={handleTestSpeech}
              onClearHistory={handleClearHistory}
              history={history}
              isPinging={isPinging}
            />
          </div>
        </div>
      </header>

      {/* MAIN COCKPIT SECTION */}
      <main className="relative z-20 flex flex-1 flex-col lg:flex-row items-center justify-between gap-6 py-2 overflow-y-auto lg:overflow-visible zailix-scroll">
        {/* Left Telemetry Gauge (Scale, 370.04 reticle, LED bar) */}
        <div className="hidden md:flex shrink-0 items-center justify-center">
          <LeftTelemetryGauge state={assistantState} amplitude={amplitude} />
        </div>

        {/* Center Arc Reactor Orb Stage */}
        <div className="flex flex-1 flex-col items-center justify-center relative my-auto">
          <Orb
            state={assistantState}
            amplitude={amplitude}
            onClick={handleOrbClick}
            disabled={assistantState === "processing"}
          />

          {/* Quick HUD Sub-label */}
          <div className="mt-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.25em] text-text-dim">
            <span className="text-accent/80">&lt; HAYTHIX AI &gt;</span>
            <span>·</span>
            <span className="text-accent/60">AUTONOMOUS INTERFACE</span>
          </div>
        </div>

        {/* Right Stacked HUD Panels (Module 01, 02, 03) */}
        <div className="shrink-0 w-full lg:w-auto flex justify-center">
          <RightHudPanels
            state={assistantState}
            lastTurn={lastTurn}
            currentTranscript={liveTranscript}
            webhookUrl={webhookUrl}
            connectionStatus={connectionStatus}
            latencyMs={latencyMs}
            errorMessage={errorMessage}
          />
        </div>
      </main>

      {/* BOTTOM CONSOLE & SPECTRUM EQUALIZER */}
      <footer className="relative z-30 w-full pt-2">
        <BottomHudConsole
          state={assistantState}
          amplitude={amplitude}
          systemLogs={systemLogs}
          onSubmitText={sendToWebhook}
          disabled={assistantState === "processing"}
        />
      </footer>
    </div>
  );
}
