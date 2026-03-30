import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "SwipeTrade — Chart Prediction Game",
  description:
    "Practice reading charts and making split-second Long/Short calls on real historical price data.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SwipeTrade",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-surface text-text-primary antialiased">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
