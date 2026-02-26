import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MobileNav } from "./components/MobileNav";
import { OfflineIndicator } from "./components/NetworkStatus";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "RevenueForge",
    template: "%s | RevenueForge"
  },
  description: "B2B industrial products marketplace with intelligent quotation engine",
  keywords: ["B2B", "industrial", "procurement", "marketplace", "quotation"],
  authors: [{ name: "RevenueForge" }],
  creator: "RevenueForge",
  metadataBase: new URL("https://revenueforge.pages.dev"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://revenueforge.pages.dev",
    siteName: "RevenueForge",
    title: "RevenueForge - B2B Industrial Marketplace",
    description: "B2B industrial products marketplace with intelligent quotation engine",
  },
  twitter: {
    card: "summary_large_image",
    title: "RevenueForge - B2B Industrial Marketplace",
    description: "B2B industrial products marketplace with intelligent quotation engine",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Satoshi:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        {/* DNS prefetch for API */}
        <link rel="dns-prefetch" href="https://revenueforge-api.pronitopenclaw.workers.dev" />
      </head>
      <body className="font-satoshi antialiased bg-zinc-950 text-zinc-100">
        <Providers>
          {/* Skip to main content link for accessibility */}
          <a href="#main-content" className="skip-to-main">
            Skip to main content
          </a>
          <OfflineIndicator />
          {children}
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
