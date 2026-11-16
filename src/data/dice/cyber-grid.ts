import type { DiceTheme } from "../types";

export const cyberGridTheme: DiceTheme = {
  id: "cyber-grid",
  name: "Cyber Grid",

  bgFrom: "rgba(6, 182, 212, 0.25)",
  bgTo: "rgba(15, 23, 42, 0.7)",

  borderLight: "rgba(34, 211, 238, 0.65)",
  borderDark: "rgba(8, 145, 178, 0.75)",

  highlightPrimary: "#22d3ee",
  highlightSecondary: "#f472b6",

  shadowColor: "rgba(6, 182, 212, 0.25)",

  pipSrc: "/img/dice/pip/hexagon.svg",
  pipColor: "#22d3ee",
  pipSize: "80%",
  pipStyle: "flat",

  faceOpacity: 0.9,
};
