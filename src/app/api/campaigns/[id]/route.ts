import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { status } = (await request.json()) as { status?: "draft" | "published" | "closed" };
    if (!status) {
      return NextResponse.json({ message: "status는 필수입니다." }, { status: 400 });
    }
    const { data, error } = await supabaseServer
      .from("campaigns")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", params.id)
      .select();

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json(data?.[0] ?? null);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Invalid JSON";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const { error } = await supabaseServer.from("campaigns").delete().eq("id", params.id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}


