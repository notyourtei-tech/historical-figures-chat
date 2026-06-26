"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { celebrities } from "@/data/celebrities";
import { Message, Celebrity, Language } from "@/types";
import {
  Send,
  ArrowLeft,
  MoreHorizontal,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Download,
  Trash2,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { chatWithCelebrity, getInitialGreeting } from "@/services/ai";
import { translateCategory, translateEra } from "@/lib/i18n";
import { ErrorCode } from "@/lib/errors";
import ChatHistorySidebar, { updateConversationMeta } from "@/components/ChatHistorySidebar";

const MAX_CHAT_HISTORY_BYTES = 500_000;

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function saveChatHistory(key: string, messages: Message[]): boolean {
  try {
    const json = JSON.stringify(messages);
    if (new TextEncoder().encode(json).length > MAX_CHAT_HISTORY_BYTES) {
      const trimmed = messages.slice(Math.floor(messages.length / 2));
      localStorage.setItem(key, JSON.stringify(trimmed));
    } else {
      localStorage.setItem(key, json);
    }
    return true;
  } catch {
    return false;
  }
}

function typewriterEffect(el: HTMLElement, text: string, speed: number = 28) {
  // Cancel any existing typewriter on this element
  const elWithCleanup = el as unknown as { _typewriterCleanup?: () => void };
  if (typeof elWithCleanup._typewriterCleanup === "function") {
    elWithCleanup._typewriterCleanup();
  }

  let i = 0;
  let cancelled = false;
  el.textContent = "";
  const cursor = document.createElement("span");
  cursor.className = "typewriter-cursor";
  el.appendChild(cursor);

  const timer = setInterval(() => {
    if (cancelled) return;
    if (i < text.length) {
      cursor.before(text[i]);
      i++;
    } else {
      clearInterval(timer);
      setTimeout(() => { if (!cancelled) cursor.remove(); }, 500);
    }
  }, speed);

  const cleanup = () => {
    cancelled = true;
    clearInterval(timer);
    cursor.remove();
    el.textContent = text;
  };

  elWithCleanup._typewriterCleanup = cleanup;
  return cleanup;
}

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const { language, t } = useLanguage();
  const [celebrity, setCelebrity] = useState<Celebrity | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, "like" | "dislike">>({});
  const [longWait, setLongWait] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const greetingFetchId = useRef(0);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const renderedMessages = useRef<Set<string>>(new Set());
  const typewritingMessages = useRef<Set<string>>(new Set());

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const found = celebrities.find((c) => c.id === id);
    if (!found) {
      router.push("/");
      return;
    }

    setCelebrity(found);

    const savedLang = localStorage.getItem(`chat_lang_${id}`);
    if (savedLang && savedLang !== language) {
      localStorage.setItem(`chat_lang_${id}`, language);
    }

    const savedMessages = localStorage.getItem(`chat_history_${id}`);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
          return;
        }
      } catch {
        // fall through
      }
    }

    const fetchId = ++greetingFetchId.current;
    setIsLoading(true);
    getInitialGreeting(found, language)
      .then((greetingText) => {
        if (fetchId !== greetingFetchId.current) return;
        if (greetingText) {
          setMessages([
            {
              id: generateId(),
              role: "assistant",
              content: greetingText,
              timestamp: Date.now(),
            },
          ]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (fetchId === greetingFetchId.current) setIsLoading(false);
      });
  }, [id, router, isClient, language]);

  useEffect(() => {
    if (!isClient || !celebrity || messages.length === 0) return;
    saveChatHistory(`chat_history_${celebrity.id}`, messages);
    localStorage.setItem(`chat_lang_${celebrity.id}`, language);
    updateConversationMeta(celebrity.id, messages);
  }, [messages, celebrity, isClient, language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [input]);

  useEffect(() => {
    const updateViewportHeight = () => {
      const vh = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
      const chatBox = chatAreaRef.current;
      if (chatBox) {
        const topBar = 64;
        const inputBar = 80;
        chatBox.style.height = `${vh - topBar - inputBar}px`;
      }
    };
    window.visualViewport?.addEventListener("resize", updateViewportHeight);
    updateViewportHeight();
    return () => window.visualViewport?.removeEventListener("resize", updateViewportHeight);
  }, []);

  // Show long-wait warning after 15 seconds of loading
  useEffect(() => {
    if (!isLoading) {
      setLongWait(false);
      return;
    }
    const timer = setTimeout(() => setLongWait(true), 15000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Typewriter for new AI messages
  const cleanupTypewriterRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant" || renderedMessages.current.has(lastMsg.id)) return;
    renderedMessages.current.add(lastMsg.id);
    typewritingMessages.current.add(lastMsg.id);

    let attempts = 0;
    const maxAttempts = 5;
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout>;

    const tryTypewrite = () => {
      if (cancelled) return;
      const msgEls = document.querySelectorAll("[data-msg-id]");
      const lastEl = msgEls[msgEls.length - 1];
      if (!lastEl || lastEl.getAttribute("data-msg-id") !== lastMsg.id) {
        if (attempts < maxAttempts) {
          attempts++;
          retryTimer = setTimeout(tryTypewrite, 30 * attempts);
          return;
        }
        typewritingMessages.current.delete(lastMsg.id);
        return;
      }
      const contentEl = lastEl.querySelector(".msg-content") as HTMLElement;
      if (!contentEl) {
        if (attempts < maxAttempts) {
          attempts++;
          retryTimer = setTimeout(tryTypewrite, 30 * attempts);
          return;
        }
        typewritingMessages.current.delete(lastMsg.id);
        return;
      }
      const speed = window.innerWidth <= 768 ? 18 : 28;
      cleanupTypewriterRef.current = typewriterEffect(contentEl, lastMsg.content, speed);
    };

    requestAnimationFrame(() => { retryTimer = setTimeout(tryTypewrite, 50); });

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      typewritingMessages.current.delete(lastMsg.id);
      if (cleanupTypewriterRef.current) {
        cleanupTypewriterRef.current();
        cleanupTypewriterRef.current = null;
      }
    };
  }, [messages]);

  // Cleanup typewriter on unmount
  useEffect(() => {
    return () => {
      if (cleanupTypewriterRef.current) {
        cleanupTypewriterRef.current();
      }
    };
  }, []);

  const handleClearChat = useCallback(() => {
    if (!celebrity) return;
    if (!window.confirm(t("confirm_clear"))) return;
    localStorage.removeItem(`chat_history_${celebrity.id}`);
    localStorage.removeItem(`chat_lang_${celebrity.id}`);
    renderedMessages.current.clear();
    typewritingMessages.current.clear();
    setMessages([]);
    setInput("");

    const fetchId = ++greetingFetchId.current;
    setIsLoading(true);
    getInitialGreeting(celebrity, language)
      .then((greetingText) => {
        if (fetchId !== greetingFetchId.current) return;
        if (greetingText) {
          setMessages([{
            id: generateId(),
            role: "assistant",
            content: greetingText,
            timestamp: Date.now(),
          }]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (fetchId === greetingFetchId.current) setIsLoading(false);
      });
  }, [celebrity, t, language]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !celebrity || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatWithCelebrity(celebrity, [...messages, userMessage], language);
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: response || "",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      let userFriendlyMessage = t("error_ai_failed");
      if (errorMessage.includes(ErrorCode.RATE_LIMIT) || errorMessage.includes("rate limit")) {
        userFriendlyMessage = t("error_rate_limit");
      }
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: "assistant", content: userFriendlyMessage, timestamp: Date.now(), isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, celebrity, isLoading, messages, language, t]);

  const handleRetry = useCallback(async (errorMessageId: string) => {
    if (!celebrity || isLoading) return;

    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;

    setMessages((prev) => prev.filter((m) => m.id !== errorMessageId));
    setIsLoading(true);

    try {
      const conversationWithoutError = messages.filter((m) => m.id !== errorMessageId);
      const response = await chatWithCelebrity(celebrity, [...conversationWithoutError, lastUserMsg], language);
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: response || "",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errMsg = error instanceof Error ? error.message : String(error);
      let userFriendlyMessage = t("error_ai_failed");
      if (errMsg.includes(ErrorCode.RATE_LIMIT) || errMsg.includes("rate limit")) {
        userFriendlyMessage = t("error_rate_limit");
      }
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: "assistant", content: userFriendlyMessage, timestamp: Date.now(), isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [celebrity, isLoading, messages, language, t]);

  const handleFeedback = useCallback((msgId: string, type: "like" | "dislike") => {
    setFeedbackMap((prev) => {
      const next = { ...prev };
      if (next[msgId] === type) {
        delete next[msgId];
      } else {
        next[msgId] = type;
      }
      return next;
    });
  }, []);

  const handleCopy = useCallback(async (msgId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  const handleExport = useCallback(() => {
    if (!celebrity || messages.length === 0) return;
    const lines = messages.map((msg) => {
      const speaker = msg.role === "user" ? (t("you") || "You") : celebrity.name[language];
      return `[${speaker}]\n${msg.content}`;
    });
    const header = `${celebrity.name[language]} - ${t("chat_export_title") || "Chat History"}\n${"=".repeat(40)}\n`;
    const text = header + lines.join("\n\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${celebrity.id}-chat.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [celebrity, messages, language, t]);

  if (!celebrity) return null;

  const currentCelebrity = celebrity;

  return (
    <div className="h-screen flex flex-col bg-ink-50">
      {/* Header */}
      <header className="h-14 md:h-16 bg-ink-50 border-b border-border flex items-center justify-between px-3 md:px-6 flex-shrink-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="touch-target w-10 h-10 md:w-8 md:h-8 rounded-lg bg-ink-100 flex items-center justify-center hover:bg-ink-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-ink-400" />
          </button>
          <img
            src={currentCelebrity.avatar}
            loading="lazy"
            alt={currentCelebrity.name[language]}
            className="w-9 h-9 rounded-full border-2 border-vermilion object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentCelebrity.name.en)}&background=c0392b&color=fff&size=72`; }}
          />
          <div>
            <h1 className="text-sm font-bold text-ink-500 leading-tight">{currentCelebrity.name[language]}</h1>
            <div className="era-tag text-[9px]">{translateEra(currentCelebrity.era, language)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="touch-target w-10 h-10 md:w-8 md:h-8 rounded-lg bg-ink-100 flex items-center justify-center hover:bg-ink-200 transition-colors"
            title={t("chat_history") || "History"}
          >
            <History className="w-4 h-4 text-ink-400" />
          </button>
          {messages.length > 0 && (
            <button
              onClick={handleExport}
              className="touch-target w-10 h-10 md:w-8 md:h-8 rounded-lg bg-ink-100 flex items-center justify-center hover:bg-ink-200 transition-colors"
              title={t("export") || "Export"}
            >
              <Download className="w-4 h-4 text-ink-400" />
            </button>
          )}
          <button
            onClick={handleClearChat}
            className="touch-target w-10 h-10 md:w-8 md:h-8 rounded-lg bg-ink-100 flex items-center justify-center hover:bg-ink-200 transition-colors"
            title={t("clear_chat") || "Clear"}
          >
            <Trash2 className="w-4 h-4 text-ink-400" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div
        ref={chatAreaRef}
        className="flex-1 overflow-y-auto page-transition"
        style={{ height: "calc(var(--vh, 100vh) - 64px - 80px)" }}
      >
        <div ref={scrollRef} className="h-full overflow-y-auto custom-scrollbar">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  data-msg-id={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <img
                      src={currentCelebrity.avatar}
                      loading="lazy"
                      alt=""
                      className="w-8 h-8 rounded-full border border-border object-cover mr-2 mt-1 flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentCelebrity.name.en)}&background=c0392b&color=fff&size=64`; }}
                    />
                  )}
                  <div className={cn("group relative", msg.role === "user" ? "bubble-user" : "bubble-ai")}>
                    <div className="msg-content text-[13px] md:text-sm leading-[1.9] whitespace-pre-wrap">
                      {typewritingMessages.current.has(msg.id) ? "" : msg.content}
                    </div>
                    {!typewritingMessages.current.has(msg.id) && !msg.isError && (
                      <div className="absolute -bottom-7 left-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="p-1 rounded-md hover:bg-ink-100"
                          aria-label="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3 text-ink-300" />
                          )}
                        </button>
                        {msg.role === "assistant" && (
                          <>
                            <button
                              onClick={() => handleFeedback(msg.id, "like")}
                              className={cn("p-1 rounded-md hover:bg-ink-100", feedbackMap[msg.id] === "like" && "text-vermilion")}
                              aria-label="Like"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleFeedback(msg.id, "dislike")}
                              className={cn("p-1 rounded-md hover:bg-ink-100", feedbackMap[msg.id] === "dislike" && "text-ink-400")}
                              aria-label="Dislike"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    {msg.isError && !isLoading && (
                      <button
                        onClick={() => handleRetry(msg.id)}
                        className="mt-2 text-[11px] text-vermilion hover:text-vermilion-hover transition-colors font-medium"
                      >
                        ↻ {t("retry") || "重试"}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className="flex justify-start">
                <img
                  src={currentCelebrity.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full border border-border object-cover mr-2 mt-1 flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentCelebrity.name.en)}&background=c0392b&color=fff&size=64`; }}
                />
                <div className="bubble-ai">
                  <div className="flex items-center gap-1.5 py-1">
                    <span className="w-1.5 h-1.5 bg-vermilion/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-vermilion/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-vermilion/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  {longWait && (
                    <p className="text-[11px] text-ink-300 mt-1 animate-pulse">{t("long_wait")}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="chat-input-wrap flex-shrink-0 z-40">
        <div className="max-w-3xl mx-auto px-3 md:px-6 py-3">
          <div className="flex items-end gap-2 bg-white border border-border rounded-xl p-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
                  e.preventDefault();
                  handleSend();
                }
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={t("input_placeholder")}
              className="touch-target flex-1 bg-transparent border-none focus:ring-0 text-sm text-ink-500 placeholder:text-ink-300 resize-none max-h-[120px] py-2 leading-relaxed"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                "touch-target btn-send flex items-center justify-center",
                input.trim() && !isLoading ? "" : "opacity-40 cursor-not-allowed"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <ChatHistorySidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={(cid) => router.push(`/chat/${cid}`)}
      />
    </div>
  );
}
