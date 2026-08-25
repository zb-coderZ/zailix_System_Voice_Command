import { useCallback, useState } from 'react';

/**
 * A small useState-like hook that mirrors its value to localStorage.
 * Falls back silently to in-memory-only state if localStorage is unavailable
 * (e.g. private browsing, or SSR contexts).
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Storage may be full or disabled — the app still works in-memory.
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, setStoredValue];
}
