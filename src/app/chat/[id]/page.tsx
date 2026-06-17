"use client";

import React, { useState, useEffect, useRef } from "react";
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

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 加载数据和历史记录
  useEffect(() => {
    if (!isClient) return;
    
    const found = celebrities.find(c => c.id === id);
    if (found) {
      setCelebrity(found);
      
      // 尝试从本地存储恢复对话记录（使用不依赖语言的 key，避免切换语言丢失记录）
      try {
        const savedMessages = localStorage.getItem(`chat_history_${id}`);
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        } else {
          // 如果没有历史记录，则获取初始欢迎语
          const fetchGreeting = async () => {
            setIsLoading(true);
            try {
              const greetingText = await getInitialGreeting(found, language);
              const greeting: Message = {
                id: "1",
                role: "assistant",
                content:
                  greetingText ||
                  `【${found.name[language]}】\n\n${t("input_placeholder")}`,
                timestamp: Date.now(),
              };
              setMessages([greeting]);
            } catch (error) {
              console.error("Failed to fetch greeting:", error);
              // 备选方案：直接使用本地默认语
              const defaultGreeting: Message = {
                id: "1",
                role: "assistant",
                content: `【${found.name[language]}】\n\n${t("input_placeholder")}`,
                timestamp: Date.now(),
              };
              setMessages([defaultGreeting]);
            } finally {
              setIsLoading(false);
            }
          };
          fetchGreeting();
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
        // 即使加载历史记录失败，也显示默认欢迎语
        const defaultGreeting: Message = {
          id: "1",
          role: "assistant",
          content: `【${found.name[language]}】\n\n${t("input_placeholder")}`,
          timestamp: Date.now(),
        };
        setMessages([defaultGreeting]);
      }
    } else {
      router.push("/");
    }
  }, [id, router, isClient]);

  // 持久化消息记录
  useEffect(() => {
    if (!isClient || !celebrity || messages.length === 0) return;
    
    try {
      localStorage.setItem(`chat_history_${celebrity.id}`, JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  }, [messages, celebrity, isClient]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleClearChat = () => {
    if (!celebrity) return;
    localStorage.removeItem(`chat_history_${celebrity.id}`);
    setMessages([]);
    setInput("");
    void (async () => {
      setIsLoading(true);
      try {
        const greetingText = await getInitialGreeting(celebrity, language);
        setMessages([
          {
            id: "1",
            role: "assistant",
            content:
              greetingText ||
              `【${celebrity.name[language]}】\n\n${t("input_placeholder")}`,
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const handleSend = async () => {
    if (!input.trim() || !celebrity || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
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
        id: `assistant_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        role: "assistant",
        content: response || "",
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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
            <div className="relative flex items-center gap-4 bg-[#121212] border border-white/10 rounded-[28px] p-3 pl-6 shadow-2xl focus-within:border-primary/30 transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`${t('input_placeholder')}`}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white/80 placeholder:text-white/20 resize-none h-14 flex items-center py-4 font-medium"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-105",
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
