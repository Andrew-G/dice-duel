import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

const VARIANT_CLASSES = {
  /** The main action on a screen, e.g. "Roll dice". */
  primary:
    "rounded-md bg-gray-100 px-6 py-2 text-black shadow-sm hover:bg-white disabled:opacity-40 disabled:hover:bg-gray-100",
  /** Secondary actions, e.g. "Back" or "Restart". */
  small:
    "rounded-md bg-gray-100 px-3 py-1 text-sm text-black shadow-sm hover:bg-white",
  /** A big, card-like option in a list of choices. */
  choice:
    "w-full rounded-lg border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-indigo-300 disabled:opacity-40 disabled:hover:bg-white/5",
  /** A round, icon-only button. Give it an `aria-label`. */
  icon: "flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white hover:bg-white/20 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-indigo-300",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANT_CLASSES;
};

const Button = ({
  variant = "primary",
  type = "button",
  className,
  ...rest
}: ButtonProps) => (
  <button
    type={type}
    className={clsx(VARIANT_CLASSES[variant], className)}
    {...rest}
  />
);

export default Button;
