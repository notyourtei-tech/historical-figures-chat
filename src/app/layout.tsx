import type { Metadata, Viewport } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/context/LanguageContext";
import { HtmlLangSync } from "@/components/HtmlLangSync";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PrivacyProvider } from "@/context/PrivacyContext";
import { PrivacyConsentBanner } from "@/components/PrivacyConsentBanner";

export const metadata: Metadata = {
  title: {
    default: "万古灵犀 · 与历史智者对话",
    template: "%s · 万古灵犀",
  },
  description: "跨越时空，与历史智者展开有深度、有温度的对话。",
  applicationName: "万古灵犀",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f4ee",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={cn("min-h-screen bg-ink-50 text-ink-500 font-serif antialiased")}>
        <a className="skip-link" href="#main-content">跳至主要内容</a>
        <div id="ink-bg" />
        <ErrorBoundary>
          <LanguageProvider>
            <PrivacyProvider>
              <ScrollToTop />
              <HtmlLangSync />
              {children}
              <PrivacyConsentBanner />
            </PrivacyProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
