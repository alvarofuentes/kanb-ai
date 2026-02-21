import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kan-B AI - Voice-Powered Task Management",
  description: "Create tasks using voice commands with AI-powered transcription and smart task extraction. Manage your workflow with an intuitive Kanban board.",
  keywords: ["Task Management", "Voice AI", "Kanban", "Productivity", "Speech to Text", "AI", "Kan-B AI"],
  authors: [{ name: "Kan-B AI Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Kan-B AI",
    description: "Voice-powered task management with AI",
    url: "https://chat.z.ai",
    siteName: "Kan-B AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kan-B AI",
    description: "Voice-powered task management with AI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
