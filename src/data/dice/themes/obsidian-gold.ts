import type { DiceTheme } from "@/types/DiceTheme";

export const obsidianGoldTheme: DiceTheme = {
  id: "obsidian-gold",
  name: "Obsidian Gold",

  bgFrom: "rgba(39, 39, 42, 0.85)",
  bgTo: "rgba(9, 9, 11, 0.95)",

  borderLight: "rgba(250, 204, 21, 0.6)",
  borderDark: "rgba(113, 63, 18, 0.85)",

  highlightPrimary: "#facc15",
  highlightSecondary: "#fb923c",

  shadowColor: "rgba(0, 0, 0, 0.6)",

  pipSrc: "/img/dice/pip/square.svg",
  pipColor: "#facc15",
  pipSize: "72%",
  pipStyle: "embossed",

  faceOpacity: 0.95,
};
