"use client";

import { useMemo, useState } from "react";
import { createRecordedGame, validateRecordedGame } from "@/engine/recording";
import { recordingFileName, serializeRecordedGame } from "@/engine/serialize";
import type { RecordedTurn } from "@/types/Recording";

const buttonClass =
  "rounded-md bg-gray-100 px-4 py-2 text-sm text-black shadow hover:bg-white";

/** Shown when any game ends: optionally name it, then download the JSON. */
const RecordPanel = ({ turns }: { turns: RecordedTurn[] }) => {
  const [label, setLabel] = useState("");
  const [id] = useState(() => `g${Date.now().toString(36)}`);

  const game = useMemo(
    () => createRecordedGame(turns, id, label.trim() || "Untitled game"),
    [turns, id, label]
  );
  const errors = useMemo(() => validateRecordedGame(game), [game]);
  const json = useMemo(() => serializeRecordedGame(game), [game]);
  const fileName = recordingFileName(game);

  const download = () => {
    const url = URL.createObjectURL(
      new Blob([json], { type: "application/json" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3 rounded-md bg-black/40 p-4 text-white">
      <p className="text-lg font-bold">
        Save this game ({game.finalScore} points)
      </p>

      <label className="block text-sm text-white/80">
        Name this game
        <input
          type="text"
          value={label}
          onChange={(e) => {
            setLabel(e.target.value);
          }}
          placeholder="e.g. Andrew, game 7"
          className="mt-1 w-full rounded-md bg-white/10 px-3 py-2 text-white placeholder:text-white/40"
        />
      </label>

      {errors.length > 0 && (
        <div role="alert" className="rounded-md bg-red-900/50 p-3 text-sm">
          <p className="font-bold">This recording failed validation:</p>
          <ul className="list-disc pl-5">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={download} className={buttonClass}>
          Download {fileName}
        </button>
      </div>
    </div>
  );
};

export default RecordPanel;
