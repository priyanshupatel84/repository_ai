import type React from "react";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "@/components/authProvider";
import { ErrorBoundary } from "@/components/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";

import "@/app/globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "Repository AI - AI-powered repository analysis",
    template: "%s | Repository AI",
  },
  description:
    "Analyze GitHub repositories with AI-powered insights, commit summaries, and intelligent Q&A",
  keywords: [
    "GitHub",
    "AI",
    "repository analysis",
    "code analysis",
    "developer tools",
  ],
  authors: [{ name: "Repository AI Team" }],
  creator: "Repository AI",
  publisher: "Repository AI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://repoai.dev",
    siteName: "Repository AI",
    title: "Repository AI - AI-powered repository analysis",
    description:
      "Analyze GitHub repositories with AI-powered insights, commit summaries, and intelligent Q&A",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Repository AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Repository AI - AI-powered repository analysis",
    description:
      "Analyze GitHub repositories with AI-powered insights, commit summaries, and intelligent Q&A",
    images: ["/og-image.png"],
    creator: "@repoai",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#35374b" />
      </head>
      <AuthProvider>
        <body
          className={`${jetbrainsMono.variable} font-mono antialiased`}
          suppressHydrationWarning
        >
          <ErrorBoundary>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange={false}
              storageKey="repoai-theme"
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </ErrorBoundary>
        </body>
      </AuthProvider>
    </html>
  );
}
