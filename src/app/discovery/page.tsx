"use client";
import { useState } from "react";

export default function DiscoveryPage() {
  const [platformSelected, setPlatformSelected] = useState({
    instagram: false,
    tiktok: false,
  });

  const instagramActive = platformSelected.instagram;
  const tiktokActive = platformSelected.tiktok;

  const baseBtn = "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs";
  const activeBtn = "bg-slate-900 text-white border-slate-900";
  const inactiveBtnPrimary = "bg-white text-slate-700";
  const inactiveBtnSecondary = "bg-white text-slate-600";

  const Icon = ({ src, active }: { src: string; active: boolean }) => {
    return (
      <span
        aria-hidden
        className={`inline-block size-3 ${active ? "bg-white" : "bg-slate-600"}`}
        style={{
          maskImage: `url(${src})`,
          WebkitMaskImage: `url(${src})`,
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
          maskSize: "contain",
          WebkitMaskSize: "contain",
        }}
      />
    );
  };

  return (
    <main className="min-h-screen bg-slate-50" role="main">
      <div className="mx-auto max-w-7xl p-6">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="space-y-6 rounded-2xl bg-white p-5 shadow-sm lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-24px)] lg:overflow-auto">
            <h2 className="text-sm font-semibold text-slate-700">Advanced Filters</h2>
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-500">Platforms</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-pressed={instagramActive}
                  onClick={() => setPlatformSelected((s) => ({ ...s, instagram: !s.instagram }))}
                  className={`${baseBtn} ${instagramActive ? activeBtn : `${inactiveBtnPrimary}`}`}
                >
                  <Icon src="/icons/instagram.svg" active={instagramActive} />
                  Instagram
                </button>
                <button
                  type="button"
                  aria-pressed={tiktokActive}
                  onClick={() => setPlatformSelected((s) => ({ ...s, tiktok: !s.tiktok }))}
                  className={`${baseBtn} ${tiktokActive ? activeBtn : `${inactiveBtnSecondary}`}`}
                >
                  <Icon src="/icons/tiktok.svg" active={tiktokActive} />
                  TikTok
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-500">Follower Range</p>
              <input aria-label="Follower range" type="range" className="w-full accent-black" />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-500">Engagement Rate</p>
              <input aria-label="Engagement rate" type="range" className="w-full accent-black" />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Content Categories</p>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4 rounded border-slate-300" />
                Fashion & Style
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4 rounded border-slate-300" />
                Beauty
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4 rounded border-slate-300" />
                Travel
              </label>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Audience Demographics</p>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4 rounded border-slate-300" />
                Age 18–24
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4 rounded border-slate-300" />
                Age 25–34
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4 rounded border-slate-300" />
                Age 35–44
              </label>
            </div>
          </aside>

          <section className="space-y-6" aria-label="Results">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for influencers by name, handle, or keywords…"
                      aria-label="Search influencers"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-300"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      🔍
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                  >
                    All Influencers
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700"
                  >
                    Micro (10K–50K)
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700"
                  >
                    Mid-tier (50K–500K)
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700"
                  >
                    Verified Only
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500">Showing 24 of 1,248 influencers</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Sort by:</span>
                  <select
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                    aria-label="Sort influencers"
                  >
                    <option>Relevance</option>
                    <option>Followers</option>
                    <option>Engagement</option>
                  </select>
                  <button
                    type="button"
                    aria-label="List view"
                    className="rounded-lg border border-slate-200 p-2 text-slate-500"
                  >
                    ☰
                  </button>
                  <button
                    type="button"
                    aria-label="Grid view"
                    className="rounded-lg border border-slate-200 p-2 text-slate-500"
                  >
                    ▦
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              <article className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                    SL
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-800">Sophia Lee</h3>
                      <span title="verified">✔️</span>
                    </div>
                    <p className="text-xs text-slate-500">@sophiastyle</p>
                    <div className="mt-1 flex gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700">
                        Fashion
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700">
                        Lifestyle
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Followers</p>
                    <p className="text-sm font-semibold text-slate-800">542K</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Engagement</p>
                    <p className="text-sm font-semibold text-slate-800">6.8%</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Avg. Likes</p>
                    <p className="text-sm font-semibold text-slate-800">38K</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="h-20 rounded-xl bg-slate-100"></div>
                  <div className="h-20 rounded-xl bg-slate-100"></div>
                  <div className="h-20 rounded-xl bg-slate-100"></div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
                  >
                    Add to Campaign
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                  >
                    View Profile
                  </button>
                </div>
              </article>

              <article className="rounded-2xl bg-white p-5 shadow-sm">…</article>
              <article className="rounded-2xl bg-white p-5 shadow-sm">…</article>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
