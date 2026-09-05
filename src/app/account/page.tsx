"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Download, Trash2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState("");
  const [deleteText, setDeleteText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { router.replace("/login"); return; }
    void supabase.auth.getUser().then(({ data }) => { if (data.user) setUser(data.user); else router.replace("/login"); });
  }, [router]);

  const exportData = async () => {
    setBusy(true); setStatus("");
    const response = await fetch("/api/account/export");
    if (!response.ok) { setStatus("导出失败，请重新登录后再试。"); setBusy(false); return; }
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a"); link.href = url; link.download = "wan-gu-ling-xi-export.json"; link.click(); URL.revokeObjectURL(url);
    setBusy(false); setStatus("导出已开始下载。");
  };

  const deleteAccount = async () => {
    if (deleteText !== "DELETE") return;
    setBusy(true); setStatus("");
    const response = await fetch("/api/account", { method: "DELETE" });
    if (!response.ok) { setStatus("删除暂未完成。请稍后重试，或联系支持。" ); setBusy(false); return; }
    const supabase = getSupabaseBrowserClient();
    await supabase?.auth.signOut();
    router.replace("/");
  };

  return (
    <main id="main-content" className="min-h-screen bg-ink-50 px-4 py-8 md:py-14"><section className="mx-auto max-w-2xl rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8"><Link href="/" className="inline-flex items-center gap-1 text-xs text-ink-300 hover:text-vermilion"><ArrowLeft className="h-3.5 w-3.5" />返回首页</Link><h1 className="mt-6 text-2xl font-bold text-ink-500">账户与数据</h1><p className="mt-2 text-sm text-ink-400">{user?.email || "正在读取账户…"}</p><section className="mt-8 rounded-xl border border-border p-5"><h2 className="font-bold text-ink-500">导出我的云端数据</h2><p className="mt-1 text-sm leading-relaxed text-ink-400">下载已保存的对话和隐私选择，不包含系统安全日志或匿名分析汇总。</p><button onClick={exportData} disabled={busy || !user} className="touch-target mt-4 inline-flex items-center gap-2 rounded-lg bg-ink-100 px-4 py-2.5 text-sm font-bold text-ink-500 hover:bg-ink-200 disabled:opacity-50"><Download className="h-4 w-4" />下载 JSON</button></section><section className="mt-5 rounded-xl border border-red-200 bg-red-50/40 p-5"><div className="flex gap-2"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" /><div><h2 className="font-bold text-red-800">永久删除账户</h2><p className="mt-1 text-sm leading-relaxed text-red-700">这会删除账号、云端对话和保存的隐私选择，无法撤销。匿名汇总事件不会再关联到此账户。</p></div></div><label className="mt-4 block text-sm text-red-800">输入 <code className="rounded bg-red-100 px-1">DELETE</code> 确认<input value={deleteText} onChange={(event) => setDeleteText(event.target.value)} className="mt-2 touch-target w-full rounded-lg border border-red-200 bg-white p-2.5 text-sm text-ink-500 outline-none focus:border-red-400" /></label><button onClick={deleteAccount} disabled={busy || deleteText !== "DELETE"} className="touch-target mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"><Trash2 className="h-4 w-4" />永久删除</button></section>{status && <p role="status" className="mt-4 text-sm text-ink-400">{status}</p>}<p className="mt-6 text-xs text-ink-300">更多说明请查看 <Link href="/privacy" className="underline">隐私说明</Link>。</p></section></main>
  );
}
