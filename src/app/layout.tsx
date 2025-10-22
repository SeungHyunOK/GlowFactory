"use client";
import "./globals.css";
import Navigation from "@/components/navigation";
import { useState, createContext } from "react";

// 언어 컨텍스트 생성
export const LanguageContext = createContext<{
  language: "ko" | "en";
  setLanguage: (lang: "ko" | "en" | ((prev: "ko" | "en") => "ko" | "en")) => void;
}>({
  language: "ko",
  setLanguage: () => {},
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [language, setLanguage] = useState<"ko" | "en">("ko");

  return (
    <html lang="en">
      <body className="bg-[#f9fafc]">
        <LanguageContext.Provider value={{ language, setLanguage }}>
          <Navigation />
          {children}
        </LanguageContext.Provider>
      </body>
    </html>
  );
}
