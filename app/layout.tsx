import type { Metadata, Viewport } from "next";

import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Claude Expert",
  description:
    "A chat-based expert on Claude, the Anthropic API, and Anthropic's research and products.",
  manifest: "/manifest.json",
  applicationName: "Claude Expert",
  appleWebApp: {
    capable: true,
    title: "Claude Expert",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    title: "Claude Expert",
    description:
      "A chat-based expert on Claude, the Anthropic API, and Anthropic's research and products.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#C96442",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
