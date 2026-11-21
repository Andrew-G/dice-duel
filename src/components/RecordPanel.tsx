"use client";

import { useEffect, useMemo, useState } from "react";
import { createRecordedGame, validateRecordedGame } from "@/engine/recording";
import { recordingFileName, serializeRecordedGame } from "@/engine/serialize";
import type { RecordedTurn } from "@/types/Recording";

const buttonClass =
  "rounded-md bg-gray-100 px-4 py-2 text-sm text-black shadow-sm hover:bg-white";

/** Shown when any game ends: optionally name it, then download the JSON. */
const RecordPanel = ({ turns }: { turns: RecordedTurn[] }) => {
  const [id] = useState(() => `g${Date.now().toString(36)}`);

  const game = useMemo(
    () => createRecordedGame(turns, id, "game"),
    [turns, id]
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

  useEffect(() => {
    if (errors) console.warn("JSON error", JSON.stringify(errors));
  }, [errors]);

  return (
    <div className="space-y-3 rounded-md bg-black/40 p-4 text-white">
      <div className="flex flex-wrap gap-2 items-center w-full">
        <button
          type="button"
          onClick={download}
          className="cursor-pointer text-center text-xs w-full opacity-50 hover:opacity-75"
        >
          Save game JSON
        </button>
      </div>
    </div>
  );
};

export default RecordPanel;
