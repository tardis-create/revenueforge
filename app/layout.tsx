import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RevenueForge",
  description: "B2B industrial products marketplace with intelligent quotation engine",
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
      </head>
      <body className="font-satoshi antialiased bg-zinc-950 text-zinc-100">
        {children}
      </body>
    </html>
  );
}
