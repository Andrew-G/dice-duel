"use client";

import type { ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
};

/** App-wide context providers go here. */
const Providers = ({ children }: ProvidersProps) => <>{children}</>;

export default Providers;
