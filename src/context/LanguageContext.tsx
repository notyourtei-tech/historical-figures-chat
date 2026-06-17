"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Language, UserProfile } from "@/types";
import { translations, formatTranslation } from "@/lib/translations";
import { LANGUAGE_LABELS } from "@/lib/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (patch: Partial<UserProfile>) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  languageLabel: (lang: Language) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("zh");
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    try {
      const savedProfile = localStorage.getItem("user_profile");
      if (savedProfile) {
        const profile = JSON.parse(savedProfile) as UserProfile;
        setUserProfileState(profile);
        setLanguageState(profile.language);
      }
    } catch (error) {
      console.error("Failed to load user profile from localStorage:", error);
    }
  }, [isClient]);

  const persistProfile = useCallback(
    (profile: UserProfile) => {
      setUserProfileState(profile);
      setLanguageState(profile.language);
      if (isClient) {
        try {
          localStorage.setItem("user_profile", JSON.stringify(profile));
        } catch (error) {
          console.error("Failed to save user profile:", error);
        }
      }
    },
    [isClient]
  );

  const setUserProfile = useCallback(
    (profile: UserProfile) => {
      persistProfile(profile);
    },
    [persistProfile]
  );

  const updateUserProfile = useCallback(
    (patch: Partial<UserProfile>) => {
      setUserProfileState((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ...patch };
        if (isClient) {
          try {
            localStorage.setItem("user_profile", JSON.stringify(updated));
          } catch (error) {
            console.error("Failed to save user profile:", error);
          }
        }
        if (patch.language) setLanguageState(patch.language);
        return updated;
      });
    },
    [isClient]
  );

  const setLanguage = useCallback(
    (lang: Language) => {
      setLanguageState(lang);
      setUserProfileState((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, language: lang };
        if (isClient) {
          try {
            localStorage.setItem("user_profile", JSON.stringify(updated));
          } catch (error) {
            console.error("Failed to save language:", error);
          }
        }
        return updated;
      });
    },
    [isClient]
  );

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const text = translations[language][key] || translations.zh[key] || key;
      return vars ? formatTranslation(text, vars) : text;
    },
    [language]
  );

  const languageLabel = useCallback((lang: Language) => LANGUAGE_LABELS[lang], []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        userProfile,
        setUserProfile,
        updateUserProfile,
        t,
        languageLabel,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
