import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("campaigns")
    .select(
      "id, title, summary, channels, start_date, end_date, status, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = {
      title: String(body?.title ?? "").trim(),
      summary: body?.summary ?? null,
      channels: Array.isArray(body?.channels) ? body.channels : ["instagram"],
      start_date: body?.start_date ?? null,
      end_date: body?.end_date ?? null,
      status: body?.status ?? "draft",
    } as {
      title: string;
      summary: string | null;
      channels: string[];
      start_date: string | null;
      end_date: string | null;
      status: "draft" | "published" | "closed";
    };

    if (!input.title) {
      return NextResponse.json({ message: "title은 필수입니다." }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("campaigns")
      .insert([
        {
          title: input.title,
          summary: input.summary,
          channels: input.channels,
          start_date: input.start_date,
          end_date: input.end_date,
          status: input.status,
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.[0] ?? null, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Invalid JSON";
    return NextResponse.json({ message }, { status: 400 });
  }
}


