import type { Die } from "@/types/Dice";
import type { DiceTheme } from "@/types/DiceTheme";
import clsx from "clsx";
import type { CSSProperties } from "react";
import DicePips from "./DicePips";

/** Blend used for `faceTexture` when the theme doesn't pick one. */
const DEFAULT_TEXTURE_BLEND = "overlay";

/**
 * Colour the gradient and texture are flattened onto.
 *
 * Most gradients are translucent. A blend mode only mixes a layer with what's
 * *beneath* it, weighted by that backdrop's opacity, so over a see-through
 * gradient the texture would just show as itself. An opaque base underneath
 * gives the blend something solid to work with, whatever sits behind the die.
 */
const TEXTURE_BASE_COLOR = "#111827";

/** Expose theme values as CSS variables, for the classes below and any die animation. */
const dieVars = (theme: DiceTheme) =>
  ({
    "--die-bg-from": theme.bgFrom,
    "--die-bg-to": theme.bgTo,
    "--die-border-light": theme.borderLight,
    "--die-border-dark": theme.borderDark,
    "--die-highlight-primary": theme.highlightPrimary,
    "--die-highlight-secondary": theme.highlightSecondary,
    "--die-shadow": theme.shadowColor,
  } as CSSProperties);

/**
 * The die's background: the theme gradient and, if it has one, its texture
 * blended on top.
 */
const dieBackground = (theme: DiceTheme): CSSProperties => {
  const gradient = `linear-gradient(to bottom right, ${theme.bgFrom}, ${theme.bgTo})`;

  if (!theme.faceTexture) return { backgroundImage: gradient };

  return {
    backgroundColor: TEXTURE_BASE_COLOR,

    // Layers are listed top to bottom: the texture, then the gradient.
    // `backgroundBlendMode` takes one entry per layer, in the same order.
    backgroundImage: `url("${theme.faceTexture}"), ${gradient}`,
    backgroundBlendMode: `${
      theme.faceTextureBlend ?? DEFAULT_TEXTURE_BLEND
    }, normal`,

    backgroundSize: "cover, 100% 100%",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",

    // Run the layers under the border too, so the translucent bevel colours
    // sit over the die rather than over the bare base colour.
    backgroundOrigin: "border-box",
  };
};

type DieFaceProps = {
  theme: DiceTheme;
  value: Die;
  /** Kept dice get the theme's highlight border (and its throb animation). */
  isKept?: boolean;
  className?: string;
};

/**
 * How a die looks: gradient, texture, themed border, shadow and pips.
 *
 * Purely visual, with no size, position or interactivity of its own. It
 * fills its parent, so the caller decides how big it is and whether it's a
 * button. It defines its own theme CSS variables, so it renders correctly
 * wherever it's placed.
 *
 * Inside a `group` ancestor, the shadow deepens when the group is hovered.
 */
const DieFace = ({ theme, value, isKept, className }: DieFaceProps) => (
  <span
    className={clsx(
      "flex h-full w-full items-center justify-center rounded p-1.5 font-bold text-white",
      "transition-shadow duration-150",

      "[box-shadow:2px_2px_6px_var(--die-shadow)]",
      "group-hover:[box-shadow:4px_6px_12px_var(--die-shadow)]",

      isKept
        ? "border-2 border-[color:var(--die-highlight-primary)] motion-safe:animate-die-throb"
        : "border-l border-t border-b-2 border-r-2 " +
            "border-l-[color:var(--die-border-light)] border-t-[color:var(--die-border-light)] " +
            "border-b-[color:var(--die-border-dark)] border-r-[color:var(--die-border-dark)]",

      className
    )}
    // Border colours deliberately aren't set here: inline styles would
    // override the kept highlight above.
    style={{ ...dieVars(theme), ...dieBackground(theme) }}
  >
    <DicePips theme={theme} value={value} />
  </span>
);

export default DieFace;
