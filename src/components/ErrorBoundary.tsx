"use client";

import React from "react";
import { captureOperationalError } from "@/lib/observability";

const ERROR_TEXTS: Record<string, { title: string; desc: string; btn: string }> = {
  zh: { title: "出了点问题", desc: "发生了错误，请尝试刷新页面。", btn: "刷新页面" },
  en: { title: "Something went wrong", desc: "An error occurred. Please try refreshing the page.", btn: "Refresh Page" },
  ja: { title: "エラーが発生しました", desc: "ページをリロードしてください。", btn: "ページを更新" },
  vi: { title: "Đã xảy ra lỗi", desc: "Vui lòng tải lại trang.", btn: "Tải lại trang" },
  my: { title: "အမှားတစ်ခုဖြစ်ပေါ်ခဲ့သည်", desc: "စာမျက်နှာကို ပြန်ဖွင့်ကြည့်ပါ။", btn: "စာမျက်နှာ ပြန်ဖွင့်ရန်" },
};

function getLang(): string {
  try {
    const p = JSON.parse(localStorage.getItem("user_profile") || "{}");
    return p.language || "zh";
  } catch { return "zh"; }
}

function ErrorFallback({ error, reset }: { error?: Error; reset: () => void }) {
  const texts = ERROR_TEXTS[getLang()] || ERROR_TEXTS.en;
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-white">{texts.title}</h1>
        <p className="text-white/50 text-sm leading-relaxed">{texts.desc}</p>
        {process.env.NODE_ENV === "development" && (
          <pre className="text-left text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl p-4 overflow-auto max-h-40">
            {error?.message}
          </pre>
        )}
        <button
          onClick={reset}
          className="px-6 py-3 rounded-2xl bg-white/10 border border-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all"
        >
          {texts.btn}
        </button>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    captureOperationalError(error, { component: "ErrorBoundary", componentStack: errorInfo.componentStack?.slice(0, 500) });
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          reset={() => {
            this.setState({ error: null });
            window.location.reload();
          }}
        />
      );
    }
    return this.props.children;
  }
}
