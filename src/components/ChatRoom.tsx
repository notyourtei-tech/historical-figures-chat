import React, { useState, useEffect, useRef } from 'react';
import { Celebrity, Message } from '../types';
import { Send, ArrowLeft, MoreVertical, ShieldAlert, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAIResponse } from '../services/ai';

interface Props {
  celebrity: Celebrity;
  userMBTI: string;
  onBack: () => void;
}

const ChatRoom: React.FC<Props> = ({ celebrity, userMBTI, onBack }) => {
  const currentUser = JSON.parse(localStorage.getItem('chat_user') || 'null');
  const storageKey = currentUser 
    ? `chat_history_${currentUser.username}_${celebrity.id}`
    : `chat_history_guest_${celebrity.id}`;

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDemoMode = !import.meta.env.VITE_AI_API_KEY;

  // Initial greeting or load history
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: Message = {
        id: 'greet-1',
        role: 'assistant',
        content: `（${celebrity.name}静坐于案前，缓缓抬头看向你）[SEP]跨越千年烟云，竟能在此与你相逢。见你眉宇间似有千千结，可是近来遇到了什么难以排遣的困扰？[SEP]亦或是……这浮华世间，有什么让你感到不解，才想到来找我这老朽聊聊？`,
        timestamp: Date.now(),
      };
      
      const splitMsgs = greeting.content.split('[SEP]').map((content, i) => ({
        id: `greet-${i}`,
        role: 'assistant' as const,
        content: content.trim(),
        timestamp: Date.now() + i * 1000,
      }));

      setMessages([splitMsgs[0]]);
      
      // 逐条展示欢迎语
      splitMsgs.slice(1).forEach((msg, i) => {
        setTimeout(() => {
          setMessages(prev => {
            const newMsgs = [...prev, msg];
            localStorage.setItem(storageKey, JSON.stringify(newMsgs));
            return newMsgs;
          });
        }, (i + 1) * 1500);
      });
    }
  }, [celebrity, userMBTI]);

  // Persistent save whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    // Simulate AI thinking and multiple responses
    generateAIResponse(input, [...messages, userMsg]);
  };

  const clearMessages = () => {
    if (window.confirm('确定要清除与该名人的所有对话记录吗？')) {
      setMessages([]);
      localStorage.removeItem(storageKey);
    }
  };

  const generateAIResponse = async (userInput: string, currentHistory: Message[]) => {
    setIsTyping(true);
    
    // 获取之前的对话历史
    const history = currentHistory.slice(-10); // 只取最近10条
    
    const aiResponses = await fetchAIResponse(userInput, celebrity, history);
    
    setIsTyping(false);
    
    // 逐条发送 AI 的回复，模拟打字感
    for (let i = 0; i < aiResponses.length; i++) {
      if (i > 0) {
        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
        setIsTyping(false);
      }
      
      const aiMsg: Message = {
        id: `${Date.now()}-${i}`,
        role: 'assistant',
        content: aiResponses[i],
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, aiMsg]);
    }
  };

  return (
    <div className="flex flex-col h-[85vh] max-w-5xl mx-auto premium-card overflow-hidden border border-white/40 dark:border-white/5 relative">
      {/* Header */}
      <header className="px-8 py-6 glass border-b border-slate-200/50 dark:border-white/5 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={celebrity.avatar} alt={celebrity.name} className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white leading-none flex items-center gap-2">
                {celebrity.name}
                {isDemoMode && (
                  <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-full border border-amber-200 dark:border-amber-800 uppercase tracking-tighter">
                    Demo
                  </span>
                )}
              </h2>
              <p className="text-xs font-bold text-blue-600 mt-1 uppercase tracking-widest">{celebrity.title}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={clearMessages}
            className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-xl transition-all"
            title="清除对话"
          >
            <Trash2 size={20} />
          </button>
          <button className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-xl transition-all">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30 dark:bg-slate-950/30"
      >
        <div className="max-w-2xl mx-auto text-center py-10 space-y-4">
          <div className="inline-block p-4 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5">
            <ShieldAlert className="text-blue-500 mx-auto" size={24} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">正在与历史伟人进行深度思想链接</p>
        </div>

        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {m.role === 'assistant' && (
                  <img src={celebrity.avatar} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mt-1 flex-shrink-0" />
                )}
                <div className="space-y-1">
                  <div className={`
                    px-6 py-4 rounded-[2rem] text-sm font-medium leading-relaxed shadow-sm
                    ${m.role === 'user' 
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-tr-none' 
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-white/5 rounded-tl-none'}
                  `}>
                    {m.content}
                  </div>
                  <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-[2rem] rounded-tl-none border border-slate-100 dark:border-white/5 flex gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <footer className="p-8 glass border-t border-slate-200/50 dark:border-white/5">
        <div className="max-w-4xl mx-auto relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`向 ${celebrity.name} 请教...`}
            className="w-full pl-6 pr-16 py-5 bg-slate-100/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-800 rounded-[2rem] outline-none transition-all dark:text-white font-medium"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-slate-900 shadow-lg"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-center mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          按 Enter 发送 · 每一句对话都在跨越时空
        </p>
      </footer>
    </div>
  );
};

export default ChatRoom;
