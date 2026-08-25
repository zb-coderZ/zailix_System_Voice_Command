import { useCallback, useEffect, useRef, useState } from "react";

const SpeechRecognitionImpl =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

/**
 * Fast, real-time Web Speech API hook with:
 * 1. Instant interim results (real-time live streaming text)
 * 2. Smart fast silence auto-commit (~750ms pause detection instead of Chrome's 4s delay)
 * 3. Instant manual tap-to-send when clicking to stop
 * 4. Parallel audio analyser for 0..1 amplitude reactivity
 */
export function useSpeechRecognition({
  onResult,
  onInterimResult,
  onError,
  silenceTimeoutMs = 800,
} = {}) {
  const [isListening, setIsListening] = useState(false);
  const [amplitude, setAmplitude] = useState(0);

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  const silenceTimerRef = useRef(null);
  const accumulatedTranscriptRef = useRef("");
  const hasSentResultRef = useRef(false);

  const isSupported = Boolean(SpeechRecognitionImpl);

  const cleanupAudio = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAmplitude(0);
  }, []);

  const trackAmplitude = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const average = data.reduce((sum, v) => sum + v, 0) / data.length;
    const normalized = Math.min(1, (average / 255) * 2.0);
    setAmplitude(normalized);
    rafRef.current = requestAnimationFrame(trackAmplitude);
  }, []);

  const setupAudioAnalyser = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);
      analyserRef.current = analyser;

      rafRef.current = requestAnimationFrame(trackAmplitude);
    } catch {
      // Audio analysis is non-critical; speech recognition can still function
    }
  }, [trackAmplitude]);

  const commitTranscript = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    const final = accumulatedTranscriptRef.current.trim();
    if (final && !hasSentResultRef.current) {
      hasSentResultRef.current = true;
      onResult?.(final);
    }

    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore if already stopped
    }
    setIsListening(false);
    cleanupAudio();
  }, [cleanupAudio, onResult]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      onError?.(
        "Speech recognition is not supported in this browser. Try Chrome or Edge.",
      );
      return;
    }
    if (isListening) return;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    accumulatedTranscriptRef.current = "";
    hasSentResultRef.current = false;

    const recognition = new SpeechRecognitionImpl();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setupAudioAnalyser();
    };

    recognition.onresult = (event) => {
      let interim = "";
      let finals = "";

      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          finals += (finals ? " " : "") + res[0].transcript.trim();
        } else {
          interim += (interim ? " " : "") + res[0].transcript.trim();
        }
      }

      const fullText = (finals ? finals + " " : "") + interim;
      accumulatedTranscriptRef.current = fullText.trim();

      if (accumulatedTranscriptRef.current) {
        onInterimResult?.(accumulatedTranscriptRef.current);

        // Reset fast silence timeout to commit automatically ~800ms after speech pause
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        silenceTimerRef.current = setTimeout(() => {
          commitTranscript();
        }, silenceTimeoutMs);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech") {
        // If we already have text captured, commit it instead of erroring
        if (accumulatedTranscriptRef.current.trim()) {
          commitTranscript();
          return;
        }
        onError?.("No speech detected. Tap the orb and speak.");
      } else if (
        event.error === "not-allowed" ||
        event.error === "permission-denied"
      ) {
        onError?.("Microphone permission was denied.");
      } else if (event.error !== "aborted") {
        onError?.(`Recognition error: ${event.error}`);
      }
      setIsListening(false);
      cleanupAudio();
    };

    recognition.onend = () => {
      // If recognition ended naturally and we have pending text that wasn't dispatched
      if (
        accumulatedTranscriptRef.current.trim() &&
        !hasSentResultRef.current
      ) {
        commitTranscript();
      } else {
        setIsListening(false);
        cleanupAudio();
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      onError?.(`Could not start microphone: ${err.message}`);
    }
  }, [
    cleanupAudio,
    commitTranscript,
    isListening,
    isSupported,
    onError,
    onInterimResult,
    setupAudioAnalyser,
    silenceTimeoutMs,
  ]);

  const stopListening = useCallback(
    (options = { forceSend: true }) => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      if (options?.forceSend && accumulatedTranscriptRef.current.trim()) {
        commitTranscript();
      } else {
        try {
          recognitionRef.current?.stop();
        } catch {}
        setIsListening(false);
        cleanupAudio();
      }
    },
    [cleanupAudio, commitTranscript],
  );

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      try {
        recognitionRef.current?.stop();
      } catch {}
      cleanupAudio();
    };
  }, [cleanupAudio]);

  return {
    isSupported,
    isListening,
    amplitude,
    startListening,
    stopListening,
    commitTranscript,
  };
}
