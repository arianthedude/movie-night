import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { SessionProvider } from "@/components/SessionProvider";
import "./globals.css";


const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Movie Night",
  description: "Match movies with friends — swipe, like, watch together.",
  applicationName: "Movie Night",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Movie Night",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0e1a24",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${figtree.variable} ${fraunces.variable}`}>
      <body className="grain antialiased">
        <SessionProvider>
          <div className="relative z-10 min-h-dvh">{children}</div>
        </SessionProvider>
      </body>

    </html>
  );
}
