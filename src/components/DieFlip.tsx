import type { Die } from "@/types/Dice";
import type { DiceTheme } from "@/types/DiceTheme";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import DieFace from "./DieFace";

/** A slower, single roll. Callers use this to time the unmount. */
export const DIE_FLIP_MS = 850;

/** A touch more space between dice, so the ripple reads as relaxed. */
export const DIE_FLIP_STAGGER_MS = 80;

/** Half a die's width (a die is `h-10 w-10`, i.e. 2.5rem). */
const HALF = "1.25rem";

/** Short perspective distance: close enough that the roll looks properly 3D. */
const PERSPECTIVE = "9rem";

/** Fraction of the animation where the theme snaps. Matches the hop's peak. */
const SWAP_AT = 0.4;

const cubeAt = (xDeg: number, yDeg: number, zDeg: number) =>
  `translateZ(-${HALF}) rotateX(${xDeg}deg) rotateY(${yDeg}deg) rotateZ(${zDeg}deg)`;

/** Front, back, top, bottom, left, right. */
const FACE_TRANSFORMS = [
  `translateZ(${HALF})`,
  `rotateY(180deg) translateZ(${HALF})`,
  `rotateX(90deg) translateZ(${HALF})`,
  `rotateX(-90deg) translateZ(${HALF})`,
  `rotateY(-90deg) translateZ(${HALF})`,
  `rotateY(90deg) translateZ(${HALF})`,
] as const;

/**
 * Values for the six faces of a standard die (opposite faces sum to 7), with
 * `value` on the front. Assumes `Die` is 1–6; adjust if yours differs.
 */
const faceValues = (value: Die): Die[] => {
  const v = value as number;
  const [a, b] = [1, 2, 3, 4, 5, 6].filter((n) => n !== v && n !== 7 - v);
  return [v, 7 - v, a, 7 - a, b, 7 - b] as Die[];
};

type CubeProps = {
  theme: DiceTheme;
  faces: Die[];
  innerRef: RefObject<HTMLDivElement | null>;
  startHidden?: boolean;
};

/** A closed cube in a single theme. */
const Cube = ({ theme, faces, innerRef, startHidden }: CubeProps) => (
  <div
    ref={innerRef}
    className="absolute inset-0"
    style={{
      transformStyle: "preserve-3d",
      transform: cubeAt(0, 0, 0),
      visibility: startHidden ? "hidden" : "visible",
    }}
  >
    {FACE_TRANSFORMS.map((transform, i) => (
      <div
        key={i}
        className="absolute inset-0"
        style={{ backfaceVisibility: "hidden", transform }}
      >
        <DieFace theme={theme} value={faces[i]} />
      </div>
    ))}
  </div>
);

type DieFlipProps = {
  /** The theme the die is leaving. */
  from: DiceTheme;
  /** The theme it ends in. */
  to: DiceTheme;
  value: Die;
  /** Wait this long before starting, so the dice roll one after another. */
  delayMs: number;
  /** Sideways wobble mid-roll (degrees). Its sign also picks the spin direction. */
  wobbleDeg: number;
};

/**
 * One die tumbling, with the theme changing instantly mid-tumble.
 *
 * Two identical cubes (old theme, new theme) share the same rotation timeline.
 * At `SWAP_AT`, when the die is at the top of its hop and spinning fastest,
 * visibility flips from one to the other in a single frame. No blending.
 *
 * It ends flat on the new theme's front face, exactly like a resting die, so
 * swapping to the normal die afterwards is seamless.
 */
