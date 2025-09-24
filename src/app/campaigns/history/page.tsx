"use client";

import { useState } from "react";

type CampaignHistoryTab = "active" | "completed" | "rejected";

export default function CampaignHistoryPage() {
  const tabs: CampaignHistoryTab[] = ["active", "completed", "rejected"];
  const [current, setCurrent] = useState<CampaignHistoryTab>("active");

  const list = {
    active: [
      { id: "C-3001", title: "가을 룩북", role: "브랜드", with: "@sophiastyle" },
      { id: "C-3002", title: "홀리데이 프로모션", role: "인플루언서", with: "@dailyjun" },
    ],
    completed: [{ id: "C-2999", title: "여름 신제품 런칭", role: "브랜드", with: "@beautymin" }],
    rejected: [{ id: "C-2990", title: "봄 시즌 이벤트", role: "인플루언서", with: "@trendkim" }],
  } as const;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            className={`rounded-full px-3 py-1.5 text-xs ${
              current === t ? "bg-slate-900 text-white" : "bg-white text-slate-700 border"
            }`}
            onClick={() => setCurrent(t)}
          >
            {t === "active" ? "진행 중" : t === "completed" ? "완료" : "거절됨"}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        {list[current].map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
          >
            <div>
              <p className="text-sm font-medium text-slate-800">{c.title}</p>
              <p className="text-xs text-slate-500">
                ID: {c.id} · 역할: {c.role} · 상대: {c.with}
              </p>
            </div>
            <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700">
              상세 보기
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
