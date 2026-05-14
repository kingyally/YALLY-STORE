import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "YALLY BET - Matikiti ya Ubashiri",
  description: "Pata matikiti bora ya ubashiri wa michezo - VIP Tickets, Fixed Games, na Correct Scores",
  keywords: ["betting tips", "VIP tickets", "fixed games", "correct scores", "Tanzania betting"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f0f0f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sw" className={inter.variable}>
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
