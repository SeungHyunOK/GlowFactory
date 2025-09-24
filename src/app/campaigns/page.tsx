"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCampaigns } from "@/data/fetchCampaigns";
import { Campaign } from "@/data/types";

function formatDate(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(d);
}

function getStatusBadgeClass(status: string) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset";
  switch (status) {
    case "published":
      return `${base} bg-emerald-50 text-emerald-700 ring-emerald-200`;
    case "closed":
      return `${base} bg-gray-50 text-gray-700 ring-gray-200`;
    case "draft":
    default:
      return `${base} bg-amber-50 text-amber-700 ring-amber-200`;
  }
}

export default function CampaignListsPage() {
  const [rows, setRows] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCampaigns();
        setRows((data ?? []) as Campaign[]);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "알 수 없는 오류";
        setError(message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="font-custom max-w-5xl mx-auto p-6">
        <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-6" />
              <div className="flex items-center justify-between">
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  if (error)
    return (
      <div className="font-custom max-w-5xl mx-auto p-6">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          오류: {error}
        </div>
      </div>
    );

  return (
    <div className="font-custom max-w-5xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">캠페인</h1>
          <p className="mt-1 text-sm text-gray-600">총 {rows.length}건의 캠페인</p>
        </div>
        <Link
          href="/campaigns/new"
          className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800"
        >
          새 캠페인
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-600">표시할 캠페인이 없습니다.</p>
          <Link
            href="/campaigns/new"
            className="mt-4 inline-block text-sm font-medium text-black underline"
          >
            첫 캠페인을 만들어보세요
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {rows.map((r) => (
            <li
              key={r.id}
              className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold leading-6 text-gray-900 line-clamp-1">
                  {r.title}
                </h2>
                <span className={getStatusBadgeClass(r.status)}>{r.status}</span>
              </div>
              <p className="mb-6 text-sm leading-6 text-gray-600 line-clamp-2">{r.summary}</p>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex flex-wrap gap-1">
                  {(r.channels ?? []).map((ch, idx) => (
                    <span
                      key={`${r.id}-ch-${idx}`}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700 ring-1 ring-inset ring-gray-200"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
                <div className="tabular-nums text-gray-500">
                  {formatDate(r.start_date)} ~ {formatDate(r.end_date)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
