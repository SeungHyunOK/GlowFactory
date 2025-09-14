"use client";
import { useState } from "react";

type ProposalStatus = "pending" | "approved" | "rejected";

type CampaignHistoryTab = "active" | "completed" | "rejected";

type MainTab = "create" | "approve" | "messages" | "content" | "history";

export default function CampaignPage() {
  const [tab, setTab] = useState<MainTab>("create");

  const tabBtn = (key: MainTab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      className={`rounded-full px-3 py-1.5 text-xs ${
        tab === key ? "bg-slate-900 text-white" : "bg-white text-slate-700 border"
      }`}
      aria-pressed={tab === key}
    >
      {label}
    </button>
  );

  return (
    <main className="min-h-screen bg-slate-50" role="main">
      <div className="mx-auto max-w-7xl p-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-slate-900">Campaigns</h1>
          <div className="flex flex-wrap gap-2">
            {tabBtn("create", "캠페인 생성/지원")}
            {tabBtn("approve", "승인/거절")}
            {tabBtn("messages", "메시지/알림")}
            {tabBtn("content", "콘텐츠 제출/검수")}
            {tabBtn("history", "히스토리")}
          </div>
        </header>

        <section className="mt-6">
          {tab === "create" && <CreateAndApply />}
          {tab === "approve" && <Approvals />}
          {tab === "messages" && <Messages />}
          {tab === "content" && <ContentReview />}
          {tab === "history" && <History />}
        </section>
      </div>
    </main>
  );
}

function CreateAndApply() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 브랜드 → 캠페인 생성 */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">브랜드 : 캠페인 생성</h2>
        <form className="mt-4 grid grid-cols-1 gap-4">
          <label className="grid gap-2 text-sm">
            <span className="text-slate-600">캠페인 목적</span>
            <input
              type="text"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-300"
              placeholder="브랜드 인지도 상승, 전환 증대 등"
              aria-label="캠페인 목적"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-slate-600">조건</span>
            <input
              type="text"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-300"
              placeholder="팔로워 수, 카테고리, 지역 등"
              aria-label="캠페인 조건"
            />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="text-slate-600">시작일</span>
              <input
                type="date"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-300"
                aria-label="시작일"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-slate-600">마감일</span>
              <input
                type="date"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-300"
                aria-label="마감일"
              />
            </label>
          </div>
          <label className="grid gap-2 text-sm">
            <span className="text-slate-600">보상 방식</span>
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
              aria-label="보상 방식"
            >
              <option>현금</option>
              <option>제품지급</option>
              <option>현금+제품</option>
              <option>성과형</option>
            </select>
          </label>
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              캠페인 생성
            </button>
          </div>
        </form>
      </div>

      {/* 인플루언서 → 지원/제안서 */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">인플루언서 : 지원 및 제안서 제출</h2>
        <form className="mt-4 grid grid-cols-1 gap-4">
          <label className="grid gap-2 text-sm">
            <span className="text-slate-600">캠페인 ID</span>
            <input
              type="text"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-300"
              placeholder="지원할 캠페인 ID"
              aria-label="캠페인 ID"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-slate-600">제안 내용</span>
            <textarea
              className="min-h-28 rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-300"
              placeholder="콘텐츠 아이디어, 일정, 보상 기대 등"
              aria-label="제안 내용"
            />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="text-slate-600">예상 일정</span>
              <input
                type="date"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-300"
                aria-label="예상 일정"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-slate-600">희망 보상</span>
              <input
                type="text"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-300"
                placeholder="예: 현금 50만원"
                aria-label="희망 보상"
              />
            </label>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
            >
              지원/제안서 제출
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Approvals() {
  const proposals: { id: string; campaign: string; creator: string; status: ProposalStatus }[] = [
    { id: "P-1001", campaign: "여름 신제품 런칭", creator: "@sophiastyle", status: "pending" },
    { id: "P-1002", campaign: "가을 룩북", creator: "@dailyjun", status: "approved" },
    { id: "P-1003", campaign: "홀리데이 프로모션", creator: "@beautymin", status: "rejected" },
  ];

  const badge = (s: ProposalStatus) => {
    const map = {
      pending: "bg-amber-100 text-amber-700",
      approved: "bg-emerald-100 text-emerald-700",
      rejected: "bg-rose-100 text-rose-700",
    } as const;
    return <span className={`rounded-full px-2 py-0.5 text-[10px] ${map[s]}`}>{s}</span>;
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-700">승인/거절 관리</h2>
      <div className="mt-4 divide-y divide-slate-100">
        {proposals.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800">
                {p.campaign} <span className="text-slate-400">·</span> {p.creator}
              </p>
              <p className="text-xs text-slate-500">ID: {p.id}</p>
            </div>
            <div className="flex items-center gap-2">
              {badge(p.status)}
              <button className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700">
                승인
              </button>
              <button className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700">
                거절
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Messages() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
      <aside className="rounded-2xl bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700">대화</h3>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex items-center justify-between rounded-xl border border-slate-200 p-2">
            <span>@sophiastyle</span>
            <span className="text-xs text-slate-400">new</span>
          </li>
          <li className="rounded-xl border border-slate-200 p-2">@dailyjun</li>
          <li className="rounded-xl border border-slate-200 p-2">@beautymin</li>
        </ul>
      </aside>
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">@sophiastyle</h3>
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700">
            알림 설정
          </button>
        </div>
        <div className="mt-4 space-y-3 text-sm">
          <div className="max-w-[70%] rounded-2xl bg-slate-100 p-3">
            안녕하세요! 일정 공유드립니다.
          </div>
          <div className="ml-auto max-w-[70%] rounded-2xl bg-indigo-600 p-3 text-white">
            확인했습니다. 요구사항 정리해서 전달드릴게요.
          </div>
        </div>
        <form className="mt-4 flex items-center gap-2">
          <input
            type="text"
            placeholder="메시지 입력"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
            aria-label="메시지 입력"
          />
          <button className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white">
            전송
          </button>
        </form>
      </section>
    </div>
  );
}

function ContentReview() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">인플루언서 : 콘텐츠 제출</h2>
        <form className="mt-4 grid grid-cols-1 gap-4">
          <label className="grid gap-2 text-sm">
            <span className="text-slate-600">캠페인 ID</span>
            <input
              type="text"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-300"
              placeholder="캠페인 ID"
              aria-label="캠페인 ID"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-slate-600">콘텐츠 링크</span>
            <input
              type="url"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-300"
              placeholder="게시물 링크"
              aria-label="콘텐츠 링크"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-slate-600">파일 업로드</span>
            <input
              type="file"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-white"
              aria-label="파일 업로드"
            />
          </label>
          <div className="flex justify-end">
            <button className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
              제출
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">브랜드 : 검수/승인</h2>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-sm font-medium text-slate-800">@sophiastyle · 캠페인 P-1001</p>
            <p className="mt-1 text-xs text-slate-500">콘텐츠 링크: https://example.com/post/123</p>
            <div className="mt-3 flex gap-2">
              <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700">
                수정 요청
              </button>
              <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700">
                반려
              </button>
              <button className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">
                승인
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-sm font-medium text-slate-800">@dailyjun · 캠페인 P-1002</p>
            <p className="mt-1 text-xs text-slate-500">콘텐츠 링크: https://example.com/post/456</p>
            <div className="mt-3 flex gap-2">
              <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700">
                수정 요청
              </button>
              <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700">
                반려
              </button>
              <button className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">
                승인
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function History() {
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
