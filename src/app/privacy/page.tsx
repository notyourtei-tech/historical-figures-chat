"use client";

import Link from "next/link";
import { ArrowLeft, Download, ShieldCheck } from "lucide-react";
import { usePrivacy } from "@/context/PrivacyContext";

export default function PrivacyPage() {
  const { consent, ready, updateConsent } = usePrivacy();
  return (
    <main id="main-content" className="min-h-screen bg-ink-50 px-4 py-8 md:py-14">
      <article className="mx-auto max-w-3xl rounded-2xl border border-border bg-white p-6 shadow-sm md:p-10">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-ink-300 hover:text-vermilion"><ArrowLeft className="h-3.5 w-3.5" />返回首页</Link>
        <div className="mt-6 flex gap-3"><ShieldCheck className="h-8 w-8 shrink-0 text-vermilion" /><div><h1 className="text-2xl font-bold text-ink-500">隐私说明与控制</h1><p className="mt-1 text-sm text-ink-400">版本 2026-09-05 · 生效日期 2026-09-05</p></div></div>
        <section className="mt-8 space-y-5 text-sm leading-7 text-ink-400">
          <div><h2 className="font-bold text-ink-500">我们处理什么</h2><p>未登录时，聊天记录仅保留在当前浏览器。登录并启用云端同步后，账户 ID、人物 ID、语言、以及对话内容会保存在 Supabase，以便你跨设备恢复对话。我们不把聊天正文用于产品分析。</p></div>
          <div><h2 className="font-bold text-ink-500">AI 处理</h2><p>只有你选择“同意并开始对话”后，消息才会发送给本项目配置的 AI 服务以生成回答。历史人物回复属于角色扮演和学习体验，不构成医疗、法律、心理或投资建议。请不要发送密码、身份证件、银行卡号、精确住址或他人的私密信息。</p></div>
          <div><h2 className="font-bold text-ink-500">分析与监控</h2><p>产品分析默认关闭。若你主动启用，只记录事件名称和有限的产品属性（例如登录方式、消息长度区间），不记录聊天内容、邮箱、手机号或 IP。错误监控会过滤常见个人信息字段。</p></div>
          <div><h2 className="font-bold text-ink-500">保存与删除</h2><p>你可以在账户页导出自己的云端数据，或永久删除账户与级联的云端会话。删除后分析记录仅保留无法指向账户的汇总事件。未登录本地记录可通过浏览器清除站点数据移除。</p></div>
        </section>
        <section className="mt-8 rounded-2xl border border-border bg-ink-50 p-4 md:p-5"><h2 className="font-bold text-ink-500">你的当前选择</h2>{!ready ? <p className="mt-2 text-sm text-ink-300">正在读取设置…</p> : <div className="mt-3 space-y-4"><label className="flex cursor-pointer items-start gap-3"><input type="checkbox" className="mt-1 accent-[#c0392b]" checked={consent.aiProcessing} onChange={(event) => updateConsent({ aiProcessing: event.target.checked, analytics: consent.analytics })} /><span className="text-sm text-ink-400"><b className="text-ink-500">允许 AI 处理消息</b><br />关闭后可浏览，但不会请求 AI 回复。</span></label><label className="flex cursor-pointer items-start gap-3"><input type="checkbox" className="mt-1 accent-[#c0392b]" checked={consent.analytics} onChange={(event) => updateConsent({ aiProcessing: consent.aiProcessing, analytics: event.target.checked })} /><span className="text-sm text-ink-400"><b className="text-ink-500">允许匿名产品分析</b><br />关闭不会影响核心对话功能。</span></label></div>}</section>
        <div className="mt-7 flex flex-wrap gap-4 text-sm"><Link href="/account" className="inline-flex items-center gap-1.5 font-medium text-vermilion hover:underline"><Download className="h-4 w-4" />导出或删除云端数据</Link><Link href="/terms" className="font-medium text-vermilion hover:underline">查看使用规则</Link></div>
      </article>
    </main>
  );
}
