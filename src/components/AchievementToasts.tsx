import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef } from "react";
import { ACHIEVEMENTS_BY_ID } from "@/data/achievements";

/** How long a toast stays up before it goes away by itself. */
const TOAST_MS = 4500;

type ToastProps = {
  id: string;
  onDismiss: (id: string) => void;
};

const Toast = ({ id, onDismiss }: ToastProps) => {
  const achievement = ACHIEVEMENTS_BY_ID[id];

  // Keep the timer running even though the parent passes a new callback on
  // every render.
  const dismissRef = useRef(onDismiss);
  useEffect(() => {
    dismissRef.current = onDismiss;
  });
  useEffect(() => {
    const timer = window.setTimeout(() => dismissRef.current(id), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [id]);

  if (!achievement) return null;

  return (
    <button
      type="button"
      onClick={() => onDismiss(id)}
      className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg border border-amber-300/50 bg-black/90 p-3 text-left text-white shadow-2xl motion-safe:animate-toast-in"
    >
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-300 text-amber-950"
      >
        <FontAwesomeIcon icon={achievement.icon} />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase tracking-wide text-amber-300">
          Achievement unlocked
        </span>
        <span className="block truncate font-bold">{achievement.title}</span>
        <span className="block text-sm text-white/60">
          {achievement.description}
        </span>
      </span>
    </button>
  );
};

type AchievementToastsProps = {
  /** The achievements just unlocked. */
  ids: string[];
  onDismiss: (id: string) => void;
};

/** Pop-ups announcing new achievements, over whatever screen is showing. */
const AchievementToasts = ({ ids, onDismiss }: AchievementToastsProps) => (
  <div
    aria-live="polite"
    className="pointer-events-none fixed inset-x-0 top-4 z-40 flex flex-col items-center gap-2 px-4"
  >
    {ids.map((id) => (
      <Toast key={id} id={id} onDismiss={onDismiss} />
    ))}
  </div>
);

export default AchievementToasts;
