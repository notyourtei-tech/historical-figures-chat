"use client";

import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

const HTML_LANG: Record<string, string> = {
  zh: "zh-CN",
  en: "en",
  ja: "ja",
  vi: "vi",
  my: "my",
};

export function HtmlLangSync() {
  const { language } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[language] || "zh-CN";
  }, [language]);

  return null;
}
