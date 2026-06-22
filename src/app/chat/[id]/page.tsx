"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { celebrities } from "@/data/celebrities";
import { Message, Celebrity, Language } from "@/types";
import { 
  Send, 
  ArrowLeft, 
  MoreVertical, 
  Sparkles, 
  User, 
  Clock, 
  BookOpen,
  Info,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { chatWithCelebrity, getInitialGreeting } from "@/services/ai";
import { translateCategory, translateEra } from "@/lib/i18n";

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

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const { language, t } = useLanguage();
  const [celebrity, setCelebrity] = useState<Celebrity | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const greetingFetchId = useRef(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const found = celebrities.find(c => c.id === id);
    if (!found) {
      router.push("/");
      return;
    }

    setCelebrity(found);

    const savedMessages = localStorage.getItem(`chat_history_${id}`);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
          return;
        }
      } catch {
        // fall through to fetch greeting
      }
    }

    const fetchId = ++greetingFetchId.current;
    setIsLoading(true);
    getInitialGreeting(found, language)
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
      .catch(() => {
        if (fetchId !== greetingFetchId.current) return;
      })
      .finally(() => {
        if (fetchId === greetingFetchId.current) {
          setIsLoading(false);
        }
      });
  }, [id, router, isClient, language]);

  useEffect(() => {
    if (!isClient || !celebrity || messages.length === 0) return;
    saveChatHistory(`chat_history_${celebrity.id}`, messages);
  }, [messages, celebrity, isClient]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  const handleClearChat = useCallback(() => {
    if (!celebrity) return;
    localStorage.removeItem(`chat_history_${celebrity.id}`);
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
      .catch(() => {
        if (fetchId !== greetingFetchId.current) return;
      })
      .finally(() => {
        if (fetchId === greetingFetchId.current) {
          setIsLoading(false);
        }
      });
  }, [celebrity, language]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !celebrity || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
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

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      let userFriendlyMessage = t("error_ai_failed");
      
      if (errorMessage.includes("RATE_LIMIT_EXCEEDED") || errorMessage.includes("速率限制") || errorMessage.includes("rate limit")) {
        userFriendlyMessage = t("error_rate_limit");
      }
      
      setMessages(prev => [...prev, {
        id: generateId(),
        role: "assistant",
        content: userFriendlyMessage,
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, celebrity, isLoading, messages, language, t]);

  if (!celebrity) return null;

  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden selection:bg-primary/30">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 pointer-events-none" />

      {/* Sidebar */}
      <aside className="hidden lg:flex w-80 flex-col border-r border-white/5 bg-black/60 backdrop-blur-3xl p-8 relative z-30">
        <button 
          onClick={() => router.push("/")}
          className="group flex items-center gap-3 text-white/30 hover:text-primary transition-all mb-12 text-[10px] font-bold uppercase tracking-[0.2em]"
        >
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          {t('back_to_hall')}
        </button>

        <div className="flex-grow space-y-10 overflow-y-auto pr-2 custom-scrollbar">
          <div className="relative">
            <div className="w-28 h-28 rounded-[32px] bg-zinc-900 border border-primary/20 p-1 mb-6 relative z-10 overflow-hidden shadow-2xl">
              <img src={celebrity.avatar} className="w-full h-full object-cover rounded-[28px]" alt={celebrity.name[language]} />
            </div>
            <div className="absolute -left-4 -top-4 w-20 h-20 bg-primary/10 blur-3xl rounded-full" />
            <h2 className="text-3xl font-bold mb-1 tracking-tight">{celebrity.name[language]}</h2>
            <p className="text-primary text-[10px] font-black tracking-[0.3em] uppercase">{celebrity.title[language]}</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] flex items-center gap-2">
                <Clock className="w-3 h-3" />
                {t('era_background')}
              </h4>
              <p className="text-sm text-white/60 font-medium leading-relaxed">
                {translateEra(celebrity.era, language)} · {celebrity.origin[language]}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] flex items-center gap-2">
                <BookOpen className="w-3 h-3" />
                {t('key_works')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {celebrity.keyWorks[language].map(work => (
                  <span key={work} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[11px] font-bold text-white/40">
                    {work}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] flex items-center gap-2">
                <Info className="w-3 h-3" />
                {t('core_thoughts')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {celebrity.coreThoughts[language].map(thought => (
                  <span key={thought} className="px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/10 text-[11px] font-bold text-primary/70">
                    {thought}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 mt-8">
          <div className="p-5 rounded-[24px] bg-white/5 border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gold-gradient opacity-0 group-hover:opacity-[0.03] transition-opacity" />
            <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.3em] mb-3">{t('personality_traits')}</p>
            <div className="flex flex-wrap gap-2">
              {celebrity.personalityTraits[language].map(trait => (
                <span key={trait} className="text-xs text-white/60 font-medium">#{trait}</span>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative z-20">
        <header className="h-24 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="lg:hidden w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden p-0.5">
              <img src={celebrity.avatar} className="w-full h-full object-cover rounded-[14px]" alt={celebrity.name[language]} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">{celebrity.name[language]}</h1>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                <span className="text-[9px] text-primary font-black uppercase tracking-[0.2em]">{t('soul_active')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </button>
            <button
              onClick={handleClearChat}
              title={t("clear_chat")}
              className="w-10 h-10 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center"
            >
              <MoreVertical className="w-5 h-5 text-white/20" />
            </button>
          </div>
        </header>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-10 scroll-smooth custom-scrollbar"
        >
          <div className="max-w-4xl mx-auto space-y-10 pb-12">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex items-start gap-6",
                    msg.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center border transition-all duration-500",
                    msg.role === "assistant" 
                      ? "bg-zinc-900 border-primary/20 p-0.5 shadow-xl" 
                      : "bg-gold-gradient border-primary shadow-[0_5px_15px_rgba(212,175,55,0.2)]"
                  )}>
                    {msg.role === "assistant" ? (
                      <img src={celebrity.avatar} className="w-full h-full object-cover rounded-[14px]" alt={celebrity.name[language]} />
                    ) : (
                      <User className="w-6 h-6 text-black" />
                    )}
                  </div>
                  
                  <div className={cn(
                    "max-w-[80%] space-y-2",
                    msg.role === "user" ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "p-6 rounded-[28px] text-sm leading-relaxed whitespace-pre-wrap shadow-2xl relative group overflow-hidden",
                      msg.role === "assistant" 
                        ? "bg-white/5 border border-white/5 text-white/90" 
                        : "bg-gold-gradient text-black font-bold"
                    )}>
                      {msg.role === "assistant" && (
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-[0.03] pointer-events-none" />
                      )}
                      {msg.content}
                    </div>
                    <div className="flex items-center gap-2 px-2">
                      <History className="w-3 h-3 text-white/10" />
                      <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-6"
              >
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-primary/20 p-0.5 flex-shrink-0 shadow-xl">
                  <img src={celebrity.avatar} className="w-full h-full object-cover rounded-[14px]" alt={celebrity.name[language]} />
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-[28px] flex gap-2">
                  <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "200ms" }} />
                  <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "400ms" }} />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-8 bg-gradient-to-t from-black via-black/90 to-transparent relative z-40">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gold-gradient opacity-10 blur-2xl group-focus-within:opacity-20 transition-opacity rounded-[32px] pointer-events-none" />
            <div className="relative flex items-end gap-4 bg-[#121212] border border-white/10 rounded-[28px] p-3 pl-6 shadow-2xl focus-within:border-primary/30 transition-all">
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
                placeholder={`${t('input_placeholder')}`}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white/80 placeholder:text-white/20 resize-none max-h-40 py-3 font-medium leading-relaxed"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-105 flex-shrink-0",
                  input.trim() && !isLoading 
                    ? "bg-gold-gradient text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)]" 
                    : "bg-white/5 text-white/10"
                )}
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-white/10">
              <div className="h-[1px] w-12 bg-current" />
              <p className="text-[9px] font-black uppercase tracking-[0.5em]">
                {t("chat_tagline")}
              </p>
              <div className="h-[1px] w-12 bg-current" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
