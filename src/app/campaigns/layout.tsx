"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const TABS = [
  { href: "/campaigns/", label: "캠페인 목록" },
  { href: "/campaigns/new", label: "캠페인 생성/지원" },
  { href: "/campaigns/approvals", label: "승인/거절" },
  { href: "/campaigns/messages", label: "메시지/알림" },
  { href: "/campaigns/review", label: "콘텐츠 제출/검수" },
  { href: "/campaigns/history", label: "히스토리" },
] as const;

export default function CampaignsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <main className="min-h-screen bg-slate-50" role="main">
      <div className="mx-auto max-w-7xl p-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-slate-900">Campaigns</h1>
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={`rounded-full px-3 py-1.5 text-xs ${
                  isActive(t.href) ? "bg-slate-900 text-white" : "bg-white text-slate-700 border"
                }`}
                aria-current={isActive(t.href) ? "page" : undefined}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </header>

        <section className="mt-6">{children}</section>
      </div>
    </main>
  );
}
