import type { Metadata } from "next";
import "@fontsource-variable/archivo";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "SolanaLens — Event Intelligence for Solana",
  description:
    "A Solana market intelligence terminal powered by Panta prediction markets.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
