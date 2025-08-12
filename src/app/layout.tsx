import React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Genius Factor - HR Analytics Platform",
  description:
    "Advanced HR Analytics and Career Assessment Platform with AI-powered insights, retention risk analysis, and comprehensive employee management tools.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
