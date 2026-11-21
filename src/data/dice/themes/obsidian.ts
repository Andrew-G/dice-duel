import type { DiceTheme } from "@/types/DiceTheme";

export const obsidianTheme: DiceTheme = {
  id: "obsidian",
  name: "Obsidian",

  bgFrom: "#454545",
  bgTo: "#171717",

  borderLight: "#777777",
  borderDark: "#080808",

  highlightPrimary: "#ffffff",
  highlightSecondary: "#aaaaaa",

  shadowColor: "#000000",

  pipSrc: "/img/dice/pip/circle.svg",
  pipColor: "#999999",
  pipSize: "72%",
  pipStyle: "debossed",

  faceOpacity: 1,
  faceTexture: "/img/dice/texture/steel.jpg",
};
