"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { usePrivacy } from "@/context/PrivacyContext";

export function PrivacyConsentBanner() {
  const { consent, ready, updateConsent } = usePrivacy();
  if (!ready || consent.completed) return null;

  return (
    <aside className="fixed bottom-3 inset-x-3 md:bottom-5 md:left-1/2 md:right-auto md:-translate-x-1/2 z-[300] w-auto md:w-[min(640px,calc(100vw-2rem))] rounded-2xl border border-border bg-white/95 p-4 shadow-2xl backdrop-blur" aria-label="隐私选择">
      <div className="flex gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-vermilion" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink-500">你的对话，由你决定</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-400">启用 AI 后，你的消息会发送给配置的 AI 服务生成回复；分析功能默认关闭，且从不收集聊天正文。请避免发送密码、证件号或银行卡信息。</p>
          <p className="mt-1 text-xs text-ink-300"><Link className="underline underline-offset-2 hover:text-vermilion" href="/privacy">查看隐私说明与设置</Link></p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => updateConsent({ aiProcessing: false, analytics: false })} className="touch-target rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink-400 hover:bg-ink-50">只浏览</button>
            <button onClick={() => updateConsent({ aiProcessing: true, analytics: false })} className="touch-target rounded-lg bg-vermilion px-3 py-2 text-xs font-bold text-white hover:bg-vermilion-hover">同意并开始对话</button>
          </div>
        </div>
      </div>
    </aside>
  );
}
