"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { MBTI_QUESTIONS, calculateMbti, MbtiDimension } from "@/data/mbti-questions";
import { MBTI_TYPES } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Brain, ChevronLeft, Grid3X3, Sparkles } from "lucide-react";

type Mode = "choose" | "test" | "manual";

interface MBTIPanelProps {
  onComplete: (mbti: string) => void;
  onSkip?: () => void;
  showSkip?: boolean;
  compact?: boolean;
}

export default function MBTIPanel({
  onComplete,
  onSkip,
  showSkip = true,
  compact = false,
}: MBTIPanelProps) {
  const { language, t } = useLanguage();
  const [mode, setMode] = useState<Mode>("choose");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<MbtiDimension[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleAnswer = (value: MbtiDimension) => {
    const next = [...answers, value];
    setAnswers(next);

    if (questionIndex + 1 >= MBTI_QUESTIONS.length) {
      onComplete(calculateMbti(next));
      return;
    }
    setQuestionIndex(questionIndex + 1);
  };

  const currentQuestion = MBTI_QUESTIONS[questionIndex];

  if (mode === "choose") {
    return (
      <div className={cn("space-y-4", compact ? "" : "space-y-6")}>
        <button
          onClick={() => setMode("test")}
          className="w-full flex items-center gap-4 p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-gold-gradient flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-black" />
          </div>
          <div>
            <p className="font-bold text-white/90">{t("mbti_take_test")}</p>
            <p className="text-xs text-white/40 mt-1">
              {t("mbti_test_progress", { current: 1, total: MBTI_QUESTIONS.length })}
            </p>
          </div>
        </button>

        <button
          onClick={() => setMode("manual")}
          className="w-full flex items-center gap-4 p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Grid3X3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-bold text-white/90">{t("mbti_enter_type")}</p>
            <p className="text-xs text-white/40 mt-1">INTJ · INFP · ENTP ...</p>
          </div>
        </button>

        {showSkip && onSkip && (
          <button
            onClick={onSkip}
            className="w-full py-3 text-sm text-white/30 hover:text-white/60 transition-colors"
          >
            {t("skip")}
          </button>
        )}
      </div>
    );
  }

  if (mode === "manual") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode("choose")}
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="font-bold text-lg">{t("mbti_manual_title")}</h3>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {MBTI_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={cn(
                "py-3 rounded-xl text-xs font-bold border transition-all",
                selectedType === type
                  ? "bg-primary/20 border-primary text-primary"
                  : "bg-white/5 border-white/10 text-white/50 hover:border-white/30"
              )}
            >
              {type}
            </button>
          ))}
        </div>

        <button
          onClick={() => selectedType && onComplete(selectedType)}
          disabled={!selectedType}
          className="w-full py-4 rounded-2xl bg-gold-gradient text-black font-bold disabled:opacity-40"
        >
          {t("mbti_confirm")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (questionIndex === 0) {
              setMode("choose");
              setAnswers([]);
            } else {
              setQuestionIndex(questionIndex - 1);
              setAnswers(answers.slice(0, -1));
            }
          }}
          className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-white/30 uppercase tracking-widest">
          {t("mbti_test_progress", {
            current: questionIndex + 1,
            total: MBTI_QUESTIONS.length,
          })}
        </span>
      </div>

      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gold-gradient"
          animate={{ width: `${((questionIndex + 1) / MBTI_QUESTIONS.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <h3 className="text-lg font-bold leading-relaxed text-white/90">
            {currentQuestion.question[language]}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt.value)}
                className="w-full p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-primary/40 hover:bg-primary/5 text-left text-sm font-medium text-white/80 transition-all"
              >
                {opt.label[language]}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function MbtiBadge({ type }: { type: string }) {
  const { t } = useLanguage();
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
      <Sparkles className="w-3 h-3 text-primary" />
      <span className="text-[10px] font-black text-primary uppercase tracking-widest">
        {t("mbti_your_type")}: {type}
      </span>
    </div>
  );
}
