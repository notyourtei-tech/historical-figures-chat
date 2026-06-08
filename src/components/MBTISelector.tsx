import React from 'react';
import { MBTIType } from '../types';
import { motion } from 'framer-motion';

interface Props {
  onSelect: (mbti: MBTIType) => void;
  onBack: () => void;
}

const MBTI_TYPES: MBTIType[] = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

const MBTISelector: React.FC<Props> = ({ onSelect, onBack }) => {
  return (
    <div className="max-w-3xl mx-auto premium-card border border-white/40 dark:border-white/5">
      <div className="p-10">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl font-black text-gradient tracking-tight">选择你的 MBTI 类型</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            直接选择你已知的性格类型，开启精准匹配
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {MBTI_TYPES.map((type) => (
            <motion.button
              key={type}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(type)}
              className="p-6 text-center bg-slate-50/50 dark:bg-slate-800/30 border-2 border-transparent rounded-[1.5rem] hover:border-blue-500/20 hover:bg-white dark:hover:bg-slate-800 transition-all group"
            >
              <span className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{type}</span>
            </motion.button>
          ))}
        </div>
        
        <button
          onClick={onBack}
          className="w-full mt-12 py-4 text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-black uppercase tracking-[0.3em] transition-colors"
        >
          ← 返回上一页
        </button>
      </div>
    </div>
  );
};

export default MBTISelector;
