"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { clearLocalDemoSession, readLocalDemoSession, type LocalDemoSession } from "@/lib/local-demo-session";

export function AuthMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [localSession, setLocalSession] = useState<LocalDemoSession | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    setLocalSession(readLocalDemoSession());
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN" && session?.user) {
        trackEvent("auth_login_completed", { provider: String(session.user.app_metadata.provider || "unknown") });
      }
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    if (user && supabase) await supabase.auth.signOut();
    setUser(null);
    clearLocalDemoSession();
    setLocalSession(null);
  };

  if (!user && !localSession) {
    return <Link href="/login" className="touch-target inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold text-ink-400 hover:border-vermilion/30 hover:text-vermilion"><UserRound className="h-3.5 w-3.5" aria-hidden="true" />登录</Link>;
  }

  if (!user && localSession) {
    return (
      <div className="flex items-center gap-1">
        <span className="inline-flex max-w-36 items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800" title="本机体验模式：不会云端保存对话"><UserRound className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="truncate">本机体验</span></span>
        <button onClick={signOut} className="touch-target inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-300 hover:bg-ink-100 hover:text-ink-500" title="退出本机体验" aria-label="退出本机体验"><LogOut className="h-3.5 w-3.5" aria-hidden="true" /></button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Link href="/account" className="touch-target inline-flex max-w-28 items-center gap-1.5 rounded-lg bg-ink-100 px-2.5 py-1.5 text-xs font-medium text-ink-400 hover:bg-ink-200" title="账户与数据"><UserRound className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{user?.email?.split("@")[0] || "账户"}</span></Link>
      <button onClick={signOut} className="touch-target inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-300 hover:bg-ink-100 hover:text-ink-500" title="退出登录" aria-label="退出登录"><LogOut className="h-3.5 w-3.5" aria-hidden="true" /></button>
    </div>
  );
}
