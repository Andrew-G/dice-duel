import { BotSkill } from "@/engine/solver/policy";
import { PHRASES } from "@/constants/lang";
import { CHARACTER_ID } from "@/data/opponent/characters";

export type Mood =
  | "angry"
  | "barf"
  | "confused"
  | "cry"
  | "eyeroll"
  | "heart"
  | "neutral"
  | "think"
  | "wink"
  | "ay"
  | "blush"
  | "cool"
  | "dying"
  | "happy"
  | "laugh"
  | "sad"
  | "what"
  | "woah";

export type Character = {
  id: CHARACTER_ID;
  name: string;
  avatarSrc: string;
  description: string;
  introduction: string;
  brief?: string;
  botSkill: BotSkill;
  diceId: string;
  phrases: PHRASES;
};

export enum CharacterEmotions {
  DEFAULT = "default",
  SUCCESS = "success",
  FAILURE = "failure",
  THINKING = "thinking",
}

export const reactionMap: Record<Mood, CharacterEmotions> = {
  angry: CharacterEmotions.FAILURE,
  ay: CharacterEmotions.FAILURE,
  barf: CharacterEmotions.FAILURE,
  blush: CharacterEmotions.SUCCESS,
  confused: CharacterEmotions.THINKING,
  cool: CharacterEmotions.SUCCESS,
  cry: CharacterEmotions.FAILURE,
  dying: CharacterEmotions.FAILURE,
  eyeroll: CharacterEmotions.DEFAULT,
  happy: CharacterEmotions.SUCCESS,
  heart: CharacterEmotions.SUCCESS,
  laugh: CharacterEmotions.SUCCESS,
  neutral: CharacterEmotions.DEFAULT,
  sad: CharacterEmotions.FAILURE,
  think: CharacterEmotions.THINKING,
  what: CharacterEmotions.THINKING,
  wink: CharacterEmotions.SUCCESS,
  woah: CharacterEmotions.SUCCESS,
};
