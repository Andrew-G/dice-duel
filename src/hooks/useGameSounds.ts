import useSound from "use-sound";
import chatMessageSfx from "@/assets/sfx/chat-message.mp3";
import diceRollSfx from "@/assets/sfx/dice-roll.mp3";

/**
 * Loads the sound effects. Call it once near the top of the app (not inside a
 * game) so the audio is already loaded before the first roll.
 */
export function useGameSounds() {
  const [playRoll] = useSound(diceRollSfx);
  const [playOpponentRoll] = useSound(diceRollSfx, { volume: 0.4 });
  const [playChat] = useSound(chatMessageSfx);
  return { playRoll, playOpponentRoll, playChat };
}

export type GameSounds = ReturnType<typeof useGameSounds>;