const DieFlip = ({ from, to, value, delayMs, wobbleDeg }: DieFlipProps) => {
  const hop = useRef<HTMLDivElement>(null);
  const fromCube = useRef<HTMLDivElement>(null);
  const toCube = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const blur = useRef<HTMLDivElement>(null);

  const faces = useMemo(() => faceValues(value), [value]);

  useEffect(() => {
    const timing: KeyframeAnimationOptions = {
      duration: DIE_FLIP_MS,
      delay: delayMs,
      fill: "both",
    };

    // Hop: a small lift, a soft landing, barely a bounce.
    const hopAnim = hop.current?.animate(
      [
        { transform: "translateY(0) scale(1)", offset: 0, easing: "ease-out" },
        {
          transform: "translateY(-0.5rem) scale(1.04)",
          offset: SWAP_AT,
          easing: "ease-in",
        },
        {
          transform: "translateY(0) scale(1.03, 0.96)",
          offset: 0.78,
          easing: "ease-out",
        },
        {
          transform: "translateY(-0.05rem) scale(1)",
          offset: 0.9,
          easing: "ease-in",
        },
        { transform: "translateY(0) scale(1)", offset: 1 },
      ],
      timing
    );

    // Tumble: one forward roll with a gentle sideways drift. It still ends on
    // multiples of 360°, so the front face is the front face again.
    const dir = wobbleDeg < 0 ? -1 : 1;
    const tumble: Keyframe[] = [
      {
        transform: cubeAt(0, 0, 0),
        offset: 0,
        easing: "cubic-bezier(0.4, 0, 0.8, 0.6)",
      },
      {
        transform: cubeAt(200, 14 * dir, wobbleDeg * 1.5),
        offset: SWAP_AT,
        easing: "cubic-bezier(0.2, 0.4, 0.4, 1)",
      },
      { transform: cubeAt(364, 0, 0), offset: 0.78 }, // tiny overshoot
      { transform: cubeAt(360, 0, 0), offset: 0.92 }, // settle
      { transform: cubeAt(360, 0, 0), offset: 1 },
    ];
    const fromRot = fromCube.current?.animate(tumble, timing);
    const toRot = toCube.current?.animate(tumble, timing);

    // Shadow: only a mild shrink while the die is up.
    const shadowAnim = shadow.current?.animate(
      [
        { opacity: 0.45, transform: "scale(1)", offset: 0 },
        { opacity: 0.3, transform: "scale(0.85)", offset: SWAP_AT },
        { opacity: 0.45, transform: "scale(1.02)", offset: 0.78 },
        { opacity: 0.45, transform: "scale(1)", offset: 0.92 },
        { opacity: 0, transform: "scale(1)", offset: 1 },
      ],
      timing
    );
    // The hard cut. Each cube holds its "after" state from the swap moment on.
    // Before that, the inline styles apply (old cube visible, new cube hidden).
    const swapMs = SWAP_AT * DIE_FLIP_MS;
    const afterSwap: KeyframeAnimationOptions = {
      duration: DIE_FLIP_MS - swapMs,
      delay: delayMs + swapMs,
      fill: "forwards",
    };
    const fromVis = fromCube.current?.animate(
      [{ visibility: "hidden" }, { visibility: "hidden" }],
      afterSwap
    );
    const toVis = toCube.current?.animate(
      [{ visibility: "visible" }, { visibility: "visible" }],
      afterSwap
    );
    // Motion blur: builds into the swap, peaks on it, clears as the die settles.
    const blurAnim = blur.current?.animate(
      [
        { filter: "blur(0px)", offset: 0 },
        { filter: "blur(1px)", offset: SWAP_AT * 0.6 },
        { filter: "blur(1.5px)", offset: SWAP_AT },
        { filter: "blur(1px)", offset: SWAP_AT + 0.12 },
        { filter: "blur(0px)", offset: SWAP_AT + 0.25 },
        { filter: "blur(0px)", offset: 1 },
      ],
      timing
    );

    return () => {
      [hopAnim, fromRot, toRot, fromVis, toVis, shadowAnim, blurAnim].forEach(
        (a) => a?.cancel()
      );
    };
  }, [delayMs, wobbleDeg]);

  return (
    <div className="relative h-10 w-10 shrink-0">
      <div
        ref={shadow}
        aria-hidden
        className="absolute inset-x-1 -bottom-1 h-2 rounded-full bg-black opacity-0 blur-[3px]"
      />
      <div ref={blur} className="h-10 w-10">
        <div
          ref={hop}
          className="relative h-10 w-10 origin-bottom"
          style={{ perspective: PERSPECTIVE }}
        >
          <Cube theme={from} faces={faces} innerRef={fromCube} />
          <Cube theme={to} faces={faces} innerRef={toCube} startHidden />
        </div>
      </div>
    </div>
  );
};

export default DieFlip;
