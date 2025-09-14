import React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { SocketProvider } from "@/context/SocketContext";

export const metadata: Metadata = {
  title: "GeniusFactor",
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
      <head>
        <link rel="icon" href="/logo.png" className="rounded-[1vw]" />
      </head>
      <body>
        <Providers>
          <SocketProvider>
            <Toaster />
            {children}
          </SocketProvider>
        </Providers>
      </body>
    </html>
  );
}
