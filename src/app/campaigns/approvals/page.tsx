type ProposalStatus = "pending" | "approved" | "rejected";

export default function CampaignApprovalsPage() {
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
