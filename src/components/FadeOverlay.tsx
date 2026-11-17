import clsx from "clsx";

type FadeOverlayProps = {
  /** Fades to black when true, and back out again when false. */
  isVisible: boolean;
  /** Shows a spinner on the black, e.g. while an image is still loading. */
  isLoading?: boolean;
  /** How long each fade takes. */
  durationMs?: number;
};

/**
 * A full-screen black cover for fading between screens. While it's visible it
 * also blocks clicks, so the player can't act on a screen that's on its way
 * out.
 */
const FadeOverlay = ({
  isVisible,
  isLoading = false,
  durationMs = 500,
}: FadeOverlayProps) => (
  <div
    aria-hidden={!isVisible}
    style={{ transitionDuration: `${durationMs}ms` }}
    className={clsx(
      "fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity motion-reduce:transition-none",
      isVisible ? "opacity-100" : "pointer-events-none opacity-0"
    )}
  >
    {/* Always mounted, so it fades out along with the black. */}
    <div
      role={isLoading ? "status" : undefined}
      style={{ transitionDuration: `${durationMs}ms` }}
      className={clsx(
        "transition-opacity motion-reduce:transition-none",
        isLoading ? "opacity-100" : "opacity-0"
      )}
    >
      <span
        aria-hidden="true"
        className={clsx(
          "block h-10 w-10 rounded-full border-4 border-white/20 border-t-indigo-300",
          isVisible && "motion-safe:animate-spin"
        )}
      />
      {isLoading && <span className="sr-only">Loading</span>}
    </div>
  </div>
);

export default FadeOverlay;
