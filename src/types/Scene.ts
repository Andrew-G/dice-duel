import { CharacterEmotions } from "./Character";

export type SceneMessage = {
  message: string;
  emotion: CharacterEmotions;
};

export type CharacterChallengeScenes = {
  introduction: SceneMessage[];
  success: SceneMessage[];
  failure: SceneMessage[];
};