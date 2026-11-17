"use client";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import type { ReactNode } from "react";

// Font Awesome's stylesheet is imported above, so stop it injecting its own at
// runtime (which makes icons flash at full size on first paint).
config.autoAddCss = false;

type ProvidersProps = {
  children: ReactNode;
};

/** App-wide context providers go here. */
const Providers = ({ children }: ProvidersProps) => <>{children}</>;

export default Providers;
