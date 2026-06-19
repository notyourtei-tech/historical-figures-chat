"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Language } from "@/types";
import { Check, Sparkles, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import MBTIPanel from "@/components/MBTIPanel";
import { LANGUAGE_LABELS } from "@/lib/i18n";

const LANGUAGES: Language[] = ["zh", "en", "ja", "vi", "my"];

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const { language, setLanguage, setUserProfile, t } = useLanguage();
  const [step, setStep] = useState(1);

  const finishOnboarding = (finalMbti?: string) => {
    setUserProfile({
      name: t("default_name"),
      interests: [],
      language,
      mbti: finalMbti,
    });
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.1),transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl glass p-10 rounded-[40px] border border-primary/20 relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 blur-[100px]" />

        {step === 1 && (
          <div className="space-y-8 relative z-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                <Globe className="text-black w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold mb-4 gold-text tracking-tight">
                {t("select_language_title")}
              </h2>
              <p className="text-white/50">{t("select_language_subtitle")}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    "p-6 rounded-2xl border transition-all flex items-center justify-between group",
                    language === lang
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
                  )}
                >
                  <span className="font-medium">{LANGUAGE_LABELS[lang]}</span>
                  {language === lang && <Check className="w-5 h-5" />}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => finishOnboarding()}
                className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold"
              >
                {t("skip")}
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-[2] py-4 rounded-2xl bg-gold-gradient text-black font-bold text-lg shadow-[0_10px_30px_rgba(212,175,55,0.3)] hover:scale-[1.02] transition-transform"
              >
                {t("next")}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 relative z-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                <Sparkles className="text-black w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold mb-2 gold-text tracking-tight">
                {t("mbti_step_title")}
              </h2>
              <p className="text-white/50">{t("mbti_step_subtitle")}</p>
            </div>

            <MBTIPanel
              onComplete={(type) => finishOnboarding(type)}
              onSkip={() => finishOnboarding()}
              showSkip
            />

            <button
              onClick={() => setStep(1)}
              className="w-full py-3 text-sm text-white/30 hover:text-white/60"
            >
              {t("back")}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
