"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Trash2 } from "lucide-react";
import { celebrities } from "@/data/celebrities";
import { useLanguage } from "@/context/LanguageContext";
import { Language } from "@/types";

interface ConversationMeta {
  id: string;
  celebrityId: string;
  celebrityName: string;
  lastMessage: string;
  messageCount: number;
  lastTimestamp: number;
  lang: string;
}

function loadConversations(): ConversationMeta[] {
  try {
    const raw = localStorage.getItem("chat_conversations");
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveConversations(convos: ConversationMeta[]) {
  try {
    localStorage.setItem("chat_conversations", JSON.stringify(convos));
  } catch {
    // ignore
  }
}

function ConversationAvatar({ avatar, name }: { avatar?: string; name: string }) {
  const [fallback, setFallback] = useState(false);
  const src = fallback || !avatar
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=c0392b&color=fff&size=72`
    : avatar;

  return (
    <Image
      src={src}
      width={36}
      height={36}
      sizes="36px"
      loading="lazy"
      unoptimized
      alt={name}
      className="w-9 h-9 rounded-full border border-border object-cover flex-shrink-0"
      onError={() => setFallback(true)}
    />
  );
}

export default function ChatHistorySidebar({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (celebrityId: string) => void;
}) {
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<ConversationMeta[]>([]);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const local = loadConversations();
      setConversations(local);
      let active = true;
      void fetch("/api/conversations", { cache: "no-store" })
        .then(async (response) => {
          if (!response.ok || !active) return;
          const data = await response.json() as { success?: boolean; conversations?: Array<{ celebrity_id: string; language: string; last_message: string; updated_at: string }> };
          if (!data.success || !Array.isArray(data.conversations)) return;
          const cloud = data.conversations.map((conversation) => {
            const celeb = celebrities.find((item) => item.id === conversation.celebrity_id);
            const lang = conversation.language as Language;
            return {
              id: conversation.celebrity_id,
              celebrityId: conversation.celebrity_id,
              celebrityName: celeb?.name[lang] || celeb?.name.zh || conversation.celebrity_id,
              lastMessage: conversation.last_message,
              messageCount: 0,
              lastTimestamp: new Date(conversation.updated_at).getTime(),
              lang: conversation.language,
            } satisfies ConversationMeta;
          });
          const combined = new Map<string, ConversationMeta>();
          [...local, ...cloud].forEach((conversation) => {
            const existing = combined.get(conversation.celebrityId);
            if (!existing || existing.lastTimestamp < conversation.lastTimestamp) combined.set(conversation.celebrityId, conversation);
          });
          setConversations([...combined.values()].sort((a, b) => b.lastTimestamp - a.lastTimestamp));
        })
        .catch(() => undefined);
      return () => { active = false; };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const pageLayers = Array.from(document.querySelectorAll<HTMLElement>("[data-chat-page-layer]"));
    const previouslyInert = pageLayers.map((element) => element.hasAttribute("inert"));
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) || []).filter((element) => !element.hidden);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    pageLayers.forEach((element) => element.setAttribute("inert", ""));
    document.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      pageLayers.forEach((element, index) => {
        if (!previouslyInert[index]) element.removeAttribute("inert");
      });
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [open, onClose]);

  const handleDelete = useCallback((id: string) => {
    const celeb = celebrities.find((c) => c.id === id);
    const name = celeb?.name.zh || conversations.find((conversation) => conversation.celebrityId === id)?.celebrityName || "这位人物";
    if (!window.confirm(`确定删除与${name}的聊天记录吗？此操作无法撤销。`)) return;
    if (celeb) {
      localStorage.removeItem(`chat_history_${id}`);
      localStorage.removeItem(`chat_lang_${id}`);
    }
    const updated = conversations.filter((c) => c.celebrityId !== id);
    saveConversations(updated);
    setConversations(updated);
    void fetch(`/api/conversations/${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => undefined);
  }, [conversations]);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return t("just_now") || "刚刚";
    if (diffMin < 60) return `${diffMin}${t("minutes_ago") || "分钟前"}`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}${t("hours_ago") || "小时前"}`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}${t("days_ago") || "天前"}`;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-ink-500/30 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-[160] w-72 bg-white border-r border-border shadow-xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="聊天记录"
            ref={dialogRef}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-sm font-bold text-ink-500">{t("chat_history") || "对话历史"}</h2>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="touch-target w-8 h-8 rounded-lg flex items-center justify-center hover:bg-ink-100 transition-colors"
                aria-label="关闭聊天记录"
              >
                <X className="w-4 h-4 text-ink-400" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-ink-300">
                  <MessageCircle className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-xs">{t("no_conversations") || "暂无对话"}</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {conversations.map((conv) => {
                    const celeb = celebrities.find((c) => c.id === conv.celebrityId);
                    return (
                      <div
                        key={conv.celebrityId}
                        className="group flex items-center gap-1 rounded-xl transition-colors hover:bg-ink-50"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onSelect(conv.celebrityId);
                            onClose();
                          }}
                          className="touch-target flex min-w-0 flex-1 items-center gap-3 rounded-xl p-3 text-left hover:bg-ink-50"
                          aria-label={`打开与 ${conv.celebrityName} 的聊天记录`}
                        >
                          <ConversationAvatar avatar={celeb?.avatar} name={conv.celebrityName} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-bold text-ink-500">{conv.celebrityName}</span>
                            <span className="mt-0.5 block truncate text-[10px] text-ink-300">{conv.lastMessage}</span>
                          </span>
                          <span className="shrink-0 text-[9px] text-ink-300">{formatTime(conv.lastTimestamp)}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(conv.celebrityId)}
                          className="conversation-delete touch-target mr-1 flex h-10 w-10 items-center justify-center rounded-lg opacity-0 transition-opacity hover:bg-ink-100 group-hover:opacity-100 focus-visible:opacity-100"
                          aria-label={`删除与 ${conv.celebrityName} 的聊天记录`}
                          title="删除聊天记录"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-ink-300" aria-hidden="true" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function updateConversationMeta(celebrityId: string, messages: { role: string; content: string }[]) {
  const celeb = celebrities.find((c) => c.id === celebrityId);
  if (!celeb || messages.length === 0) return;

  let currentLang: string = "zh";
  try {
    const profile = JSON.parse(localStorage.getItem("user_profile") || "{}");
    if (profile.language) currentLang = profile.language;
  } catch { /* ignore */ }

  const lastMsg = messages[messages.length - 1];
  const meta: ConversationMeta = {
    id: celebrityId,
    celebrityId,
    celebrityName: celeb.name[currentLang as keyof typeof celeb.name] || celeb.name.zh,
    lastMessage: lastMsg.content.slice(0, 60),
    messageCount: messages.length,
    lastTimestamp: Date.now(),
    lang: currentLang,
  };

  const convos = loadConversations();
  const idx = convos.findIndex((c) => c.celebrityId === celebrityId);
  if (idx >= 0) {
    convos[idx] = meta;
  } else {
    convos.unshift(meta);
  }
  convos.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
  saveConversations(convos);
}
