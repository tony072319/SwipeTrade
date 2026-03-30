import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import ClientProviders from "@/components/layout/ClientProviders";
import InstallPrompt from "@/components/layout/InstallPrompt";
import WhatsNew from "@/components/layout/WhatsNew";
import LandscapeWarning from "@/components/layout/LandscapeWarning";

export const metadata: Metadata = {
  title: {
    default: "SwipeTrade — Chart Prediction Game",
    template: "%s | SwipeTrade",
  },
  description:
    "Practice reading charts and making split-second Long/Short calls on real historical price data. Trade crypto and stocks risk-free!",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SwipeTrade",
  },
  openGraph: {
    title: "SwipeTrade — Chart Prediction Game",
    description: "Read the chart. Make the call. Swipe right for Long, left for Short. Trade with $10k — no risk!",
    siteName: "SwipeTrade",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SwipeTrade — Chart Prediction Game",
    description: "Read the chart. Make the call. Trade crypto & stocks risk-free!",
  },
  keywords: ["trading game", "chart prediction", "crypto", "stocks", "technical analysis", "paper trading", "swipe trade"],
  robots: "index, follow",
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
        <ClientProviders>
          {children}
          <BottomNav />
          <InstallPrompt />
          <WhatsNew />
          <LandscapeWarning />
        </ClientProviders>
      </body>
    </html>
  );
}
