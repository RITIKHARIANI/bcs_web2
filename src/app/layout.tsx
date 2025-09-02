import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NeuroLearn - Brain & Cognitive Sciences E-Textbook Platform",
  description: "Interactive e-textbook platform for Brain and Cognitive Sciences. Explore neural networks, cognitive pathways, and neuroscience through immersive learning experiences.",
  keywords: ["neuroscience", "cognitive science", "brain", "e-textbook", "interactive learning", "neural networks"],
  authors: [{ name: "NeuroLearn Team" }],
  openGraph: {
    title: "NeuroLearn - Interactive Neuroscience Learning",
    description: "Explore Brain and Cognitive Sciences through interactive modules and neural network visualizations.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuroLearn - Interactive Neuroscience Learning",
    description: "Explore Brain and Cognitive Sciences through interactive modules and neural network visualizations.",
  },
  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NeuroLearn" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <div id="skip-to-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-neural-primary text-white px-4 py-2 rounded-md z-50">
            <a href="#main-content">Skip to main content</a>
          </div>
          {children}
        </Providers>
      </body>
    </html>
  );
}
