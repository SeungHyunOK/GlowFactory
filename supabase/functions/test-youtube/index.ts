import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const apiKey = Deno.env.get("GOOGLE_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "GOOGLE_API_KEY 환경 변수가 설정되지 않았습니다.",
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    // YouTube API 테스트
    const testUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=beauty%20influencer&type=channel&maxResults=1&key=${apiKey}`;

    console.log("YouTube API 테스트 시작...");
    console.log("API 키 길이:", apiKey.length);

    const response = await fetch(testUrl);
    const data = await response.json();

    console.log("YouTube API 응답:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "YouTube API 호출 실패",
          details: data,
          status: response.status,
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "YouTube API 테스트 성공",
        data: data,
        itemsCount: data.items?.length || 0,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("YouTube API 테스트 오류:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
