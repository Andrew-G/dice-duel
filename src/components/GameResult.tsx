import Button from "@/components/Button";

type GameResultProps = {
  playerTotal: number;
  /** Only set when there was an opponent to beat. */
  opponentTotal?: number;
  /** Best finished-game score so far, if any. */
  bestScore: number | null;
  isNewBest: boolean;
  onPlayAgain: () => void;
};

const getVerdict = (playerTotal: number, opponentTotal: number) => {
  if (playerTotal > opponentTotal) return "You win!";
  if (playerTotal < opponentTotal) return "You lose.";
  return "It's a tie.";
};

/** Shown when a game ends: the result, the high score and "Play again". */
const GameResult = ({
  playerTotal,
  opponentTotal,
  bestScore,
  isNewBest,
  onPlayAgain,
}: GameResultProps) => (
  <div
    aria-live="polite"
    className="space-y-2 rounded-md bg-black/40 p-4 text-center"
  >
    <p className="text-lg font-bold">
      {opponentTotal === undefined
        ? `Final score: ${playerTotal}`
        : `${getVerdict(playerTotal, opponentTotal)} ${playerTotal} to ${opponentTotal}`}
    </p>
    {isNewBest ? (
      <p className="text-indigo-300">New high score!</p>
    ) : (
      bestScore !== null && (
        <p className="text-sm text-white/60">High score: {bestScore}</p>
      )
    )}
    <Button onClick={onPlayAgain}>Play again</Button>
  </div>
);

export default GameResult;
