import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { TrpcProvider } from "@/providers/TrpcProvider";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";

const bodyFont = Manrope({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-geist-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TechQuiz | R\u00E9vision active pour entretiens dev fullstack",
  description: "MVP de quiz et r\u00E9vision pour pr\u00E9parer les entretiens techniques TypeScript et web moderne.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TechQuiz",
  },
};

export const viewport: Viewport = {
  themeColor: "#6d28d9",
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
    <html
      lang="fr"
      className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[color:var(--bg)] text-[color:var(--text-strong)]">
        <LanguageProvider>
          <TrpcProvider>
            {children}
            <PwaInstallPrompt />
            <ServiceWorkerRegistration />
          </TrpcProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
