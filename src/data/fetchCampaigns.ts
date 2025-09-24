import { supabase } from "@/lib/supabaseClient";

// 캠페인 목록 조회
export async function fetchCampaigns() {
  const { data, error } = await supabase
    .from("campaigns")
    .select("id, title, summary, channels, start_date, end_date, status, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data;
}

//캠페인 생성
export async function createCampaign(input: {
  title: string;
  summary?: string;
  channels?: string[];
  start_date?: string; // 'YYYY-MM-DD'
  end_date?: string;
  status?: "draft" | "published" | "closed";
}) {
  const { data, error } = await supabase
    .from("campaigns")
    .insert([
      {
        title: input.title,
        summary: input.summary ?? null,
        channels: input.channels ?? ["instagram"],
        start_date: input.start_date ?? null,
        end_date: input.end_date ?? null,
        status: input.status ?? "draft",
      },
    ])
    .select(); // 생성된 행 반환

  if (error) throw error;
  return data?.[0];
}

export async function updateCampaignStatus(id: string, status: "draft" | "published" | "closed") {
  const { data, error } = await supabase
    .from("campaigns")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select();

  if (error) throw error;
  return data?.[0];
}

export async function deleteCampaign(id: string) {
  const { error } = await supabase.from("campaigns").delete().eq("id", id);

  if (error) throw error;
  return true;
}
