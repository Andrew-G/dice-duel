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

const NAME_BASE = "#c7d2fe";
const NAME_HIGHLIGHT = "#fbbf24";

/**
 * The opponent name's fill: a soft indigo with a narrow gold band in the
 * middle. The band is a third of the gradient wide, and the shimmer animation
 * slides it across the letters.
 */
const NAME_FILL = `linear-gradient(100deg, ${NAME_BASE} 38%, ${NAME_HIGHLIGHT} 46%, #ffffff 50%, ${NAME_HIGHLIGHT} 54%, ${NAME_BASE} 62%)`;

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
    if (
      window.confirm(
        "Reset your Challenge progress and start from the first opponent?"
      )
    ) {
      onReset();
    }
  };

  return (
    <div className="flex flex-col space-y-4 py-4">
      <h2 className="text-center text-xl font-bold">Challenge</h2>

      <section
        aria-labelledby="challenge-opponent"
        className="relative flex flex-col items-center overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-indigo-950/70 to-black px-4 pb-6 pt-5 text-center"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_50%_40%,rgba(129,140,248,0.4),transparent_65%)]"
        />

        <p className="relative text-sm text-indigo-300">
          {isComplete
            ? `All ${TOTAL} opponents beaten`
            : `Opponent ${stage + 1} of ${TOTAL}`}
        </p>

        {/* Keyed by opponent, so every new opponent replays the entrance. */}
        <div
          key={opponent.id}
          className="relative flex w-full flex-col items-center"
        >
          <div className="relative mt-2 flex h-64 w-64 items-center justify-center motion-safe:animate-stage-shake sm:h-72 sm:w-72">
            <span
              aria-hidden="true"
              className="absolute inset-6 rounded-full border-2 border-indigo-200/70 shadow-[0_0_30px_rgba(165,180,252,0.5)] motion-reduce:hidden motion-safe:animate-impact-ring"
            />
            <img
              src={opponent.avatarSrc}
              alt={opponent.name}
              className="relative h-full w-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] motion-safe:animate-opponent-slam"
            />
          </div>

          <div className="drop-shadow-[0_0_20px_rgba(251,191,36,0.35)]">
            <h3
              id="challenge-opponent"
              style={{ backgroundImage: NAME_FILL }}
              className="bg-[length:300%_100%] bg-clip-text px-3 text-5xl font-black italic leading-tight tracking-wide text-transparent motion-safe:animate-opponent-name sm:text-6xl"
            >
              {opponent.name}
            </h3>
          </div>

          <div className="mt-3 flex w-full flex-col items-center space-y-2 motion-safe:animate-fade-up">
            <p className="max-w-md font-medium text-white/85">
              {opponent.brief}
            </p>
            {/* <p className="max-w-md text-sm text-white/55">
              {opponent.description}
            </p> */}

            {isComplete && (
              <p className="text-sm text-indigo-200">
                You&apos;ve beaten every opponent. Rematch the champion any
                time.
              </p>
            )}

            <div className="flex flex-col items-center gap-2 pt-3">
              <Button onClick={() => onStart(stage)}>
                {isComplete
                  ? `Rematch ${opponent.name}`
                  : `Battle ${opponent.name}`}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ol
        aria-label="Challenge opponents, easiest to hardest"
        className="grid grid-cols-4 gap-2 sm:grid-cols-8"
      >
        {CHALLENGE_ORDER.map((character, index) => {
          const state =
            index < defeated
              ? "beaten"
              : index === defeated
              ? "next"
              : "locked";
          return (
            <li
              key={character.id}
              aria-label={
                state === "locked"
                  ? `Opponent ${index + 1}: locked`
                  : `Opponent ${index + 1}: ${character.name}, ${
                      state === "beaten" ? "beaten" : "next up"
                    }`
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
