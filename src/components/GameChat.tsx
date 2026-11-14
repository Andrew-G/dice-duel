"use client";

import { useEffect, useRef } from "react";

const GameChat = ({ messages }: { messages: string[] }) => {
  const messagesRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <div
      ref={messagesRef}
      //bg-gray-100 rounded-lg shadow-md
      className="flex flex-1 flex-col pr-2 space-y-2 items-start max-h-40 overflow-y-auto"
    >
      {messages.map((msg, i) => (
        <div
          key={i}
          className="rounded-lg px-3 py-2 bg-indigo-600/[.25] text-white shadow text-sm"
        >
          {msg}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default GameChat;
