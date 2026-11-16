import type { Metadata } from "next";
import type { ReactNode } from "react";
import Providers from "@/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dice Duel",
  description:
    "A five-dice scoring game. Play solo, race a recorded rival, or take on the robot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
