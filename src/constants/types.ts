import { Mood } from "@/types/Character";

export type Die = 1 | 2 | 3 | 4 | 5 | 6;
export type Dice = [Die, Die, Die, Die, Die];
export type KeepMask = [0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1];



export type AIResponse = {
  action: "roll_again" | "submit" | "error";
  keep_mask?: KeepMask;
  category?: ScoreCategory;
  category_aim?: ScoreCategory;
  message: string;
  mood: Mood;
};


export type AIRequest = {
  messages: { role: string; content: string }[];
};