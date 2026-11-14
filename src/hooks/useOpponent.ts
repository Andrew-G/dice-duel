import { getRandomPhrase, phrases } from "@/constants/lang";
import { createGamePrompt } from "@/constants/prompt";
import { AIResponse } from "@/constants/types";
import { Mood } from "@/types/Character";
import { GameState } from "@/types/game";
import { useEffect, useState } from "react";
import useOpenAi from "./useOpenAi";
import { Dice, KeepMask } from "@/types/dice";

const createGameStatePrompt = (gameState: GameState) => {
    return `
  Game state:
  {
    "rolls": ${gameState.rollsRemaining},
    "dice": [${gameState?.currentRoll ? gameState.currentRoll.join(", ") : ""}]
  }
  `;
  };

const useOpponent = (gameState: GameState, handleRoll: (dice: Dice, keepMask: KeepMask) => void) => {
const [previousActions, setPreviousActions] = useState<any[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [mood, setMood] = useState<Mood>("happy");

  useEffect(() => {
    setMessages((prev) => [...prev, getRandomPhrase(phrases.greetings)]);
    // playChatMessageSfx();
  }, []);
  
    const handleAIRequest = () => {
        setTimeout(() => {
          setMessages((prev) => [...prev, getRandomPhrase(phrases.thinking)]);
        }, 200);
    
        mutate({
            messages: [
              { role: "system", content: createGamePrompt() },
              ...previousActions,
              { role: "system", content: createGameStatePrompt(gameState) },
            ],
          });
      };
    
      const handleAIResponse = (response: AIResponse) => {
        console.log('handleAIResponse', response);
        const {
          action,
          keep_mask = [0, 0, 0, 0, 0],
          message,
          category,
          category_aim,
          mood,
        } = response || {};
        
    
        if (message) {
          console.log("Setting message", message);
          setMessages((prev) => [...prev, message]);
        }
        if (mood) {
          console.log("Setting mood", mood);
          setMood(mood);
        }
        if (action === "roll_again" && gameState?.currentRoll) {
            setPreviousActions((prev) => [
                ...prev,
                {
                    role: 'system',
                    content: createGameStatePrompt(gameState)
                },
                {
                    role: "assistant",
                    content: JSON.stringify({
                        action,
                        keep_mask,
                        category_aim,
                        message,
                        mood,
                    })
                }
            ]);
          // Roll the dice again based on the keep mask
          console.log("Rolling dice again with keep mask", gameState.currentRoll, keep_mask);
          handleRoll(gameState.currentRoll, keep_mask);
        } else if (action === "submit") {
          // Submit the dice to the category
          console.log("Submitting to category", category);
          
        } else if (action === "error") {
            console.log('useOpponent error:');
        }
        // setKeepMask(keep_mask);
      }
    
      const handleAIError = (error: Error) => {
        console.error("AI Error:", error);
        setMessages((prev) => [...prev, getRandomPhrase(phrases.failure)]);
        setMood("dying");
      }
      const { mutate, data, isPending, isError, error } = useOpenAi(handleAIResponse,handleAIError);

    return {
        data,
        handleAIRequest,
        mood,
        messages,
        isPending,
        isError,
        error,
    }
}

export default useOpponent;