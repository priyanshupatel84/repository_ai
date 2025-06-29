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
  authors: [{ name: "Priyanshu Patel" }],
  creator: "Priyanshu patel",
  publisher: "vercel",
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
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Repository AI",
    title: "Repository AI - AI-powered repository analysis",
    description:
      "Analyze GitHub repositories with AI-powered insights, commit summaries, and intelligent Q&A",
    images: [
      {
        url: "/logo-image.svg",
        width: 1200,
        height: 630,
        alt: "Repository AI",
      },
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
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
        <link rel="icon" href="/logo-image.svg" sizes="any" />
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
