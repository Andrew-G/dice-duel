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
}

export enum CharacterEmotions {
  DEFAULT = 'default',
  SUCCESS = 'success',
  FAILURE = 'failure',
  THINKING = 'thinking'
}