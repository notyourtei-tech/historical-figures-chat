import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/context/LanguageContext";
import { HtmlLangSync } from "@/components/HtmlLangSync";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "Epochs of Wisdom / 万古灵犀",
  description: "Dialogue with Great Minds across time and space. Powered by deep AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link
          href="https://fonts.font.im/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn("min-h-screen bg-ink-50 text-ink-500 font-serif antialiased")}>
        <div id="ink-bg" />
        <ErrorBoundary>
          <LanguageProvider>
            <ScrollToTop />
            <HtmlLangSync />
            {children}
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
