import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/context/LanguageContext";
import { HtmlLangSync } from "@/components/HtmlLangSync";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Epochs of Wisdom - AI Dialogue with Historical Figures",
  description: "Break the chains of time and space. Dialogue with the greatest minds in history via deep AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={cn(inter.className, "min-h-screen bg-[#0A0A0A] text-white selection:bg-primary/30")}>
        <ErrorBoundary>
          <LanguageProvider>
            <HtmlLangSync />
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.05),transparent_50%)] pointer-events-none" />
            {children}
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
