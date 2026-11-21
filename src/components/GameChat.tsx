"use client";

import { useEffect, useRef } from "react";

const GameChat = ({ messages }: { messages: string[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const messageCount = messages.length;

  // Scroll only the chat box itself. (scrollIntoView also scrolls every
  // ancestor, including the page, which made the whole page jump down.)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo?.({ top: el.scrollHeight, behavior: "smooth" });
  }, [messageCount]);

  return (
    <div
      ref={containerRef}
      className="flex max-h-40 flex-1 flex-col items-start space-y-2 overflow-y-auto pr-2"
    >
      {messages.map((msg, i) => (
        <div
          key={i}
          className="rounded-lg bg-indigo-600/25 px-3 py-2 text-sm text-white shadow-sm"
        >
          {msg}
        </div>
      ))}
    </div>
  );
};

export default GameChat;
