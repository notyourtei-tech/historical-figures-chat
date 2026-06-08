import React from 'react';
import { Celebrity, MBTIType } from '../types';
import { celebrities } from '../data/celebrities';
import { motion } from 'framer-motion';

interface Props {
  mbti: MBTIType;
  onSelect: (celebrity: Celebrity) => void;
}

const CelebrityMatch: React.FC<Props> = ({ mbti, onSelect }) => {
  // Simple matching logic: find those with same MBTI or similar
  const matches = celebrities.map(c => {
    let score = 0;
    for (let i = 0; i < 4; i++) {
      if (c.mbti[i] === mbti[i]) score++;
    }
    return { ...c, matchScore: score };
  }).sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-12">
      <div className="text-center mb-16 space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block px-4 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold tracking-widest uppercase mb-2"
        >
          Matching Algorithm 2.0
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-black text-gradient tracking-tight">
          性格测试结果: <span className="text-blue-600">{mbti}</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg font-medium">
          基于深度性格画像，我们从历史长河中为你引荐了以下灵魂导师
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {matches.map((celebrity, idx) => (
          <motion.div
            key={celebrity.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.5 }}
            className="premium-card group cursor-default border border-white/40 dark:border-white/5"
          >
            <div className="p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
                  <img 
                    src={celebrity.avatar} 
                    alt={celebrity.name} 
                    className="w-24 h-24 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 p-2 shadow-inner relative z-10 grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 text-[10px] font-black text-blue-600 z-20">
                    {celebrity.matchScore * 25}% Match
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{celebrity.origin}</span>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">{celebrity.mbti}</div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{celebrity.name}</h3>
                <p className="text-sm font-bold text-blue-600/80 dark:text-blue-400/80 mt-1">{celebrity.title}</p>
              </div>

              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium line-clamp-3">
                {celebrity.description}
              </p>

              {celebrity.keyWorks && (
                <div className="space-y-3 pt-2">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">核心著作 / 思想</p>
                  <div className="flex flex-wrap gap-2">
                    {celebrity.keyWorks.slice(0, 3).map(work => (
                      <span key={work} className="text-[11px] px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold border border-transparent group-hover:border-blue-500/10 transition-colors">
                        {work}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={() => onSelect(celebrity)}
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95"
                >
                  开启思想共鸣
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CelebrityMatch;
