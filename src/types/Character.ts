import { BotSkill } from "@/engine/solver/policy";
import { CHARACTER_ID } from "@/data/opponent";
import { PHRASES } from "@/constants/lang";

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
  brief?: string;
  botSkill: BotSkill;
  diceId: string;
  phrases: PHRASES;
}