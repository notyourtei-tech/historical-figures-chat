"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { celebrities } from "@/data/celebrities";
import {
  ChevronRight,
  Sparkles,
  BookOpen,
  Globe,
  Search,
  History,
  Star,
  Brain,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { countInterestMatches } from "@/lib/interest-map";
import { getMbtiRecommendations, mbtiCompatibility, getCelebrityMbti } from "@/lib/mbti-match";
import { translateCategory, translateEra, translateInterest } from "@/lib/i18n";
import Onboarding from "@/components/Onboarding";
import MBTIPanel, { MbtiBadge } from "@/components/MBTIPanel";
import { Language } from "@/types";

export default function HomePage() {
  const { language, setLanguage, userProfile, updateUserProfile, t, languageLabel } =
    useLanguage();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showMbtiModal, setShowMbtiModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (!userProfile) {
      setShowOnboarding(true);
    }
  }, [userProfile]);

  const categories = useMemo(() => {
    const cats = new Set(celebrities.map((c) => c.category));
    return ["all", ...Array.from(cats)];
  }, []);

  const mbtiRecommendations = useMemo(() => {
    if (!userProfile?.mbti) return [];
    return getMbtiRecommendations(celebrities, userProfile.mbti, 4);
  }, [userProfile?.mbti]);

  const filteredCelebrities = useMemo(() => {
    return celebrities
      .filter((c) => {
        const nameMatch = c.name[language].toLowerCase().includes(searchTerm.toLowerCase());
        const titleMatch = c.title[language].toLowerCase().includes(searchTerm.toLowerCase());
        const categoryMatch = selectedCategory === "all" || c.category === selectedCategory;
        return (nameMatch || titleMatch) && categoryMatch;
      })
      .sort((a, b) => {
        const aInterest = countInterestMatches(userProfile?.interests || [], a.interests);
        const bInterest = countInterestMatches(userProfile?.interests || [], b.interests);
        const aMbti = userProfile?.mbti
          ? mbtiCompatibility(userProfile.mbti, getCelebrityMbti(a.id) || "")
          : 0;
        const bMbti = userProfile?.mbti
          ? mbtiCompatibility(userProfile.mbti, getCelebrityMbti(b.id) || "")
          : 0;
        return bMbti * 3 + bInterest - (aMbti * 3 + aInterest);
      });
  }, [searchTerm, selectedCategory, language, userProfile]);

  const interestLabels = useMemo(() => {
    if (!userProfile?.interests.length) return "";
    return userProfile.interests
      .map((id) => translateInterest(id, language))
      .join(", ");
  }, [userProfile?.interests, language]);

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="flex flex-col min-h-screen selection:bg-primary/30">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.8 }}
              className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            >
              <History className="text-black w-6 h-6" />
            </motion.div>
            <span className="text-2xl font-bold gold-text tracking-tighter">
              {t("app_name")}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-[0.2em] text-white/40">
            <a href="#" className="hover:text-primary transition-colors">
              {t("explore")}
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              {t("wisdom_library")}
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              {t("about_us")}
            </a>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/60 hover:border-primary/50 transition-all">
                <Globe className="w-4 h-4" />
                {languageLabel(language)}
              </button>
              <div className="absolute right-0 top-full mt-2 w-40 bg-zinc-900 border border-white/10 rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-[60]">
                {(["zh", "en", "ja", "vi", "my"] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-[10px] font-bold hover:bg-white/5 rounded-lg transition-colors",
                      language === lang && "text-primary"
                    )}
                  >
                    {languageLabel(lang)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-32 pb-20 container mx-auto px-6">
        <section className="mb-20 relative">
          <div className="absolute -left-20 -top-20 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-8">
              <Sparkles className="w-3 h-3" />
              {t("hero_badge")}
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-tight">
              {t("hero_title")}
            </h1>
            <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed mb-12 font-medium">
              {t("hero_subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="flex -space-x-4">
                {celebrities.slice(0, 8).map((c) => (
                  <motion.img
                    key={c.id}
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    src={c.avatar}
                    className="w-12 h-12 rounded-2xl border-2 border-black bg-zinc-900"
                    alt={c.name[language]}
                  />
                ))}
              </div>
              <div className="h-10 w-[1px] bg-white/10 hidden sm:block" />
              <div className="text-left space-y-2">
                <p className="text-sm font-bold text-white/80 tracking-tight">
                  {userProfile?.name
                    ? t("welcome_user", { name: userProfile.name })
                    : t("find_mentor")}
                </p>
                {userProfile?.mbti && <MbtiBadge type={userProfile.mbti} />}
                <p className="text-[10px] text-white/30 uppercase tracking-widest">
                  {userProfile?.interests.length
                    ? t("based_on_interests", { interests: interestLabels })
                    : t("souls_ready", { count: celebrities.length })}
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* MBTI 性格推荐区 */}
        <section className="mb-16">
          <div className="rounded-[32px] border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">{t("mbti_section_title")}</h2>
                  <p className="text-sm text-white/40">{t("mbti_section_subtitle")}</p>
                </div>
              </div>
              {userProfile?.mbti ? (
                <button
                  onClick={() => setShowMbtiModal(true)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-white/50 hover:border-primary/30 hover:text-primary transition-all"
                >
                  {t("mbti_change")}
                </button>
              ) : (
                <button
                  onClick={() => setShowMbtiModal(true)}
                  className="px-6 py-3 rounded-2xl bg-gold-gradient text-black font-bold text-sm shadow-[0_5px_20px_rgba(212,175,55,0.3)]"
                >
                  {t("mbti_start_now")}
                </button>
              )}
            </div>

            {userProfile?.mbti ? (
              <>
                <p className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-6">
                  {t("mbti_recommended_for", { type: userProfile.mbti })}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {mbtiRecommendations.map((celebrity) => {
                    const score = mbtiCompatibility(
                      userProfile.mbti!,
                      getCelebrityMbti(celebrity.id) || ""
                    );
                    return (
                      <Link key={celebrity.id} href={`/chat/${celebrity.id}`}>
                        <div className="group p-5 rounded-2xl border border-white/10 bg-black/40 hover:border-primary/40 transition-all h-full">
                          <div className="flex items-center gap-3 mb-4">
                            <img
                              src={celebrity.avatar}
                              alt={celebrity.name[language]}
                              className="w-12 h-12 rounded-xl border border-white/10"
                            />
                            <div>
                              <h3 className="font-bold">{celebrity.name[language]}</h3>
                              <p className="text-[10px] text-primary/70">
                                {getCelebrityMbti(celebrity.id)}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-white/40 line-clamp-2 mb-3">
                            {celebrity.description[language]}
                          </p>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60">
                            {score >= 3 ? t("mbti_match_perfect") : t("mbti_match_good")}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-center text-white/30 text-sm py-6">
                {t("mbti_not_set")}
              </p>
            )}
          </div>
        </section>

        <section className="mb-12 space-y-8">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder={t("search_sages")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                    selectedCategory === cat
                      ? "bg-primary text-black shadow-[0_5px_15px_rgba(212,175,55,0.3)]"
                      : "bg-white/5 border border-white/10 text-white/40 hover:border-white/30"
                  )}
                >
                  {cat === "all"
                    ? t("all")
                    : translateCategory(cat as Parameters<typeof translateCategory>[0], language)}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredCelebrities.map((celebrity, index) => {
              const isInterestMatch =
                countInterestMatches(userProfile?.interests || [], celebrity.interests) > 0;
              const isMbtiMatch =
                userProfile?.mbti &&
                mbtiCompatibility(userProfile.mbti, getCelebrityMbti(celebrity.id) || "") >= 3;

              return (
                <motion.div
                  key={celebrity.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: index * 0.03 }}
                >
                  <Link href={`/chat/${celebrity.id}`}>
                    <div className="historical-card group p-8 rounded-[32px] border border-white/5 h-full flex flex-col relative">
                      {(isInterestMatch || isMbtiMatch) && (
                        <div className="absolute top-6 right-6 flex flex-col gap-1 items-end">
                          {isMbtiMatch && (
                            <span className="text-[8px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              {t("mbti_match")}
                            </span>
                          )}
                          {isInterestMatch && (
                            <Star className="w-4 h-4 text-primary fill-primary" />
                          )}
                        </div>
                      )}

                      <div className="mb-8 relative">
                        <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-white/10 p-1 group-hover:border-primary/50 transition-all overflow-hidden relative z-10">
                          <img
                            src={celebrity.avatar}
                            alt={celebrity.name[language]}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        </div>
                      </div>

                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-2xl font-bold tracking-tight">
                            {celebrity.name[language]}
                          </h3>
                          <div className="h-1 w-1 rounded-full bg-white/20" />
                          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                            {translateCategory(celebrity.category, language)}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-primary/80 uppercase tracking-[0.2em] mb-4">
                          {celebrity.title[language]}
                        </p>
                        <p className="text-white/40 text-sm leading-relaxed mb-4 line-clamp-3 font-medium">
                          {celebrity.description[language]}
                        </p>
                        <p className="text-[10px] text-white/20 mb-4">
                          {translateEra(celebrity.era, language)} · {celebrity.origin[language]}
                        </p>
                      </div>

                      <div className="space-y-6 pt-6 border-t border-white/5">
                        <div className="flex flex-wrap gap-2">
                          {celebrity.expertise[language].slice(0, 2).map((exp) => (
                            <span
                              key={exp}
                              className="px-2 py-1 rounded-lg bg-white/5 text-[9px] font-bold text-white/30 uppercase tracking-widest"
                            >
                              {exp}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-tighter">
                            <BookOpen className="w-3 h-3" />
                            <span>{celebrity.keyWorks[language][0]}</span>
                          </div>
                          <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary transition-all duration-500 group-hover:rotate-[360deg]">
                            <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-black" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      <footer className="border-t border-white/5 py-16 bg-black/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-20 pointer-events-none" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8">
            <History className="text-white/20 w-6 h-6" />
          </div>
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.5em]">
            {t("footer_copyright")} · {t("rights_reserved")}
          </p>
        </div>
      </footer>

      {/* MBTI 弹窗 */}
      <AnimatePresence>
        {showMbtiModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowMbtiModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg glass p-8 rounded-[32px] border border-primary/20 relative max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowMbtiModal(false)}
                className="absolute top-6 right-6 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-xl font-bold mb-6 pr-10">{t("mbti_step_title")}</h3>
              <MBTIPanel
                onComplete={(type) => {
                  updateUserProfile({ mbti: type });
                  setShowMbtiModal(false);
                }}
                showSkip={false}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
