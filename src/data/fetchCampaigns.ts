// 캠페인 목록 조회 (API)
export async function fetchCampaigns() {
  const res = await fetch("/api/campaigns", { cache: "no-store" });
  if (!res.ok) throw new Error("캠페인 조회 실패");
  return (await res.json()) as unknown;
}

// 캠페인 생성 (API)
export async function createCampaign(input: {
  title: string;
  summary?: string;
  channels?: string[];
  start_date?: string; // 'YYYY-MM-DD'
  end_date?: string;
  status?: "draft" | "published" | "closed";
}) {
  const res = await fetch("/api/campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("캠페인 생성 실패");
  return (await res.json()) as unknown;
}

export async function updateCampaignStatus(id: string, status: "draft" | "published" | "closed") {
  const res = await fetch(`/api/campaigns/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("캠페인 상태 변경 실패");
  return (await res.json()) as unknown;
}

export async function updateCampaignPatch(id: string, patch: Record<string, unknown>) {
  const res = await fetch(`/api/campaigns/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { message: text };
  }
  function hasMessage(obj: unknown): obj is { message: string } {
    if (typeof obj !== "object" || obj === null) return false;
    const r = obj as Record<string, unknown>;
    return typeof r.message === "string";
  }
  if (!res.ok) {
    const msg = hasMessage(json) ? json.message : "캠페인 수정 실패";
    throw new Error(String(msg));
  }
  return json as unknown;
}

export async function deleteCampaign(id: string, profileId?: string) {
  const query = profileId ? `?profile_id=${encodeURIComponent(profileId)}` : "";
  const res = await fetch(`/api/campaigns/${id}${query}`, { method: "DELETE" });
  if (!res.ok) throw new Error("캠페인 삭제 실패");
  return true;
}

// 단건 조회 (API)
export async function fetchCampaignById(id: string) {
  const res = await fetch(`/api/campaigns/${id}?raw=1`, { cache: "no-store" });
  if (!res.ok) throw new Error("캠페인 상세 조회 실패");
  return (await res.json()) as unknown;
}
