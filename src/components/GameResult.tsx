import Button from "@/components/Button";

type GameResultProps = {
  playerTotal: number;
  /** Only set when there was an opponent to beat. */
  opponentTotal?: number;
  /** Best finished-game score so far, if any. */
  bestScore: number | null;
  isNewBest: boolean;
  /** Extra line under the verdict, e.g. what happens next in Challenge mode. */
  note?: string;
  /** The main button. Defaults to "Play again". */
  actionLabel?: string;
  /**
   * Challenge mode: show the verdict as a big headline that blurs in and
   * shimmers, like the opponent's name on the Challenge screen.
   */
  animateVerdict?: boolean;
  onAction: () => void;
};

/**
 * The verdict's fill: a soft base colour with a narrow bright band in the
 * middle. It's a third of the gradient wide, and the shimmer animation slides
 * it across the letters. (Same shape as the opponent name's fill.)
 */
const shimmerFill = (base: string, highlight: string) =>
  `linear-gradient(100deg, ${base} 38%, ${highlight} 46%, #ffffff 50%, ${highlight} 54%, ${base} 62%)`;

// The glow classes are written out in full so Tailwind can see them.
const VERDICTS = {
  win: {
    text: "You win!",
    fill: shimmerFill("#c7d2fe", "#fbbf24"),
    glow: "drop-shadow-[0_0_20px_rgba(251,191,36,0.35)]",
  },
  loss: {
    text: "You lose.",
    fill: shimmerFill("#fecaca", "#ef4444"),
    glow: "drop-shadow-[0_0_20px_rgba(239,68,68,0.35)]",
  },
  tie: {
    text: "It's a tie.",
    fill: shimmerFill("#e5e7eb", "#a5b4fc"),
    glow: "drop-shadow-[0_0_20px_rgba(165,180,252,0.35)]",
  },
};

const getVerdict = (playerTotal: number, opponentTotal: number) => {
  if (playerTotal > opponentTotal) return VERDICTS.win;
  if (playerTotal < opponentTotal) return VERDICTS.loss;
  return VERDICTS.tie;
};

/** Shown when a game ends: the result, the high score and the next step. */
const GameResult = ({
  playerTotal,
  opponentTotal,
  bestScore,
  isNewBest,
  note,
  actionLabel = "Play again",
  animateVerdict = false,
  onAction,
}: GameResultProps) => {
  const versus =
    opponentTotal === undefined
      ? null
      : {
          opponentTotal,
          verdict: getVerdict(playerTotal, opponentTotal),
        };

  const details = (
    <>
      {note && <p className="text-indigo-200">{note}</p>}
      {isNewBest ? (
        <p className="text-indigo-300">New high score!</p>
      ) : (
        bestScore !== null && (
          <p className="text-sm text-white/60">High score: {bestScore}</p>
        )
      )}
      <Button onClick={onAction}>{actionLabel}</Button>
    </>
  );

  return (
    <div
      aria-live="polite"
      className="space-y-2 rounded-md bg-black/40 p-4 text-center"
    >
      {versus && animateVerdict ? (
        <>
          <div className={versus.verdict.glow}>
            <h3
              style={{ backgroundImage: versus.verdict.fill }}
              className="bg-[length:300%_100%] bg-clip-text px-3 text-5xl font-black italic leading-tight tracking-wide text-transparent motion-safe:animate-opponent-name sm:text-6xl"
            >
              {versus.verdict.text}
            </h3>
          </div>

          {/* Held back until the verdict has landed. */}
          <div className="space-y-2 motion-safe:animate-fade-up">
            <p className="text-lg font-bold">
              {playerTotal} to {versus.opponentTotal}
            </p>
            {details}
          </div>
        </>
      ) : (
        <>
          <p className="text-lg font-bold">
            {versus
              ? `${versus.verdict.text} ${playerTotal} to ${versus.opponentTotal}`
              : `Final score: ${playerTotal}`}
          </p>
          {details}
        </>
      )}
    </div>
  );
};

export default GameResult;
