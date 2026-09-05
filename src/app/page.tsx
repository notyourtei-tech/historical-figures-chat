"use client";

import React, { useState, useEffect, useMemo, lazy, Suspense, useRef, memo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { celebrities } from "@/data/celebrities";
import {
  Search,
  History,
  Globe,
  MessageCircle,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { countInterestMatches } from "@/lib/interest-map";
import { getMbtiRecommendations, mbtiCompatibility, getCelebrityMbti } from "@/lib/mbti-match";
import { translateCategory, translateEra } from "@/lib/i18n";
import { Language } from "@/types";
import { AuthMenu } from "@/components/AuthMenu";

const Onboarding = lazy(() => import("@/components/Onboarding"));
const MBTIPanel = lazy(() => import("@/components/MBTIPanel").then(m => ({ default: m.default })));

const CelebrityCard = memo(function CelebrityCard({ celebrity, language, startChatLabel }: { celebrity: (typeof import("@/data/celebrities").celebrities)[number]; language: Language; startChatLabel: string }) {
  return (
    <Link
      href={`/chat/${celebrity.id}`}
      aria-label={`${startChatLabel}: ${celebrity.name[language]}`}
      className="group block h-full rounded-xl focus:outline-none"
    >
      <div className="ink-card rounded-xl bg-white p-5 h-full flex flex-col touch-target">
        <div className="flex items-start gap-3 mb-3">
          <img
            src={celebrity.avatar}
            loading="lazy"
            decoding="async"
            alt={celebrity.name[language]}
            className="w-14 h-14 rounded-full border-2 border-vermilion object-cover flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(celebrity.name.en)}&background=c0392b&color=fff&size=112`; }}
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-ink-500 truncate">{celebrity.name[language]}</h3>
            <div className="vermilion-line" style={{ width: 24, marginTop: 4, marginBottom: 8 }} />
            <span className="era-tag">{translateEra(celebrity.era, language)}</span>
          </div>
        </div>
        <p className="text-xs text-ink-400 leading-relaxed line-clamp-3 flex-1">
          {celebrity.description[language]}
        </p>
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-[10px] text-ink-300 uppercase tracking-wider">
            {translateCategory(celebrity.category, language)}
          </span>
          <span className="text-[10px] text-vermilion font-medium truncate max-w-[55%]">
            {celebrity.keyWorks[language][0]}
          </span>
        </div>
      </div>
    </Link>
  );
});

export default function HomePage() {
  const { language, setLanguage, userProfile, updateUserProfile, t, languageLabel } = useLanguage();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showMbtiModal, setShowMbtiModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [langOpen, setLangOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLangOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (!userProfile) setShowOnboarding(true);
  }, [userProfile, isClient]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
        const nameMatch = c.name[language].toLowerCase().includes(debouncedSearch.toLowerCase());
        const titleMatch = c.title[language].toLowerCase().includes(debouncedSearch.toLowerCase());
        const categoryMatch = selectedCategory === "all" || c.category === selectedCategory;
        return (nameMatch || titleMatch) && categoryMatch;
      })
      .sort((a, b) => {
        const aInterest = countInterestMatches(userProfile?.interests || [], a.interests);
        const bInterest = countInterestMatches(userProfile?.interests || [], b.interests);
        const aMbti = userProfile?.mbti ? mbtiCompatibility(userProfile.mbti, getCelebrityMbti(a.id) || "") : 0;
        const bMbti = userProfile?.mbti ? mbtiCompatibility(userProfile.mbti, getCelebrityMbti(b.id) || "") : 0;
        return bMbti * 3 + bInterest - (aMbti * 3 + aInterest);
      });
  }, [debouncedSearch, language, selectedCategory, userProfile]);

  if (isClient && showOnboarding) {
    return (
      <Suspense fallback={null}>
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <div id="ink-bg" />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-ink-50/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-vermilion flex items-center justify-center shadow-sm shadow-vermilion/20">
              <History className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <div>
              <span className="block text-base md:text-lg font-bold text-ink-500 tracking-tight leading-tight">{t("app_name")}</span>
              <span className="hidden md:block text-[10px] text-ink-300 tracking-[0.18em] uppercase mt-0.5">Dialogue across time</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
          <AuthMenu />
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="touch-target flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ink-100 text-xs font-medium text-ink-400 hover:bg-ink-200 transition-colors"
              aria-label="切换界面语言"
              aria-expanded={langOpen}
              aria-haspopup="menu"
              aria-controls="language-menu"
            >
              <Globe className="w-3.5 h-3.5" aria-hidden="true" />
              {languageLabel(language)}
            </button>
            {langOpen && (
              <div id="language-menu" role="menu" aria-label="语言选项" className="absolute right-0 top-full mt-2 w-36 bg-white border border-border rounded-lg shadow-lg p-1 z-[60]">
                {(["zh", "en", "ja", "vi", "my"] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { setLanguage(lang); setLangOpen(false); }}
                    role="menuitemradio"
                    aria-checked={language === lang}
                    className={cn(
                      "touch-target w-full text-left px-3 py-2 text-xs rounded-md transition-colors",
                      language === lang ? "text-vermilion font-bold bg-vermilion-light" : "text-ink-400 hover:bg-ink-50"
                    )}
                  >
                    {languageLabel(lang)}
                  </button>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-7 md:py-12">
        <section className="relative overflow-hidden bg-gradient-to-br from-vermilion/10 via-white to-ink-100/70 p-7 sm:p-10 md:p-14 rounded-2xl md:rounded-3xl mb-8 md:mb-12 text-center border border-vermilion/10 shadow-sm">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border border-vermilion/10" aria-hidden="true" />
          <div className="absolute -bottom-16 -left-8 w-48 h-48 rounded-full border border-ink-200/80" aria-hidden="true" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-vermilion/15 px-3 py-1.5 mb-4 text-[10px] font-bold text-vermilion tracking-[0.16em] uppercase">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              {t("hero_badge")}
            </div>
          <h1 className="text-3xl md:text-5xl font-bold text-ink-500 mb-4 font-serif leading-relaxed">
            {t("hero_title")}
          </h1>
          <div className="w-12 h-0.5 bg-vermilion mx-auto mb-5" />
          <p className="text-sm md:text-base text-ink-400 max-w-2xl mx-auto mb-6 leading-relaxed">
            {t("hero_subtitle")}
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-ink-300 bg-ink-50/70 rounded-full px-3 py-2">
            <MessageCircle className="w-3.5 h-3.5 text-vermilion" aria-hidden="true" />
            {isClient && userProfile?.name
              ? t("welcome_user", { name: userProfile.name })
              : t("souls_ready", { count: celebrities.length })}
          </div>
          </div>
        </section>

        {/* MBTI Section */}
        {isClient && userProfile?.mbti && mbtiRecommendations.length > 0 && (
          <section className="mb-10 md:mb-14">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-ink-500">{t("mbti_section_title")}</h2>
                <p className="text-xs text-ink-300 mt-1">{t("mbti_recommended_for", { type: userProfile.mbti })}</p>
              </div>
              <button
                onClick={() => setShowMbtiModal(true)}
                className="touch-target text-xs text-vermilion hover:text-vermilion-hover transition-colors"
              >
                {t("mbti_change")}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {mbtiRecommendations.map((c) => (
                <Link key={c.id} href={`/chat/${c.id}`}>
                  <div className="ink-card rounded-lg p-3 bg-white touch-target">
                    <div className="flex items-center gap-2 mb-2">
                      <img src={c.avatar} loading="lazy" alt={c.name[language]} className="w-8 h-8 rounded-full border-2 border-vermilion object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name.en)}&background=c0392b&color=fff&size=64`; }} />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-ink-500 truncate">{c.name[language]}</h3>
                        <p className="text-[10px] text-ink-300">{getCelebrityMbti(c.id)}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-ink-400 line-clamp-2">{c.description[language]}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Search & Filter */}
        <section className="mb-6 md:mb-8" aria-labelledby="explore-heading">
          <div className="flex items-end justify-between gap-4 mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-vermilion font-bold mb-1">Explore</p>
              <h2 id="explore-heading" className="text-xl font-bold text-ink-500">{t("find_mentor")}</h2>
            </div>
            <p className="text-xs text-ink-300" aria-live="polite">{filteredCelebrities.length} / {celebrities.length}</p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
              <input
                type="text"
                placeholder={t("search_sages")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label={t("search_sages")}
                autoComplete="off"
                className="touch-target w-full bg-white border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm text-ink-500 placeholder:text-ink-300 focus:outline-none focus:border-vermilion/30 transition-colors"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto char-bar pb-1 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  aria-pressed={selectedCategory === cat}
                  className={cn(
                    "touch-target px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0",
                    selectedCategory === cat
                      ? "bg-vermilion text-white"
                      : "bg-white border border-border text-ink-400 hover:border-vermilion/30"
                  )}
                >
                  {cat === "all" ? t("all") : translateCategory(cat as Parameters<typeof translateCategory>[0], language)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Character Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredCelebrities.length === 0 && (
              <div className="col-span-full text-center py-16">
                <p className="text-ink-300 text-sm">{t("no_results")}</p>
              </div>
            )}
              {filteredCelebrities.map((celebrity, index) => (
              <motion.div
                key={celebrity.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.28, delay: Math.min(index, 10) * 0.03 }}
              >
                <CelebrityCard celebrity={celebrity} language={language} startChatLabel={t("start_chat")} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-ink-100/50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <History className="w-5 h-5 text-ink-300 mx-auto mb-3" aria-hidden="true" />
          <p className="text-[10px] text-ink-300 uppercase tracking-widest">
            {t("footer_copyright")}
          </p>
          <div className="mt-3 flex justify-center gap-4 text-xs text-ink-300 normal-case tracking-normal">
            <Link href="/privacy" className="hover:text-vermilion">隐私说明</Link>
            <Link href="/terms" className="hover:text-vermilion">使用规则</Link>
          </div>
        </div>
      </footer>

      {/* MBTI Modal */}
      <AnimatePresence>
        {showMbtiModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-ink-500/30 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
            onClick={() => setShowMbtiModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-t-2xl md:rounded-2xl p-6 md:p-8 relative max-h-[85vh] overflow-y-auto"
            >
              <div className="md:hidden w-10 h-1 rounded-full bg-ink-200 mx-auto mb-4" />
              <button
                onClick={() => setShowMbtiModal(false)}
                className="touch-target absolute top-4 right-4 w-10 h-10 md:w-8 md:h-8 rounded-lg bg-ink-100 flex items-center justify-center text-ink-400 hover:bg-ink-200 transition-colors"
                aria-label="关闭"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
              <h3 className="text-lg font-bold text-ink-500 mb-4 pr-8">{t("mbti_step_title")}</h3>
              <Suspense fallback={null}>
                <MBTIPanel
                  onComplete={(type) => {
                    updateUserProfile({ mbti: type });
                    setShowMbtiModal(false);
                  }}
                  showSkip={false}
                />
              </Suspense>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
