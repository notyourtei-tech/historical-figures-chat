"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Language } from "@/types";
import { Check, Globe, Sparkles, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";
import MBTIPanel from "@/components/MBTIPanel";
import { LANGUAGE_LABELS, translateInterest } from "@/lib/i18n";

const LANGUAGES: Language[] = ["zh", "en", "ja", "vi", "my"];

const INTEREST_IDS = ["philosophy", "science", "art", "history", "go", "divination", "literature", "peace"] as const;

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const { language, setLanguage, setUserProfile, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [userName, setUserName] = useState("");

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const finishOnboarding = (finalMbti?: string) => {
    setUserProfile({
      name: userName.trim() || t("default_name"),
      interests: selectedInterests,
      language,
      mbti: finalMbti,
    });
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-ink-50 flex items-center justify-center p-4 md:p-6">
      <div id="ink-bg" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-border relative overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {step === 1 && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-vermilion flex items-center justify-center mx-auto mb-4">
                <Globe className="text-white w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-ink-500 mb-2">{t("select_language_title")}</h2>
              <p className="text-sm text-ink-400">{t("select_language_subtitle")}</p>
            </div>

            <div className="space-y-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    "touch-target w-full p-4 rounded-xl border transition-all flex items-center justify-between text-left",
                    language === lang
                      ? "border-vermilion bg-vermilion-light text-vermilion"
                      : "border-border bg-white text-ink-400 hover:border-ink-300"
                  )}
                >
                  <span className="text-sm font-medium">{LANGUAGE_LABELS[lang]}</span>
                  {language === lang && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => finishOnboarding()}
                className="touch-target flex-1 py-3 rounded-xl border border-border text-ink-400 text-sm font-medium hover:bg-ink-50 transition-colors"
              >
                {t("skip")}
              </button>
              <button
                onClick={() => setStep(2)}
                className="touch-target flex-[2] py-3 rounded-xl bg-vermilion text-white text-sm font-bold hover:bg-vermilion-hover transition-colors"
              >
                {t("next")}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-vermilion flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-white w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-ink-500 mb-2">{t("select_interests")}</h2>
              <p className="text-sm text-ink-400">{t("onboarding_subtitle")}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {INTEREST_IDS.map((id) => (
                <button
                  key={id}
                  onClick={() => toggleInterest(id)}
                  className={cn(
                    "touch-target p-3 rounded-xl border transition-all text-left text-sm font-medium",
                    selectedInterests.includes(id)
                      ? "border-vermilion bg-vermilion-light text-vermilion"
                      : "border-border bg-white text-ink-400 hover:border-ink-300"
                  )}
                >
                  {translateInterest(id, language)}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="touch-target flex-1 py-3 rounded-xl border border-border text-ink-400 text-sm font-medium hover:bg-ink-50 transition-colors"
              >
                {t("back")}
              </button>
              <button
                onClick={() => setStep(3)}
                className="touch-target flex-[2] py-3 rounded-xl bg-vermilion text-white text-sm font-bold hover:bg-vermilion-hover transition-colors"
              >
                {t("next")}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-vermilion flex items-center justify-center mx-auto mb-4">
                <User className="text-white w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-ink-500 mb-2">{t("name_label")}</h2>
              <p className="text-sm text-ink-400">{t("onboarding_subtitle")}</p>
            </div>

            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={t("name_placeholder")}
              className="touch-target w-full p-4 rounded-xl border border-border bg-white text-ink-500 text-sm placeholder:text-ink-300 focus:outline-none focus:border-vermilion/30 transition-colors"
              maxLength={30}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="touch-target flex-1 py-3 rounded-xl border border-border text-ink-400 text-sm font-medium hover:bg-ink-50 transition-colors"
              >
                {t("back")}
              </button>
              <button
                onClick={() => setStep(4)}
                className="touch-target flex-[2] py-3 rounded-xl bg-vermilion text-white text-sm font-bold hover:bg-vermilion-hover transition-colors"
              >
                {t("next")}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-vermilion flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-white w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-ink-500 mb-1">{t("mbti_step_title")}</h2>
              <p className="text-sm text-ink-400">{t("mbti_step_subtitle")}</p>
            </div>

            <MBTIPanel
              onComplete={(type) => finishOnboarding(type)}
              onSkip={() => finishOnboarding()}
              showSkip
            />

            <button
              onClick={() => setStep(3)}
              className="touch-target w-full py-3 text-sm text-ink-300 hover:text-ink-400 transition-colors"
            >
              {t("back")}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
