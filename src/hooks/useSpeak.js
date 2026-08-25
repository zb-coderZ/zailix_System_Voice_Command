import { useCallback, useEffect, useRef, useState } from 'react';

const URDU_SCRIPT_RANGE = /[\u0600-\u06FF]/;

/**
 * Detects whether text is written in Urdu script. Roman Urdu (Latin script)
 * is intentionally treated as English, since no reliable lightweight way
 * exists to distinguish Roman Urdu from English without a language model,
 * and English TTS voices read Roman Urdu intelligibly enough.
 */
function isUrduScript(text) {
  return URDU_SCRIPT_RANGE.test(text);
}

export function useSpeak() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const voicesRef = useRef([]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const pickVoice = useCallback((preferUrdu) => {
    const voices = voicesRef.current;
    if (!voices.length) return null;

    if (preferUrdu) {
      const urduVoice = voices.find((v) => v.lang?.toLowerCase().startsWith('ur'));
      if (urduVoice) return urduVoice;
      // No Urdu voice installed — fall through to the default voice below
      // rather than forcing an English voice onto Urdu-script text.
      return voices.find((v) => v.default) || voices[0] || null;
    }

    const enVoice = voices.find((v) => v.lang?.toLowerCase() === 'en-us');
    return enVoice || voices.find((v) => v.lang?.toLowerCase().startsWith('en')) || voices[0] || null;
  }, []);

  const speak = useCallback(
    (text, { onEnd } = {}) => {
      if (!text || !('speechSynthesis' in window)) {
        onEnd?.();
        return;
      }

      window.speechSynthesis.cancel();

      const preferUrdu = isUrduScript(text);
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = pickVoice(preferUrdu);

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = preferUrdu ? 'ur-PK' : 'en-US';
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    },
    [pickVoice]
  );

  const cancelSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, isSpeaking, cancelSpeaking };
}
