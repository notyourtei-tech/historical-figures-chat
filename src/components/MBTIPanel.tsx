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
      <div className={cn("space-y-3", compact ? "" : "space-y-4")}>
        <button
          onClick={() => setMode("test")}
          className="touch-target w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-white hover:border-vermilion/30 transition-all text-left"
        >
          <div className="w-11 h-11 rounded-lg bg-vermilion flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-ink-500 text-sm">{t("mbti_take_test")}</p>
            <p className="text-[11px] text-ink-300 mt-0.5">
              {t("mbti_test_progress", { current: 1, total: MBTI_QUESTIONS.length })}
            </p>
          </div>
        </button>

        <button
          onClick={() => setMode("manual")}
          className="touch-target w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-white hover:border-vermilion/30 transition-all text-left"
        >
          <div className="w-11 h-11 rounded-lg bg-ink-100 flex items-center justify-center flex-shrink-0">
            <Grid3X3 className="w-5 h-5 text-vermilion" />
          </div>
          <div>
            <p className="font-bold text-ink-500 text-sm">{t("mbti_enter_type")}</p>
            <p className="text-[11px] text-ink-300 mt-0.5">INTJ · INFP · ENTP ...</p>
          </div>
        </button>

        {showSkip && onSkip && (
          <button
            onClick={onSkip}
            className="touch-target w-full py-2.5 text-sm text-ink-300 hover:text-ink-400 transition-colors"
          >
            {t("skip")}
          </button>
        )}
      </div>
    );
  }

  if (mode === "manual") {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode("choose")}
            className="touch-target w-10 h-10 md:w-8 md:h-8 rounded-lg bg-ink-100 flex items-center justify-center hover:bg-ink-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-ink-400" />
          </button>
          <h3 className="font-bold text-base text-ink-500">{t("mbti_manual_title")}</h3>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {MBTI_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={cn(
                "touch-target py-2.5 rounded-lg text-xs font-bold border transition-all",
                selectedType === type
                  ? "bg-vermilion/10 border-vermilion text-vermilion"
                  : "bg-white border-border text-ink-500 hover:border-ink-300"
              )}
            >
              {type}
            </button>
          ))}
        </div>

        <button
          onClick={() => selectedType && onComplete(selectedType)}
          disabled={!selectedType}
          className={cn(
            "touch-target w-full py-3 rounded-xl bg-vermilion text-white font-bold text-sm transition-all",
            !selectedType && "opacity-40 cursor-not-allowed"
          )}
        >
          {t("mbti_confirm")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
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
          className="touch-target w-10 h-10 md:w-8 md:h-8 rounded-lg bg-ink-100 flex items-center justify-center hover:bg-ink-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-ink-400" />
        </button>
        <span className="text-[11px] font-bold text-ink-300 uppercase tracking-wider">
          {t("mbti_test_progress", {
            current: questionIndex + 1,
            total: MBTI_QUESTIONS.length,
          })}
        </span>
      </div>

      <div className="h-1 bg-ink-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-vermilion"
          animate={{ width: `${((questionIndex + 1) / MBTI_QUESTIONS.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <h3 className="text-base font-bold leading-relaxed text-ink-500">
            {currentQuestion.question[language]}
          </h3>

          <div className="space-y-2">
            {currentQuestion.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt.value)}
                className="touch-target w-full p-3.5 rounded-xl border border-border bg-white hover:border-vermilion/30 hover:bg-vermilion-light text-left text-sm font-medium text-ink-500 transition-all"
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
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-vermilion/8 border border-vermilion/20">
      <Sparkles className="w-3 h-3 text-vermilion" />
      <span className="text-[10px] font-bold text-vermilion uppercase tracking-wider">
        {t("mbti_your_type")}: {type}
      </span>
    </div>
  );
}
