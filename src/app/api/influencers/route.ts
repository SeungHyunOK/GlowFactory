import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-browser";

export async function GET() {
  try {
    // 직접 influencers 테이블에 접근해서 존재 여부 확인 (recent_videos 포함)
    const { data, error } = await supabase
      .from("influencers")
      .select("*, recent_videos")
      .order("followers", { ascending: false });

    if (error) {
      // recent_videos 컬럼이 없는 경우
      if (error.message.includes("recent_videos") || error.message.includes("column")) {
        return NextResponse.json({
          influencers: [],
          message: "recent_videos 컬럼이 존재하지 않습니다.",
          instructions: [
            "1. Supabase 대시보드 → SQL Editor로 이동",
            "2. add_recent_videos_column.sql 파일의 SQL을 실행",
            "3. 새로고침 버튼을 클릭하세요",
          ],
          error: "Column 'recent_videos' does not exist",
          helpFile: "add_recent_videos_column.sql",
        });
      }

      // 테이블이 존재하지 않는 경우
      if (
        error.message.includes("does not exist") ||
        error.message.includes("relation") ||
        error.message.includes("schema cache")
      ) {
        return NextResponse.json({
          influencers: [],
          message: "influencers 테이블이 존재하지 않습니다.",
          instructions: [
            "1. Supabase 대시보드 → SQL Editor로 이동",
            "2. QUICK_SETUP.md 파일을 참고하여 단계별로 SQL 실행",
            "3. 또는 create_influencers_table.sql 파일의 모든 SQL을 복사해서 실행",
            "4. 새로고침 버튼을 클릭하세요",
          ],
          error: "Table 'influencers' does not exist",
          helpFile: "QUICK_SETUP.md",
        });
      }

      return NextResponse.json({
        influencers: [],
        message: "데이터 조회 중 오류가 발생했습니다.",
        error: error.message,
        instructions: [
          "1. create_influencers_table.sql 파일을 열어보세요",
          "2. Supabase 대시보드 → SQL Editor로 이동",
          "3. 파일의 모든 SQL을 복사해서 실행",
          "4. 새로고침 버튼을 클릭하세요",
        ],
      });
    }

    return NextResponse.json({
      influencers: data || [],
      message:
        data && data.length > 0
          ? `${data.length}개의 인플루언서를 찾았습니다.`
          : "인플루언서 데이터가 없습니다.",
    });
  } catch (error) {
    console.error("인플루언서 조회 오류:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        instructions: [
          "1. create_influencers_table.sql 파일을 열어보세요",
          "2. Supabase 대시보드 → SQL Editor로 이동",
          "3. 파일의 모든 SQL을 복사해서 실행",
          "4. 새로고침 버튼을 클릭하세요",
        ],
      },
      { status: 500 },
    );
  }
}

// POST: Edge Function을 통해 YouTube 데이터 동기화
export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");
    }

    // Edge Function 호출
    const response = await fetch(`${supabaseUrl}/functions/v1/sync-youtube-data`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Edge Function 실행 중 오류가 발생했습니다.");
    }

    return NextResponse.json({
      message: "YouTube 데이터 동기화가 완료되었습니다.",
      success: result.success,
      count: result.count,
      channels: result.channels,
    });
  } catch (error) {
    console.error("YouTube 데이터 동기화 오류:", error);

    // 구체적인 오류 메시지 제공
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

    return NextResponse.json(
      {
        error: errorMessage,
        message: "Edge Function이 설정되지 않았습니다. EDGE_FUNCTION_SETUP.md 파일을 참고하세요.",
        fallback: "로컬 데이터 동기화를 시도합니다...",
      },
      { status: 500 },
    );
  }
}
