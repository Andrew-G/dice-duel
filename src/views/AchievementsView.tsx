import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import Button from "@/components/Button";
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from "@/data/achievements";
import type { Achievement, AchievementStats } from "@/types/Achievement";

type AchievementsViewProps = {
  /** Achievement id -> when it was unlocked (ISO date). */
  unlocked: Record<string, string>;
  stats: AchievementStats;
  /** How many Challenge opponents have been beaten. */
  challengeDefeated: number;
  onBack: () => void;
};

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

type AchievementItemProps = {
  achievement: Achievement;
  unlockedAt?: string;
  progress?: { current: number; target: number };
};

const AchievementItem = ({
  achievement,
  unlockedAt,
  progress,
}: AchievementItemProps) => {
  const isUnlocked = unlockedAt !== undefined;
  const date = unlockedAt ? formatDate(unlockedAt) : null;

  return (
    <li
      className={clsx(
        "flex items-center gap-3 rounded-lg border p-3",
        isUnlocked
          ? "border-amber-300/40 bg-amber-300/10"
          : "border-white/10 bg-white/5"
      )}
    >
      <span
        aria-hidden="true"
        className={clsx(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg",
          isUnlocked
            ? "bg-amber-300 text-amber-950 shadow-[0_0_14px_rgba(251,191,36,0.45)]"
            : "bg-white/10 text-white/40"
        )}
      >
        <FontAwesomeIcon icon={isUnlocked ? achievement.icon : faLock} />
      </span>

      <div className="min-w-0 flex-1">
        <p className={clsx("font-bold", !isUnlocked && "text-white/70")}>
          {achievement.title}
          <span className="sr-only">{isUnlocked ? " (unlocked)" : " (locked)"}</span>
        </p>
        <p className="text-sm text-white/60">{achievement.description}</p>

        {isUnlocked ? (
          date && <p className="mt-1 text-xs text-amber-200/80">Unlocked {date}</p>
        ) : (
          progress &&
          progress.current > 0 && (
            <div className="mt-1.5 flex items-center gap-2">
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={progress.target}
                aria-valuenow={progress.current}
                aria-label={`${achievement.title} progress`}
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"
              >
                <div
                  className="h-full rounded-full bg-indigo-400"
                  style={{
                    width: `${(progress.current / progress.target) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs text-white/60">
                {progress.current} / {progress.target}
              </span>
            </div>
          )
        )}
      </div>
    </li>
  );
};

/** Every achievement, with what's been unlocked and how far along the rest are. */
const AchievementsView = ({
  unlocked,
  stats,
  challengeDefeated,
  onBack,
}: AchievementsViewProps) => {
  const unlockedCount = ACHIEVEMENTS.filter((a) => a.id in unlocked).length;
  const context = { game: null, stats, challengeDefeated };

  return (
    <div className="flex flex-col space-y-5 py-4">
      <header className="space-y-2 text-center">
        <h2 className="text-xl font-bold">Achievements</h2>
        <p className="text-sm text-indigo-300">
          {unlockedCount} of {ACHIEVEMENTS.length} unlocked
        </p>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={ACHIEVEMENTS.length}
          aria-valuenow={unlockedCount}
          aria-label="Achievements unlocked"
          className="mx-auto h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/10"
        >
          <div
            className="h-full rounded-full bg-amber-300"
            style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
          />
        </div>
      </header>

      {ACHIEVEMENT_CATEGORIES.map(({ id, label }) => (
        <section key={id} aria-label={label} className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-white/50">
            {label}
          </h3>
          <ul className="space-y-2">
            {ACHIEVEMENTS.filter((a) => a.category === id).map((achievement) => (
              <AchievementItem
                key={achievement.id}
                achievement={achievement}
                unlockedAt={unlocked[achievement.id]}
                progress={achievement.progress?.(context)}
              />
            ))}
          </ul>
        </section>
      ))}

      <Button variant="small" onClick={onBack} className="self-center">
        Back
      </Button>
    </div>
  );
};

export default AchievementsView;
