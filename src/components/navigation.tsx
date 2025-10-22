"use client";

import { useContext } from "react";
import Link from "next/link";
import { LanguageContext } from "@/app/layout";

export default function Navigation() {
  const { language, setLanguage } = useContext(LanguageContext);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "ko" ? "en" : "ko"));
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-transparent"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2" aria-label="Go to homepage">
              <span className="text-3xl font-bold text-white font-custom drop-shadow-lg">
                GlowFactory
              </span>
            </Link>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center">
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black/20 border border-white/30 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-all duration-300 cursor-pointer hover:scale-105 backdrop-blur-sm"
              aria-label="Toggle language"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
              {language === "ko" ? "한국어" : "English"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
