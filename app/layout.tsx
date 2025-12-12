import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { GlobalBackground } from "@/components/backgrounds/GlobalBackground";
import { ThemeModeProvider } from "@/components/theme/ThemeModeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LexiQ™",
  description: "LexiQ™ AI xLQA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeModeProvider>
          <GlobalBackground />
          <div className="relative z-10 min-h-screen">{children}</div>
        </ThemeModeProvider>
      </body>
    </html>
  );
}
