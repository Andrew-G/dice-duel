import clsx from "clsx";
import Button from "@/components/Button";
import { CHALLENGE_ORDER } from "@/data/opponent/challenge";

type ChallengeViewProps = {
  /** How many opponents have been beaten, in ladder order. */
  defeated: number;
  /** Start a match against the opponent at this place in the ladder. */
  onStart: (stage: number) => void;
  onReset: () => void;
  onBack: () => void;
};

const TOTAL = CHALLENGE_ORDER.length;

/**
 * The Challenge hub: who you're up against now, and how far up the ladder
 * you've come. Opponents unlock one at a time, easiest first.
 */
const ChallengeView = ({
  defeated,
  onStart,
  onReset,
  onBack,
}: ChallengeViewProps) => {
  const isComplete = defeated >= TOTAL;
  const stage = Math.min(defeated, TOTAL - 1);
  const opponent = CHALLENGE_ORDER[stage];

  const confirmReset = () => {
    if (window.confirm("Reset your Challenge progress and start from the first opponent?")) {
      onReset();
    }
  };

  return (
    <div className="flex flex-col space-y-4 py-4">
      <h2 className="text-center text-xl font-bold">Challenge</h2>

      <section
        aria-labelledby="challenge-opponent"
        className="flex flex-col items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-start"
      >
        <img
          src={opponent.avatarSrc}
          alt={opponent.name}
          className="h-44 w-44 shrink-0 object-contain drop-shadow-[0_0_18px_rgba(129,140,248,0.35)]"
        />

        <div className="flex w-full flex-col space-y-2 text-center sm:text-left">
          <p className="text-sm text-indigo-300">
            {isComplete
              ? `All ${TOTAL} opponents beaten`
              : `Opponent ${stage + 1} of ${TOTAL}`}
          </p>
          <h3 id="challenge-opponent" className="text-2xl font-bold">
            {opponent.name}
          </h3>
          <p className="font-medium text-white/80">{opponent.brief}</p>
          <p className="text-sm text-white/60">{opponent.description}</p>

          {isComplete && (
            <p className="text-sm text-indigo-200">
              You&apos;ve beaten every opponent. Rematch the champion any time.
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 sm:justify-start">
            <Button onClick={() => onStart(stage)}>
              {isComplete ? `Rematch ${opponent.name}` : `Fight ${opponent.name}`}
            </Button>
            {!isComplete && defeated > 0 && (
              <span className="text-sm text-white/60">
                Lose, and you try again until you win.
              </span>
            )}
          </div>
        </div>
      </section>

      <ol
        aria-label="Challenge opponents, easiest to hardest"
        className="grid grid-cols-4 gap-2 sm:grid-cols-8"
      >
        {CHALLENGE_ORDER.map((character, index) => {
          const state =
            index < defeated ? "beaten" : index === defeated ? "next" : "locked";
          return (
            <li
              key={character.id}
              aria-label={
                state === "locked"
                  ? `Opponent ${index + 1}: locked`
                  : `Opponent ${index + 1}: ${character.name}, ${state === "beaten" ? "beaten" : "next up"}`
              }
              className={clsx(
                "relative flex flex-col items-center gap-1 rounded-md border p-1.5 text-center",
                state === "next"
                  ? "border-indigo-300 bg-indigo-400/10"
                  : "border-white/10 bg-white/5"
              )}
            >
              <img
                src={character.avatarSrc}
                alt=""
                className={clsx(
                  "h-12 w-12 object-contain",
                  state === "locked" && "brightness-0 opacity-40",
                  state === "beaten" && "opacity-60"
                )}
              />
              <span
                className={clsx(
                  "w-full truncate text-xs",
                  state === "locked" ? "text-white/40" : "text-white/80"
                )}
              >
                {state === "locked" ? "???" : character.name}
              </span>
              {state === "beaten" && (
                <span
                  aria-hidden="true"
                  className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-black"
                >
                  ✓
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex items-center justify-center gap-2">
        <Button variant="small" onClick={onBack}>
          Back
        </Button>
        {defeated > 0 && (
          <Button variant="small" onClick={confirmReset}>
            Reset progress
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChallengeView;
