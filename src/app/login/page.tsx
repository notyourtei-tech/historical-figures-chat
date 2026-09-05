"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { createLocalDemoSession, readLocalDemoSession } from "@/lib/local-demo-session";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const configured = Boolean(getSupabaseBrowserClient());
  const next = params.get("next")?.startsWith("/") ? params.get("next")! : "/";

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      void supabase.auth.getUser().then(({ data }) => { if (data.user) router.replace(next); });
      return;
    }
    if (readLocalDemoSession()) router.replace(next);
  }, [next, router]);

  const signInWithGoogle = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(true); setStatus("");
    trackEvent("auth_login_started", { method: "google" });
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` } });
    if (error) { setStatus("Google 登录暂时不可用，请检查 Supabase 的 Google Provider 配置。"); setBusy(false); }
  };

  const sendMagicLink = async (event: FormEvent) => {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !email.trim()) return;
    setBusy(true); setStatus("");
    trackEvent("auth_login_started", { method: "email_magic_link" });
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` } });
    setStatus(error ? "邮件未能发送，请检查邮箱服务与登录配置。" : "登录链接已经发送；请在邮箱中打开它完成登录。");
    setBusy(false);
  };

  const enterLocalExperience = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) return;
    // Password is intentionally used only for this browser-side form check.
    // It is not passed to the session helper, saved, logged, or transmitted.
    createLocalDemoSession(email);
    setPassword("");
    trackEvent("local_experience_started", { method: "local_email_password" });
    router.replace(next);
  };

  return (
    <main id="main-content" className="min-h-screen bg-ink-50 px-4 py-10 md:py-20">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-ink-300 hover:text-vermilion"><ArrowLeft className="h-3.5 w-3.5" />返回首页</Link>
        <div className="mt-6 text-center"><ShieldCheck className="mx-auto h-10 w-10 text-vermilion" /><h1 className="mt-3 text-2xl font-bold text-ink-500">开始你的对话</h1><p className="mt-2 text-sm leading-relaxed text-ink-400">默认是零外部费用的本机体验模式。它不创建云端账户，也不会保存或发送密码。</p></div>

        <form onSubmit={enterLocalExperience} className="mt-6 space-y-3 rounded-xl border border-vermilion/20 bg-vermilion/5 p-4">
          <div><p className="text-sm font-bold text-ink-500">本机体验登录</p><p className="mt-1 text-xs leading-relaxed text-ink-400">输入任意格式正确的邮箱和任意密码即可进入；密码只用于本次表单校验，绝不存储或上传。</p></div>
          <label className="sr-only" htmlFor="local-email">体验邮箱</label><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" /><input id="local-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="touch-target w-full rounded-xl border border-border bg-white py-3 pl-10 pr-3 text-sm text-ink-500 outline-none focus:border-vermilion/40" /></div>
          <label className="sr-only" htmlFor="local-password">体验密码</label><div className="relative"><KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" /><input id="local-password" type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="任意密码" className="touch-target w-full rounded-xl border border-border bg-white py-3 pl-10 pr-3 text-sm text-ink-500 outline-none focus:border-vermilion/40" /></div>
          <button className="touch-target w-full rounded-xl bg-vermilion px-4 py-3 text-sm font-bold text-white hover:bg-vermilion-hover">进入本机体验</button>
        </form>

        {configured && <><div className="my-5 flex items-center gap-3 text-xs text-ink-300 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">可选：云端账户</div>
          <button onClick={signInWithGoogle} disabled={busy} className="touch-target flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-bold text-ink-500 hover:bg-ink-50 disabled:opacity-50"><span className="text-base" aria-hidden="true">G</span>使用 Google 登录</button>
          <form onSubmit={sendMagicLink} className="mt-3 space-y-3"><label className="sr-only" htmlFor="cloud-email">云端邮箱</label><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" /><input id="cloud-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="touch-target w-full rounded-xl border border-border py-3 pl-10 pr-3 text-sm text-ink-500 outline-none focus:border-vermilion/40" /></div><button disabled={busy} className="touch-target w-full rounded-xl border border-border px-4 py-3 text-sm font-bold text-ink-500 hover:bg-ink-50 disabled:opacity-50">发送邮箱登录链接</button></form>
          <p className="mt-3 text-xs leading-relaxed text-ink-300">Google 和邮箱链接可用于跨设备云端同步；手机短信验证涉及运营商按条计费，未默认启用。</p>
        </>}
        {status && <p role="status" className="mt-4 rounded-lg bg-ink-50 p-3 text-xs leading-relaxed text-ink-400">{status}</p>}
        <p className="mt-5 text-center text-xs text-ink-300">登录即表示你已阅读 <Link href="/privacy" className="underline hover:text-vermilion">隐私说明</Link> 与 <Link href="/terms" className="underline hover:text-vermilion">使用规则</Link>。</p>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main id="main-content" className="min-h-screen bg-ink-50" />}>
      <LoginForm />
    </Suspense>
  );
}
