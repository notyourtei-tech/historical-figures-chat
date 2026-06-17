import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/context/LanguageContext";
import { HtmlLangSync } from "@/components/HtmlLangSync";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "万古灵犀 - 历史伟人 AI 对话平台",
  description: "与跨越时空的智慧对话，感受历史伟人的灵魂与思想。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={cn(inter.className, "min-h-screen bg-[#0A0A0A] text-white selection:bg-primary/30")}>
        <LanguageProvider>
          <HtmlLangSync />
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.05),transparent_50%)] pointer-events-none" />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
