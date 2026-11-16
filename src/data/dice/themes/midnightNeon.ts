import { DiceTheme } from "@/types/DiceTheme";

export const midnightNeonTheme: DiceTheme = {
  id: "midnight-neon",
  name: "Midnight Neon",

  bgFrom: "rgba(15, 23, 42, 0.5)",
  bgTo: "rgba(3, 7, 18, 0.5)",

  borderLight: "rgba(45, 212, 191, 0.6)",
  borderDark: "rgba(15, 23, 42, 0.8)",

  highlightPrimary: "#2dd4bf",
  highlightSecondary: "#38bdf8",

  shadowColor: "rgba(0, 0, 0, 0.6)",

  pipSrc: "/img/dice/pip/square.svg",
  pipColor: "#2dd4bf",
  pipSize: "90%",
  pipStyle: "embossed",

  faceOpacity: 0.95,
};