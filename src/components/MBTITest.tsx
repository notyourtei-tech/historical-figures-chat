import React, { useState } from 'react';
import { mbtiQuestions } from '../data/questions';
import { MBTIType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

interface Props {
  onComplete: (result: MBTIType) => void;
  onSwitchToManual: () => void;
}

const MBTITest: React.FC<Props> = ({ onComplete, onSwitchToManual }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers, value];
    if (currentQuestionIndex < mbtiQuestions.length - 1) {
      setAnswers(newAnswers);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (finalAnswers: string[]) => {
    const counts: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    finalAnswers.forEach(ans => counts[ans]++);

    const result = 
      (counts.E >= counts.I ? 'E' : 'I') +
      (counts.S >= counts.N ? 'S' : 'N') +
      (counts.T >= counts.F ? 'T' : 'F') +
      (counts.J >= counts.P ? 'J' : 'P');
    
    onComplete(result);
  };

  const currentQuestion = mbtiQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mbtiQuestions.length) * 100;

  return (
    <div className="max-w-xl mx-auto premium-card border border-white/40 dark:border-white/5 overflow-hidden">
      <div className="p-10">
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={onSwitchToManual}
              className="text-xs font-black uppercase tracking-widest flex items-center gap-1 text-slate-400 hover:text-blue-500 transition-colors"
            >
              <ChevronLeft size={14} /> 直接选择 MBTI
            </button>
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Question {currentQuestionIndex + 1} / {mbtiQuestions.length}
              </span>
              <span className="text-sm font-black text-blue-600">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <motion.div 
              className="bg-slate-900 dark:bg-white h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "circOut" }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: "circOut" }}
          >
            <h2 className="text-3xl font-black mb-10 text-slate-900 dark:text-white tracking-tight leading-tight">
              {currentQuestion.text}
            </h2>
            <div className="space-y-4">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option.value)}
                  className="w-full p-6 text-left bg-slate-50/50 dark:bg-slate-800/30 border-2 border-transparent rounded-[1.5rem] hover:border-blue-500/20 hover:bg-white dark:hover:bg-slate-800 transition-all dark:text-gray-200 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">{option.label}</span>
                    <div className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-700 group-hover:border-blue-500 group-hover:bg-blue-500 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MBTITest;
