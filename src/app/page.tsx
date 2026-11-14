"use client";
import BotResponse from "@/components/BotResponse";
import GameChat from "@/components/GameChat";
import GameDice from "@/components/GameDice";
import GameScore from "@/components/GameScore";
import GameStateTable from "@/components/GameState";
import { getRandomPhrase, phrases } from "@/constants/lang";
import {
  AIResponse,
  Dice,
  Die,
  KeepMask,
} from "@/constants/types";
import { useEffect, useRef, useState } from "react";
import useSound from "use-sound";

import diceRollSfx from "@/assets/sfx/dice-roll.mp3";
import chatMessageSfx from "@/assets/sfx/chat-message.mp3";
import Bot from "@/components/Bot";
// import useOpenAi from "@/hooks/useOpenAi";
// import { createGamePrompt } from "@/constants/prompt";
import { GameState, defaultGameState } from "@/types/game";
import { Mood } from "@/types/Character";
import useOpponent from "@/hooks/useOpponent";





 

// const createGameStatePrompt = (gameState: GameState) => {
//   return `
// Game state:
// {
//   "rolls": ${gameState.rollsRemaining},
//   "dice": [${gameState?.currentRoll ? gameState.currentRoll.join(", ") : ""}]
// }
// `;
// };

export default function ChatComponent() {
  const [messages, setMessages] = useState<string[]>([]);
  // const [response, setResponse] = useState<string | null>(null);
  const [dice, setDice] = useState<Dice | null>(null);
  const [keepMask, setKeepMask] = useState<KeepMask>([0, 0, 0, 0, 0]);
  const [rollsRemaining, setRollsRemaining] = useState(3);
  const [gameState, setGameState] = useState<GameState>(defaultGameState);
  const [isRolling, setIsRolling] = useState(false);
  const [playDiceRollSfx] = useSound(diceRollSfx);
  const [playChatMessageSfx] = useSound(chatMessageSfx);

  const handleRoll = (dice?: Dice, keepMask?: KeepMask) => {
    console.log("handleRoll", dice, keepMask);
    setIsRolling(true);
    let newRoll = rollDice(dice, keepMask);
    let newRollsRemaining = rollsRemaining - 1;
    setRollsRemaining(newRollsRemaining);
    setDice(newRoll);
    setGameState((prev) => ({
      ...prev,
      currentRoll: newRoll,
      rollsRemaining: newRollsRemaining,
    }));
    setTimeout(() => {
      setIsRolling(false);
    }, 1000);
  };
  const { handleAIRequest, messages: aiMessages, mood, isPending, isError } = useOpponent(gameState, handleRoll);

  useEffect(() => {
    setMessages((prev) => [...prev, getRandomPhrase(phrases.greetings)]);
    playChatMessageSfx();
  }, []);


  // Handle game state
  useEffect(() => {
    setGameState((prev) => ({
      ...prev,
      currentRoll: dice,
      rollsRemaining: rollsRemaining,
      keepMask,
    }));
  }, [dice, rollsRemaining, keepMask]);

  

  

  const rollDice = (currentDice?: Dice | null, keepMask?: KeepMask): Dice => {
    console.log("rollDice", currentDice, keepMask);
    playDiceRollSfx();
    return (
      currentDice ??
      Array.from(
        { length: 5 },
        () => (Math.floor(Math.random() * 6) + 1) as Die
      )
    ).map((die, index) =>
      keepMask?.[index] === 1
        ? die
        : ((Math.floor(Math.random() * 6) + 1) as Die)
    ) as Dice;
  };

  
  const handleKeepDie = (index: number) => {
    const newKeepMask: KeepMask = keepMask.map((v, i) =>
      i === index ? 1 - v : v
    ) as KeepMask;
    // @ts-ignore
    setKeepMask(newKeepMask);
    setGameState((prev) => ({
      ...prev,
      keepMask: newKeepMask,
    }));
  };
  const handleClear = () => {
    setRollsRemaining(3);
    setDice(null);
    setKeepMask([0, 0, 0, 0, 0]);
    setGameState(defaultGameState);
    // setMood("happy");
    // setMessages([getRandomPhrase(phrases.greetings)]);
  };

  console.log("gameState", gameState);

  return (
    <div className="flex flex-1 items-center content-center bg-gradient-to-b from-violet-950/[0.9] to-indigo-950/[0.75] w-full h-full text-black">
      <div className="flex flex-col space-y-4 rounded-lg w-full md:w-1/2 p-4 m-auto bg-gradient-to-b from-black/[.5] to-black shadow-2xl border border-black/[.75]">
        <GameStateTable gameState={gameState} mini />

        <div className="flex flex-row space-x-2 items-center justify-center">
          <button
            onClick={handleClear}
            className="bg-gray-100 py-2 px-6 rounded-md shadow "
          >
            Restart
          </button>
          <button
            onClick={() => handleRoll(dice ?? undefined, keepMask)}
            disabled={rollsRemaining === 0}
            className="bg-gray-100 py-2 px-6 rounded-md shadow "
          >
            Start game
          </button>

          <button
            onClick={handleAIRequest}
            className="bg-gray-100 py-2 px-6 rounded-md shadow "
          >
            Send
          </button>
        </div>
        <GameDice
          dice={dice ?? undefined}
          keepMask={keepMask}
          onKeepToggle={handleKeepDie}
          isRolling={isRolling}
          isWaiting={isPending}
        />

        <div className="flex flex-row space-x-4">
          <Bot mood={isPending ? 'think' : isError ? 'dying' : mood} />
          <GameChat messages={aiMessages} />
        </div>
        {/* <GameScore gameState={gameState} /> */}
      </div>
    </div>
  );
}
