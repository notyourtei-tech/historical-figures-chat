"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { celebrities } from "@/data/celebrities";
import { useLanguage } from "@/context/LanguageContext";

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

export default function ChatHistorySidebar({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (celebrityId: string) => void;
}) {
  const { language, t } = useLanguage();
  const [conversations, setConversations] = useState<ConversationMeta[]>([]);

  useEffect(() => {
    if (open) {
      setConversations(loadConversations());
    }
  }, [open]);

  const handleDelete = useCallback((id: string) => {
    const celeb = celebrities.find((c) => c.id === id);
    if (celeb) {
      localStorage.removeItem(`chat_history_${id}`);
      localStorage.removeItem(`chat_lang_${id}`);
    }
    const updated = conversations.filter((c) => c.celebrityId !== id);
    saveConversations(updated);
    setConversations(updated);
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
          />
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-[160] w-72 bg-white border-r border-border shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-sm font-bold text-ink-500">{t("chat_history") || "对话历史"}</h2>
              <button
                onClick={onClose}
                className="touch-target w-8 h-8 rounded-lg flex items-center justify-center hover:bg-ink-100 transition-colors"
              >
                <X className="w-4 h-4 text-ink-400" />
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
                        className={cn(
                          "group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors hover:bg-ink-50"
                        )}
                        onClick={() => {
                          onSelect(conv.celebrityId);
                          onClose();
                        }}
                      >
                        <img
                          src={celeb?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.celebrityName)}&background=c0392b&color=fff&size=64`}
                          alt=""
                          className="w-9 h-9 rounded-full border border-border object-cover flex-shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.celebrityName)}&background=c0392b&color=fff&size=72`; }}
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs font-bold text-ink-500 truncate">{conv.celebrityName}</h3>
                          <p className="text-[10px] text-ink-300 truncate mt-0.5">{conv.lastMessage}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-[9px] text-ink-300">{formatTime(conv.lastTimestamp)}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(conv.celebrityId);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-ink-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3 text-ink-300" />
                          </button>
                        </div>
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
