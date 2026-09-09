"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { celebrities } from "@/data/celebrities";
import { Message, Celebrity } from "@/types";
import {
  Send,
  ArrowLeft,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Download,
  Trash2,
  History,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { ChatApiError, chatWithCelebrity, getInitialGreeting, streamChatWithCelebrity, type ChatCapacity } from "@/services/ai";
import { translateEra } from "@/lib/i18n";
import { ErrorCode } from "@/lib/errors";
import ChatHistorySidebar, { updateConversationMeta } from "@/components/ChatHistorySidebar";
import { usePrivacy } from "@/context/PrivacyContext";
import { trackEvent } from "@/lib/analytics";
import { createOfflinePersonaInterjection, createPersonaAvailabilityNotice, parsePersonaBeats } from "@/lib/persona-dialogue";

const MAX_CHAT_HISTORY_BYTES = 500_000;
const MESSAGE_TIME_GAP_MS = 5 * 60 * 1000;

const LOCALE_BY_LANGUAGE = {
  zh: "zh-CN",
  en: "en-US",
  ja: "ja-JP",
  vi: "vi-VN",
  my: "my-MM",
} as const;

function formatConversationTime(timestamp: number, language: keyof typeof LOCALE_BY_LANGUAGE): string {
  const date = new Date(timestamp);
  const isToday = date.toDateString() === new Date().toDateString();
  return new Intl.DateTimeFormat(LOCALE_BY_LANGUAGE[language], {
    ...(isToday ? {} : { month: "short", day: "numeric" }),
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

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
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { language, t } = useLanguage();
  const { consent, ready: privacyReady } = usePrivacy();
  const [celebrity, setCelebrity] = useState<Celebrity | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, "like" | "dislike">>({});
  const [longWait, setLongWait] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);
  const [hasStreamingContent, setHasStreamingContent] = useState(false);
  const [interjection, setInterjection] = useState<string | null>(null);
  const [avatarFallback, setAvatarFallback] = useState(false);
  const [statusNotice, setStatusNotice] = useState({ id: 0, text: "" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const greetingFetchId = useRef(0);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const renderedMessages = useRef<Set<string>>(new Set());
  const typewritingMessages = useRef<Set<string>>(new Set());
  const isNearBottom = useRef(true);
  const followLatestRef = useRef(true);
  const isScrollGestureActiveRef = useRef(false);
  const scrollGestureTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoScrollFrame = useRef<number | null>(null);
  // Provider streams often arrive in token-sized fragments. Rendering every
  // fragment can compete with the software keyboard on lower-powered phones,
  // so visual updates are coalesced to one per animation frame.
  const streamRenderFrame = useRef<number | null>(null);
  const initializedForId = useRef<string | null>(null);
  const activeChatIdRef = useRef<string | null>(null);
  const cloudSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamingMessageIds = useRef<Set<string>>(new Set());
  const scheduledBeatTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const chatRequestSequence = useRef(0);
  const lowCapacityWarningSent = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Reset all view state when switching people. The route component is reused by
  // Next.js, so without this guard a previous conversation can briefly persist.
  useEffect(() => {
    if (!isClient || !privacyReady) return;

    const found = celebrities.find((c) => c.id === id);
    if (!found) {
      router.push("/");
      return;
    }

    // Ignore language changes for the current conversation, while still
    // re-initialising correctly whenever the route id changes.
    if (initializedForId.current === id) return;
    initializedForId.current = id;
    activeChatIdRef.current = id;
    chatRequestSequence.current += 1;
    followLatestRef.current = true;
    isScrollGestureActiveRef.current = false;
    lowCapacityWarningSent.current = false;
    if (scrollGestureTimer.current) {
      clearTimeout(scrollGestureTimer.current);
      scrollGestureTimer.current = null;
    }
    if (streamRenderFrame.current) {
      cancelAnimationFrame(streamRenderFrame.current);
      streamRenderFrame.current = null;
    }
    scheduledBeatTimers.current.forEach((timer) => clearTimeout(timer));
    scheduledBeatTimers.current = [];
    const fetchId = ++greetingFetchId.current;

    setCelebrity(found);
    setMessages([]);
    setInput("");
    setFeedbackMap({});
    setCopiedId(null);
    setShowScrollBtn(false);
    setCloudSyncEnabled(false);
    setHasStreamingContent(false);
    setInterjection(null);
    setAvatarFallback(false);
    setStatusNotice({ id: 0, text: "" });
    renderedMessages.current.clear();
    typewritingMessages.current.clear();
    streamingMessageIds.current.clear();

    let localMessages: Message[] = [];
    const savedMessages = localStorage.getItem(`chat_history_${id}`);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed)) {
          localMessages = parsed.filter((message): message is Message =>
            message && typeof message.id === "string" && (message.role === "user" || message.role === "assistant") && typeof message.content === "string" && typeof message.timestamp === "number"
          );
          if (localMessages.length > 0) setMessages(localMessages);
        }
      } catch {
        // fall through
      }
    }

    // The endpoint returns 401 for visitors. No shadow account or browser
    // fingerprint is created merely to offer cloud sync.
    void fetch(`/api/conversations/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok || fetchId !== greetingFetchId.current) return;
        const data = await response.json() as { success?: boolean; messages?: Message[] };
        if (!data.success) return;
        setCloudSyncEnabled(true);
        const cloudMessages = Array.isArray(data.messages) ? data.messages : [];
        if (cloudMessages.length > 0) {
          setMessages(cloudMessages);
          return;
        }
        if (localMessages.length > 0) {
          await fetch(`/api/conversations/${encodeURIComponent(id)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ language, title: found.name[language], messages: localMessages.slice(-100) }),
          });
        }
      })
      .catch(() => undefined);

    if (localMessages.length > 0) return;

    if (!consent.aiProcessing) {
      setMessages([{
        id: generateId(),
        role: "assistant",
        content: language === "zh" ? "请先在页面底部选择“同意并开始对话”，我才会将你的消息发送给 AI 生成回复。你也可在隐私说明中随时调整选择。" : "Choose “Allow AI processing” in the privacy controls before sending a message to the AI.",
        timestamp: Date.now(),
      }]);
      return;
    }

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
  }, [id, isClient, language, privacyReady, consent.aiProcessing, router]);

  // When language changes during an active chat, save preference for next messages
  useEffect(() => {
    if (celebrity && isClient) {
      localStorage.setItem(`chat_lang_${celebrity.id}`, language);
    }
  }, [language, celebrity, isClient]);

  useEffect(() => {
    if (!isClient || !celebrity || messages.length === 0 || celebrity.id !== activeChatIdRef.current) return;
    saveChatHistory(`chat_history_${celebrity.id}`, messages);
    localStorage.setItem(`chat_lang_${celebrity.id}`, language);
    updateConversationMeta(celebrity.id, messages);
  }, [messages, celebrity, isClient, language]);

  useEffect(() => {
    if (!cloudSyncEnabled || !celebrity || messages.length === 0 || celebrity.id !== activeChatIdRef.current) return;
    if (cloudSyncTimer.current) clearTimeout(cloudSyncTimer.current);
    cloudSyncTimer.current = setTimeout(() => {
      void fetch(`/api/conversations/${encodeURIComponent(celebrity.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, title: celebrity.name[language], messages: messages.slice(-100) }),
      })
        .then((response) => {
          if (response.ok) trackEvent("cloud_sync_completed", { message_count: Math.min(messages.length, 100) });
          if (response.status === 401) setCloudSyncEnabled(false);
        })
        .catch(() => undefined);
    }, 700);
    return () => { if (cloudSyncTimer.current) clearTimeout(cloudSyncTimer.current); };
  }, [cloudSyncEnabled, celebrity, language, messages]);

  // The transcript owns its scroll position. It follows new messages only
  // while the reader is already at the latest message, never while they are
  // dragging through history.
  const syncScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 96;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    isNearBottom.current = nearBottom;
    if (!isScrollGestureActiveRef.current) {
      followLatestRef.current = nearBottom;
    }
    setShowScrollBtn(!nearBottom && messages.length > 0);
  }, [messages.length]);

  const beginUserScrollGesture = useCallback(() => {
    isScrollGestureActiveRef.current = true;
    if (scrollGestureTimer.current) clearTimeout(scrollGestureTimer.current);
  }, []);

  const endUserScrollGesture = useCallback(() => {
    isScrollGestureActiveRef.current = false;
    syncScrollState();
  }, [syncScrollState]);

  const handleWheel = useCallback(() => {
    beginUserScrollGesture();
    scrollGestureTimer.current = setTimeout(endUserScrollGesture, 180);
  }, [beginUserScrollGesture, endUserScrollGesture]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !followLatestRef.current || isScrollGestureActiveRef.current) return;
    const target = Math.max(0, el.scrollHeight - el.clientHeight);
    if (Math.abs(el.scrollTop - target) < 1) return;

    if (autoScrollFrame.current) cancelAnimationFrame(autoScrollFrame.current);
    autoScrollFrame.current = requestAnimationFrame(() => {
      if (followLatestRef.current && !isScrollGestureActiveRef.current && scrollRef.current === el) {
        el.scrollTop = target;
      }
    });
    return () => {
      if (autoScrollFrame.current) cancelAnimationFrame(autoScrollFrame.current);
    };
  }, [messages, isLoading]);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    isNearBottom.current = true;
    followLatestRef.current = true;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [input]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.chatSurface = "true";

    let viewportFrame: number | null = null;
    let largestUnfocusedViewport = 0;
    const updateViewportHeight = () => {
      if (viewportFrame) cancelAnimationFrame(viewportFrame);
      viewportFrame = requestAnimationFrame(() => {
        const visualViewport = window.visualViewport;
        const vh = Math.round(visualViewport?.height || window.innerHeight);
        const editorIsFocused = document.activeElement === textareaRef.current;
        if (!editorIsFocused) {
          largestUnfocusedViewport = Math.max(window.innerHeight, vh);
        }
        const keyboardIsOpen = editorIsFocused
          && largestUnfocusedViewport > 0
          && largestUnfocusedViewport - vh > 120;
        root.style.setProperty("--vh", `${vh}px`);
        root.dataset.chatKeyboardOpen = keyboardIsOpen ? "true" : "false";
      });
    };
    updateViewportHeight();
    window.visualViewport?.addEventListener("resize", updateViewportHeight);
    // iOS can pan the visual viewport without firing a layout resize while
    // bringing a focused textarea above the keyboard.
    window.visualViewport?.addEventListener("scroll", updateViewportHeight);
    window.addEventListener("resize", updateViewportHeight);
    document.addEventListener("focusin", updateViewportHeight);
    document.addEventListener("focusout", updateViewportHeight);
    return () => {
      if (viewportFrame) cancelAnimationFrame(viewportFrame);
      window.visualViewport?.removeEventListener("resize", updateViewportHeight);
      window.visualViewport?.removeEventListener("scroll", updateViewportHeight);
      window.removeEventListener("resize", updateViewportHeight);
      document.removeEventListener("focusin", updateViewportHeight);
      document.removeEventListener("focusout", updateViewportHeight);
      delete root.dataset.chatSurface;
      delete root.dataset.chatKeyboardOpen;
    };
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

  // A gentle, local-only "interruption" affordance: while a visitor is
  // composing a substantial thought, the historical persona may ask to enter
  // the conversation. The draft never leaves this browser for the suggestion.
  useEffect(() => {
    if (!celebrity || isLoading || input.trim().length < 20) {
      setInterjection(null);
      return;
    }
    const timer = setTimeout(() => {
      setInterjection(createOfflinePersonaInterjection(celebrity, input, language));
    }, 900);
    return () => clearTimeout(timer);
  }, [celebrity, input, isLoading, language]);

  // Typewriter for new AI messages
  const cleanupTypewriterRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant" || renderedMessages.current.has(lastMsg.id)) return;
    if (streamingMessageIds.current.has(lastMsg.id)) return;
    const typewritingMessageIds = typewritingMessages.current;
    renderedMessages.current.add(lastMsg.id);
    typewritingMessageIds.add(lastMsg.id);

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
        typewritingMessageIds.delete(lastMsg.id);
        return;
      }
      const contentEl = lastEl.querySelector(".msg-content") as HTMLElement;
      if (!contentEl) {
        if (attempts < maxAttempts) {
          attempts++;
          retryTimer = setTimeout(tryTypewrite, 30 * attempts);
          return;
        }
        typewritingMessageIds.delete(lastMsg.id);
        return;
      }
      // Keep the reply feeling alive without making a readable answer wait on
      // an ornamental animation. Long replies should arrive at conversation speed.
      const speed = window.innerWidth <= 768 ? 8 : 10;
      cleanupTypewriterRef.current = typewriterEffect(contentEl, lastMsg.content, speed);
    };

    requestAnimationFrame(() => { retryTimer = setTimeout(tryTypewrite, 50); });

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      typewritingMessageIds.delete(lastMsg.id);
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
      if (scrollGestureTimer.current) clearTimeout(scrollGestureTimer.current);
      if (autoScrollFrame.current) cancelAnimationFrame(autoScrollFrame.current);
      if (streamRenderFrame.current) cancelAnimationFrame(streamRenderFrame.current);
      scheduledBeatTimers.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const handleClearChat = useCallback(() => {
    if (!celebrity) return;
    if (!window.confirm(t("confirm_clear"))) return;
    localStorage.removeItem(`chat_history_${celebrity.id}`);
    localStorage.removeItem(`chat_lang_${celebrity.id}`);
    renderedMessages.current.clear();
    typewritingMessages.current.clear();
    streamingMessageIds.current.clear();
    if (streamRenderFrame.current) {
      cancelAnimationFrame(streamRenderFrame.current);
      streamRenderFrame.current = null;
    }
    chatRequestSequence.current += 1;
    scheduledBeatTimers.current.forEach((timer) => clearTimeout(timer));
    scheduledBeatTimers.current = [];
    setHasStreamingContent(false);
    setInterjection(null);
    setStatusNotice({ id: 0, text: "" });
    setMessages([]);
    setInput("");

    if (cloudSyncEnabled) {
      void fetch(`/api/conversations/${encodeURIComponent(celebrity.id)}`, { method: "DELETE" }).catch(() => undefined);
    }
    if (!consent.aiProcessing) {
      setMessages([{ id: generateId(), role: "assistant", content: language === "zh" ? "AI 处理尚未启用。请在隐私设置中允许后再开始新对话。" : "AI processing is disabled in your privacy settings.", timestamp: Date.now() }]);
      return;
    }
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
  }, [celebrity, t, language, cloudSyncEnabled, consent.aiProcessing]);

  const getFailureMessage = useCallback((error: unknown, activeCelebrity: Celebrity): Pick<Message, "content" | "availability"> => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes(ErrorCode.RATE_LIMIT) || errorMessage.includes("rate limit")) {
      return {
        content: createPersonaAvailabilityNotice(activeCelebrity, language, "rate_limited", {
          retryAfterSeconds: error instanceof ChatApiError ? error.retryAfterSeconds : undefined,
          variationSeed: errorMessage,
        }),
        availability: "service_paused",
      };
    }
    if (errorMessage.includes(ErrorCode.AI_UNAVAILABLE)) {
      return {
        content: createPersonaAvailabilityNotice(activeCelebrity, language, "temporarily_unavailable", {
          retryAfterSeconds: error instanceof ChatApiError ? error.retryAfterSeconds : undefined,
          variationSeed: errorMessage,
        }),
        availability: "service_paused",
      };
    }
    if (errorMessage.includes(ErrorCode.CONTENT_POLICY)) {
      trackEvent("content_policy_triggered", { action: "block" });
      return {
        content: error instanceof ChatApiError && error.detail
          ? error.detail
          : (language === "zh" ? "这条内容无法由应用继续处理。" : "This content cannot be processed here."),
      };
    }
    if (errorMessage.includes(ErrorCode.CONFIGURATION_REQUIRED)) {
      return { content: t("error_ai_unavailable") };
    }
    return { content: t("error_ai_failed") };
  }, [language, t]);

  const handleSend = useCallback(async () => {
    const content = input.trim();
    if (!content || !celebrity || isLoading) return;
    if (!privacyReady || !consent.aiProcessing) {
      setMessages((prev) => [...prev, {
        id: generateId(), role: "assistant",
        content: language === "zh" ? "为了生成回复，需要你先在隐私设置中允许 AI 处理消息。" : "Enable AI processing in Privacy Settings before sending a message.",
        timestamp: Date.now(), isError: true,
      }]);
      return;
    }
    const requestChatId = celebrity.id;
    const requestSequence = ++chatRequestSequence.current;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    let previousMessages: Message[] = [];
    setMessages((prev) => {
      previousMessages = prev;
      return [...prev, userMessage];
    });
    const streamingMessageId = generateId();
    streamingMessageIds.current.add(streamingMessageId);
    setMessages((prev) => [...prev, {
      id: streamingMessageId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    }]);
    setInput("");
    setInterjection(null);
    setIsLoading(true);
    setHasStreamingContent(false);
    setStatusNotice((previous) => ({
      id: previous.id + 1,
      text: language === "zh" ? `${celebrity.name[language]}正在组织回复。` : `${celebrity.name[language]} is composing a reply.`,
    }));
    trackEvent("message_sent", { celebrity_id: celebrity.id, length_bucket: Math.ceil(content.length / 100) * 100 });
    if (previousMessages.length === 0) trackEvent("conversation_started", { celebrity_id: celebrity.id });

    try {
      const allMessages = [...previousMessages, userMessage];
      let received = "";
      const requestMeta: { capacity: ChatCapacity | null } = { capacity: null };
      const flushStreamingMessage = () => {
        if (streamRenderFrame.current) {
          cancelAnimationFrame(streamRenderFrame.current);
          streamRenderFrame.current = null;
        }
        if (activeChatIdRef.current !== requestChatId || chatRequestSequence.current !== requestSequence) return;
        setHasStreamingContent(received.length > 0);
        setMessages((prev) => prev.map((message) => message.id === streamingMessageId ? { ...message, content: received } : message));
      };
      const scheduleStreamingRender = () => {
        if (streamRenderFrame.current) return;
        streamRenderFrame.current = requestAnimationFrame(() => {
          streamRenderFrame.current = null;
          flushStreamingMessage();
        });
      };
      const response = await streamChatWithCelebrity(celebrity, allMessages, language, (delta) => {
        if (activeChatIdRef.current !== requestChatId || chatRequestSequence.current !== requestSequence) return;
        received += delta;
        scheduleStreamingRender();
      }, (capacity) => {
        requestMeta.capacity = capacity;
      });
      if (activeChatIdRef.current !== requestChatId || chatRequestSequence.current !== requestSequence) return;
      flushStreamingMessage();

      const beats = parsePersonaBeats(response || received);
      const [firstBeat = response || received, ...laterBeats] = beats;
      streamingMessageIds.current.delete(streamingMessageId);
      renderedMessages.current.add(streamingMessageId);
      setMessages((prev) => prev.map((message) => message.id === streamingMessageId ? { ...message, content: firstBeat } : message));
      setStatusNotice((previous) => ({
        id: previous.id + 1,
        text: language === "zh" ? `${celebrity.name[language]}已回复。` : `${celebrity.name[language]} has replied.`,
      }));
      laterBeats.forEach((beat, index) => {
        const timer = setTimeout(() => {
          if (activeChatIdRef.current !== requestChatId || chatRequestSequence.current !== requestSequence) return;
          const beatId = generateId();
          renderedMessages.current.add(beatId);
          setMessages((prev) => [...prev, { id: beatId, role: "assistant", content: beat, timestamp: Date.now() }]);
        }, 480 * (index + 1));
        scheduledBeatTimers.current.push(timer);
      });
      if (requestMeta.capacity?.isLow && !lowCapacityWarningSent.current) {
        lowCapacityWarningSent.current = true;
        const timer = setTimeout(() => {
          if (activeChatIdRef.current !== requestChatId || chatRequestSequence.current !== requestSequence) return;
          setMessages((prev) => [...prev, {
            id: generateId(),
            role: "assistant",
            content: createPersonaAvailabilityNotice(celebrity, language, "low_capacity", {
              retryAfterSeconds: requestMeta.capacity?.resetAfterSeconds,
              variationSeed: `${requestSequence}:${content}`,
            }),
            timestamp: Date.now(),
            availability: "low_capacity",
          }]);
        }, 480 * (laterBeats.length + 1));
        scheduledBeatTimers.current.push(timer);
      } else if (!requestMeta.capacity?.isLow) {
        lowCapacityWarningSent.current = false;
      }
    } catch (error) {
      if (activeChatIdRef.current !== requestChatId || chatRequestSequence.current !== requestSequence) return;
      console.error(error);
      const failure = getFailureMessage(error, celebrity);
      streamingMessageIds.current.delete(streamingMessageId);
      setStatusNotice((previous) => ({
        id: previous.id + 1,
        text: language === "zh" ? `${celebrity.name[language]}暂时无法回复，请查看消息中的下一步提示。` : `${celebrity.name[language]} cannot reply right now. Review the next-step message in the conversation.`,
      }));
      setMessages((prev) => [
        ...prev.filter((message) => message.id !== streamingMessageId),
        { id: generateId(), role: "assistant", content: failure.content, timestamp: Date.now(), isError: true, availability: failure.availability },
      ]);
    } finally {
      if (activeChatIdRef.current === requestChatId && chatRequestSequence.current === requestSequence) {
        setIsLoading(false);
        setHasStreamingContent(false);
      }
    }
  }, [input, celebrity, isLoading, language, privacyReady, consent.aiProcessing, getFailureMessage]);

  const handleRetry = useCallback(async (errorMessageId: string) => {
    if (!celebrity || isLoading) return;
    if (!privacyReady || !consent.aiProcessing) return;
    const requestChatId = celebrity.id;

    let currentMessages: Message[] = [];
    setMessages((prev) => {
      currentMessages = prev.filter((m) => m.id !== errorMessageId);
      return currentMessages;
    });

    const lastUserMsg = [...currentMessages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;

    setIsLoading(true);

    try {
      const response = await chatWithCelebrity(celebrity, currentMessages, language);
      if (activeChatIdRef.current !== requestChatId) return;
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: response || "",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setStatusNotice((previous) => ({
        id: previous.id + 1,
        text: language === "zh" ? `${celebrity.name[language]}已回复。` : `${celebrity.name[language]} has replied.`,
      }));
    } catch (error) {
      if (activeChatIdRef.current !== requestChatId) return;
      console.error(error);
      const failure = getFailureMessage(error, celebrity);
      setStatusNotice((previous) => ({
        id: previous.id + 1,
        text: language === "zh" ? `${celebrity.name[language]}暂时无法回复，请查看消息中的下一步提示。` : `${celebrity.name[language]} cannot reply right now. Review the next-step message in the conversation.`,
      }));
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: "assistant", content: failure.content, timestamp: Date.now(), isError: true, availability: failure.availability },
      ]);
    } finally {
      if (activeChatIdRef.current === requestChatId) setIsLoading(false);
    }
  }, [celebrity, isLoading, language, privacyReady, consent.aiProcessing, getFailureMessage]);

  const handlePersonaInterjection = useCallback(() => {
    if (!interjection || !celebrity || isLoading) return;
    const messageId = generateId();
    renderedMessages.current.add(messageId);
    setMessages((previous) => [...previous, {
      id: messageId,
      role: "assistant",
      content: interjection,
      timestamp: Date.now(),
    }]);
    setInterjection(null);
  }, [interjection, celebrity, isLoading]);

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
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }, [celebrity, messages, language, t]);

  if (!celebrity) return null;

  const currentCelebrity = celebrity;
  const avatarSource = avatarFallback
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentCelebrity.name.en)}&background=c0392b&color=fff&size=128`
    : currentCelebrity.avatar;

  return (
    <main
      id="main-content"
      className="chat-atelier flex h-[var(--vh)] max-h-[var(--vh)] min-h-0 flex-col overflow-hidden"
    >
      {/* Header */}
      <header data-chat-page-layer className="chat-header h-14 md:h-16 flex items-center justify-between px-3 md:px-6 flex-shrink-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="chat-control touch-target w-10 h-10 md:w-8 md:h-8 flex items-center justify-center"
            aria-label={t("back_to_hall")}
          >
            <ArrowLeft className="w-4 h-4 text-ink-400" aria-hidden="true" />
          </button>
          <Image
            src={avatarSource}
            width={36}
            height={36}
            sizes="36px"
            priority
            unoptimized
            alt={currentCelebrity.name[language]}
            className="w-9 h-9 rounded-full border-2 border-vermilion object-cover"
            onError={() => setAvatarFallback(true)}
          />
          <div>
            <h1 className="text-sm font-bold text-ink-500 leading-tight">{currentCelebrity.name[language]}</h1>
            <div className="era-tag text-[9px]">{translateEra(currentCelebrity.era, language)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="chat-control touch-target w-10 h-10 md:w-8 md:h-8 flex items-center justify-center"
            title={t("chat_history") || "History"}
            aria-label={t("chat_history") || "History"}
          >
            <History className="w-4 h-4 text-ink-400" aria-hidden="true" />
          </button>
          {messages.length > 0 && (
            <button
              onClick={handleExport}
              className="chat-control touch-target w-10 h-10 md:w-8 md:h-8 flex items-center justify-center"
              title={t("export") || "Export"}
              aria-label={t("export") || "Export"}
            >
              <Download className="w-4 h-4 text-ink-400" aria-hidden="true" />
            </button>
          )}
          <button
            onClick={handleClearChat}
            className="chat-control touch-target w-10 h-10 md:w-8 md:h-8 flex items-center justify-center"
            title={t("clear_chat") || "Clear"}
            aria-label={t("clear_chat") || "Clear"}
          >
            <Trash2 className="w-4 h-4 text-ink-400" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div
        ref={chatAreaRef}
        className="page-transition relative flex min-h-0 flex-1 flex-col overflow-hidden"
        data-chat-page-layer
      >
        <div
          ref={scrollRef}
          onScroll={syncScrollState}
          onPointerDown={beginUserScrollGesture}
          onPointerUp={endUserScrollGesture}
          onPointerCancel={endUserScrollGesture}
          onWheel={handleWheel}
          data-testid="chat-scroll-area"
          className="chat-scroll-surface custom-scrollbar min-h-0 flex-1 overflow-y-auto"
          role="log"
          aria-live="off"
          aria-relevant="additions"
          aria-busy={isLoading}
          aria-label={`${currentCelebrity.name[language]} ${t("chat_history")}`}
        >
          <div className="chat-transcript max-w-3xl mx-auto px-4 py-5 md:py-6 space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => {
                const previousMessage = messages[index - 1];
                const startsGroup = !previousMessage || previousMessage.role !== msg.role;
                const showTimestamp = !previousMessage || msg.timestamp - previousMessage.timestamp >= MESSAGE_TIME_GAP_MS;

                return (
                <motion.div
                  key={msg.id}
                  data-msg-id={msg.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.14, ease: "easeOut" }}
                  className="group message-entry"
                >
                  {showTimestamp && (
                    <time className="message-time" dateTime={new Date(msg.timestamp).toISOString()}>
                      {formatConversationTime(msg.timestamp, language)}
                    </time>
                  )}
                  <div className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                    {msg.role === "assistant" && startsGroup && (
                      <Image
                        src={avatarSource}
                        width={32}
                        height={32}
                        sizes="32px"
                        unoptimized
                        loading="lazy"
                        alt=""
                        className="w-8 h-8 rounded-full border border-border object-cover mr-2 mt-1 flex-shrink-0"
                        onError={() => setAvatarFallback(true)}
                      />
                    )}
                    <div className={cn(
                      "flex flex-col",
                      msg.role === "user" ? "items-end" : "items-start",
                      msg.role === "assistant" && !startsGroup && "ml-10"
                    )}>
                      <div
                        className={cn(
                          "relative",
                          msg.role === "user" ? "bubble-user" : "bubble-ai",
                          msg.availability && "availability-notice"
                        )}
                        role={msg.availability ? "status" : undefined}
                      >
                        <div className="msg-content text-[13px] md:text-sm leading-[1.9] whitespace-pre-wrap">
                          {typewritingMessages.current.has(msg.id) ? "" : msg.content}
                        </div>
                        {msg.isError && !isLoading && (
                          <button
                            type="button"
                            onClick={() => handleRetry(msg.id)}
                            className="mt-2 text-[11px] text-vermilion hover:text-vermilion-hover transition-colors font-medium"
                          >
                            ↻ {t("retry") || "重试"}
                          </button>
                        )}
                      </div>
                      {!typewritingMessages.current.has(msg.id) && !msg.isError && !msg.availability && (
                        <div className="message-actions mt-1 flex items-center gap-1" role="group" aria-label="消息操作">
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="touch-target p-1 rounded-md hover:bg-ink-100"
                            aria-label={t("copy")}
                            title={t("copy")}
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
                                type="button"
                                onClick={() => handleFeedback(msg.id, "like")}
                                className={cn("touch-target p-1 rounded-md hover:bg-ink-100", feedbackMap[msg.id] === "like" && "text-vermilion")}
                                aria-label={t("like")}
                                aria-pressed={feedbackMap[msg.id] === "like"}
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFeedback(msg.id, "dislike")}
                                className={cn("touch-target p-1 rounded-md hover:bg-ink-100", feedbackMap[msg.id] === "dislike" && "text-ink-400")}
                                aria-label={t("dislike")}
                                aria-pressed={feedbackMap[msg.id] === "dislike"}
                              >
                                <ThumbsDown className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
                );
              })}
            </AnimatePresence>

            {isLoading && !hasStreamingContent && (
              <div className="flex justify-start">
                <Image
                  src={avatarSource}
                  width={32}
                  height={32}
                  sizes="32px"
                  unoptimized
                  alt=""
                  className="w-8 h-8 rounded-full border border-border object-cover mr-2 mt-1 flex-shrink-0"
                  onError={() => setAvatarFallback(true)}
                />
                <div className="bubble-ai">
                  <div className="flex items-center gap-1.5 py-1">
                    <span className="w-1.5 h-1.5 bg-vermilion/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-vermilion/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-vermilion/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  {longWait && (
                    <p className="text-[11px] text-ink-400 mt-1 animate-pulse">{t("long_wait")}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {showScrollBtn && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="scroll-to-latest touch-target absolute bottom-4 left-1/2 z-20 flex h-10 min-h-0 w-10 min-w-0 -translate-x-1/2 items-center justify-center rounded-full"
            aria-label="查看最新消息"
            title="查看最新消息"
          >
            <ChevronDown className="h-4 w-4 text-ink-400" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Input Area */}
      <div
        className="chat-input-wrap z-40 shrink-0"
        data-testid="chat-composer"
        data-chat-page-layer
        role="region"
        aria-label="消息输入区"
      >
        <div className="max-w-3xl mx-auto px-3 md:px-6 py-3">
          {interjection && !isLoading && (
            <button
              type="button"
              onClick={handlePersonaInterjection}
              className="mb-2 w-full rounded-xl border border-vermilion/20 bg-white px-3 py-2 text-left text-xs leading-relaxed text-ink-500 transition-colors hover:bg-vermilion-light"
              aria-label={`让${currentCelebrity.name[language]}插话`}
            >
              <span className="font-bold text-vermilion">{currentCelebrity.name[language]}似乎想插话：</span>{interjection} <span className="ml-1 underline underline-offset-2">让他先说</span>
            </button>
          )}
          <div className="chat-composer-panel flex items-end gap-2 p-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={t("input_placeholder")}
              aria-label={t("input_placeholder")}
              aria-describedby="chat-composer-hint chat-composer-count"
              maxLength={2000}
              className="touch-target flex-1 bg-transparent border-none focus:ring-0 text-sm text-ink-500 placeholder:text-ink-400 resize-none max-h-[120px] py-2 leading-relaxed"
              rows={1}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              aria-label="发送消息"
              className={cn(
                "touch-target btn-send flex items-center justify-center",
                input.trim() && !isLoading ? "" : "opacity-40 cursor-not-allowed"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-1.5 flex min-h-4 items-center justify-center gap-2 text-[10px] text-ink-400">
            <p id="chat-composer-hint" className="hidden md:block">{t("input_hint")}</p>
            <p id="chat-composer-count" aria-live="polite" className={cn(input.length > 1600 ? "block" : "sr-only")}>
              {input.length} / 2000
            </p>
          </div>
        </div>
      </div>
      <p key={statusNotice.id} className="sr-only" role="status" aria-live="polite">
        {statusNotice.text || (copiedId ? (language === "zh" ? "消息已复制到剪贴板" : "Message copied to clipboard") : "")}
      </p>
      <ChatHistorySidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={(cid) => router.push(`/chat/${cid}`)}
      />
    </main>
  );
}
