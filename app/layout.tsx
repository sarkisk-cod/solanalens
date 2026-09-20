import type { Metadata } from "next";
import "@fontsource-variable/archivo";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { SolanaProviders } from "@/components/SolanaProviders";

export const metadata: Metadata = {
  title: "SolanaLens — Event Intelligence for Solana",
  description:
    "A Solana market intelligence terminal powered by Panta prediction markets.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><SolanaProviders>{children}</SolanaProviders></body>
    </html>
  );
}
