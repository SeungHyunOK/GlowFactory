import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    // 환경 변수 확인
    const googleApiKey = Deno.env.get("GOOGLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    return new Response(
      JSON.stringify({
        success: true,
        message: "환경 변수 확인",
        env: {
          hasGoogleApiKey: !!googleApiKey,
          hasSupabaseUrl: !!supabaseUrl,
          hasSupabaseServiceKey: !!supabaseServiceKey,
          googleApiKeyLength: googleApiKey?.length || 0,
          supabaseUrl: supabaseUrl || "NOT_SET",
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});

