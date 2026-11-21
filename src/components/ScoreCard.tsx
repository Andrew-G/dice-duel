import {
  LOWER_CATEGORIES,
  UPPER_BONUS_POINTS,
  UPPER_BONUS_THRESHOLD,
  UPPER_CATEGORIES,
} from "@/engine/score";
import type { ScoreCategory, ScoreSheet } from "@/types/Game";
import type { ReactNode } from "react";

const LABELS: Record<ScoreCategory, string> = {
  ones: "Ones",
  twos: "Twos",
  threes: "Threes",
  fours: "Fours",
  fives: "Fives",
  sixes: "Sixes",
  threeOfAKind: "Three of a kind",
  fourOfAKind: "Four of a kind",
  fullHouse: "Full house",
  smallStraight: "Small straight",
  largeStraight: "Large straight",
  yahtzee: "Yahtzee",
  chance: "Chance",
};

type ScoreCardProps = {
  player: ScoreSheet;
  opponent?: ScoreSheet;
  opponentLabel?: string;
  /** What the current dice would score in each open box. */
  potential?: Partial<Record<ScoreCategory, number>>;
  /** Whether the open boxes can be clicked right now. */
  canScore?: boolean;
  onScore?: (category: ScoreCategory) => void;
};

const Dash = () => <span className="text-white/20">–</span>;

const ScoreCard = ({
  player,
  opponent,
  opponentLabel = "Opponent",
  potential,
  canScore = false,
  onScore,
}: ScoreCardProps) => {
  const categoryRow = (category: ScoreCategory) => {
    const filled = player[category];
    const preview = potential?.[category];

    return (
      <tr key={category} className="border-b border-white/10">
        <th
          scope="row"
          className="py-1 pr-2 text-left font-normal text-white/80"
        >
          {LABELS[category]}
        </th>
        <td className="w-24 py-0.5 text-right">
          {filled !== null ? (
            <span className="px-2">{filled}</span>
          ) : canScore && preview !== undefined ? (
            <button
              type="button"
              onClick={() => onScore?.(category)}
              aria-label={`Score ${preview} in ${LABELS[category]}`}
              className={`w-full rounded px-2 py-0.5 text-right bg-indigo-500/20 hover:bg-indigo-500/50 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-indigo-300 ${
                preview === 0 ? "text-white/50" : "text-indigo-200"
              }`}
            >
              {preview}
            </button>
          ) : (
            <span className="px-2">
              <Dash />
            </span>
          )}
        </td>
        {opponent && (
          <td className="w-24 px-2 py-0.5 text-right">
            {opponent[category] ?? <Dash />}
          </td>
        )}
      </tr>
    );
  };

  const upperBonusCell = (sheet: ScoreSheet) =>
    sheet.upperBonusEarned ? (
      `+${UPPER_BONUS_POINTS}`
    ) : (
      <span className="text-white/50">
        {sheet.upperSectionTotal}/{UPPER_BONUS_THRESHOLD}
      </span>
    );

  const yahtzeeBonusCell = (sheet: ScoreSheet) =>
    (sheet.lowerBonus ?? 0) > 0 ? `+${sheet.lowerBonus}` : <Dash />;

  const summaryRow = (
    label: string,
    cell: (sheet: ScoreSheet) => ReactNode,
    strong = false
  ) => (
    <tr
      key={label}
      className={`border-b border-white/10 ${
        strong ? "font-bold text-white" : "text-white/80"
      }`}
    >
      <th scope="row" className="py-1 pr-2 text-left font-normal">
        <span className={strong ? "font-bold" : ""}>{label}</span>
      </th>
      <td className="w-24 px-2 py-1 text-right">{cell(player)}</td>
      {opponent && (
        <td className="w-24 px-2 py-1 text-right">{cell(opponent)}</td>
      )}
    </tr>
  );

  const headerScoreRow = (
    label: string,
    cell: (sheet: ScoreSheet) => ReactNode
  ) => (
    <tr key={label} className={`font-bold text-white`}>
      <th scope="row" className="py-1 pr-2 text-left font-normal">
        {/* <h4>{label}</h4> */}
      </th>
      <td className="w-24 px-2 py-1 text-right">
        <h4 className="text-3xl">{cell(player)}</h4>
      </td>
      {opponent && (
        <td className="w-24 px-2 py-1 text-right">
          <h4 className="text-3xl shimmer shimmer-angle-75 text-foreground/40">
            {cell(opponent)}
          </h4>
        </td>
      )}
    </tr>
  );

  return (
    <div className="rounded-md bg-black/40 p-3 text-sm text-white">
      <span className="shimmer text-foreground/60">Loading...</span>
      <table className="w-full border-collapse">
        <thead>
          {headerScoreRow("Total", (sheet) => sheet.total ?? 0)}
          <tr className="border-b border-white/30 text-white/60">
            <th scope="col" className="py-1 text-left font-normal">
              <span className="sr-only">Box</span>
            </th>
            <th scope="col" className="px-2 py-1 text-right font-normal">
              You
            </th>
            {opponent && (
              <th scope="col" className="px-2 py-1 text-right font-normal">
                {opponentLabel}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {UPPER_CATEGORIES.map(categoryRow)}
          {summaryRow("Upper bonus", upperBonusCell)}
          {LOWER_CATEGORIES.map(categoryRow)}
          {summaryRow("Yahtzee bonus", yahtzeeBonusCell)}
          {summaryRow("Total header", (sheet) => sheet.total ?? 0, true)}
        </tbody>
      </table>
    </div>
  );
};

export default ScoreCard;
