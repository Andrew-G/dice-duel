import { useEffect, useMemo, useState } from "react";

/**
 * Types `text` out one character at a time. Starts over whenever `text`
 * changes. People who prefer reduced motion get the whole text at once.
 */
export function useTypewriter(text: string, msPerChar = 25) {
  // Code points, so emoji and the like aren't split in half.
  const chars = useMemo(() => Array.from(text), [text]);
  const [typed, setTyped] = useState({ text, count: 0 });
  // A different text means a fresh start, with no effect needed to reset.
  const count = typed.text === text ? typed.count : 0;
  const isDone = count >= chars.length;

  useEffect(() => {
    if (isDone) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped({ text, count: chars.length });
      return;
    }
    const id = window.setTimeout(
      () => setTyped({ text, count: count + 1 }),
      msPerChar
    );
    return () => window.clearTimeout(id);
  }, [isDone, count, text, chars.length, msPerChar]);

  return {
    displayed: chars.slice(0, count).join(""),
    isDone,
    /** Show the rest of the text straight away. */
    finish: () => setTyped({ text, count: chars.length }),
  };
}
