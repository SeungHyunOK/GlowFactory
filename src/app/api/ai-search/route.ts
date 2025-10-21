import { NextRequest, NextResponse } from "next/server";

// OpenAI API 설정 (다른 AI 서비스로 변경 가능)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// 대안 AI 서비스들
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

interface AIResponse {
  influencers: Record<string, unknown>[];
  reasoning: string;
  categories: string[];
  targetAudience: string;
}

// OpenAI API 호출
async function callOpenAI(query: string): Promise<AIResponse> {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `당신은 인플루언서 마케팅 전문가입니다. 사용자의 마케팅 목적에 맞는 인플루언서를 추천해주세요.

응답 형식:
{
  "influencers": [
    {
      "name": "인플루언서 이름",
      "categories": ["카테고리1", "카테고리2"],
      "followers": 숫자,
      "engagement_rate": 숫자,
      "reason": "추천 이유"
    }
  ],
  "reasoning": "전체적인 추천 근거",
  "categories": ["관련 카테고리들"],
  "targetAudience": "타겟 오디언스"
}

실제 존재하는 인플루언서를 추천하고, 구체적인 수치와 근거를 제공해주세요.`,
        },
        {
          role: "user",
          content: query,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API 오류: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch {
    // JSON 파싱 실패 시 기본 응답
    return {
      influencers: [],
      reasoning: "AI 응답을 파싱할 수 없습니다.",
      categories: [],
      targetAudience: "일반",
    };
  }
}

// Anthropic Claude API 호출 (대안)
async function callAnthropic(query: string): Promise<AIResponse> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY!,
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-sonnet-20240229",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `인플루언서 마케팅 전문가로서 다음 요청에 맞는 인플루언서를 추천해주세요: ${query}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API 오류: ${response.status}`);
  }

  const data = await response.json();
  // Claude 응답을 파싱하여 구조화된 데이터로 변환
  return {
    influencers: [],
    reasoning: data.content[0].text,
    categories: [],
    targetAudience: "일반",
  };
}

// 사용 가능한 모델 목록 확인 (현재 사용하지 않음)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GOOGLE_AI_API_KEY}`,
    );

    if (!response.ok) {
      console.log("모델 목록 조회 실패, 기본 모델 사용");
      return ["gemini-1.5-flash"];
    }

    const data = await response.json();
    const models = data.models?.map((model: Record<string, unknown>) => model.name) || [];
    console.log("사용 가능한 모델들:", models);
    return models;
  } catch {
    console.log("모델 목록 조회 오류");
    return ["gemini-1.5-flash"];
  }
}

// Google AI API 호출 (대안)
async function callGoogleAI(query: string): Promise<AIResponse> {
  const maxRetries = 3;
  const retryDelay = 2000; // 2초

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // generateContent를 지원하는 모델명 사용
      const modelName = "gemini-2.0-flash";
      console.log(`사용할 모델: ${modelName} (시도 ${attempt}/${maxRetries})`);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GOOGLE_AI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `당신은 인플루언서 마케팅 전문가입니다. 다음 요청에 맞는 인플루언서를 추천해주세요: "${query}"

응답 형식:
{
  "influencers": [
    {
      "name": "인플루언서 이름",
      "categories": ["카테고리1", "카테고리2"],
      "followers": 숫자,
      "engagement_rate": 숫자,
      "reason": "추천 이유"
    }
  ],
  "reasoning": "전체적인 추천 근거",
  "categories": ["관련 카테고리들"],
  "targetAudience": "타겟 오디언스"
}

실제 존재하는 인플루언서를 추천하고, 구체적인 수치와 근거를 제공해주세요.`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
              topP: 0.8,
              topK: 40,
            },
          }),
        },
      );

      if (!response.ok) {
        let errorMessage = `Google AI API 오류: ${response.status}`;
        try {
          const errorData = await response.json();
          console.error("Google AI API 오류 상세:", errorData);
          errorMessage += ` - ${errorData.error?.message || "알 수 없는 오류"}`;

          // 503 오류 (서버 과부하)인 경우 재시도
          if (response.status === 503 && attempt < maxRetries) {
            console.log(`${retryDelay}ms 후 재시도... (${attempt + 1}/${maxRetries})`);
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            continue;
          }
        } catch (jsonError) {
          console.error("JSON 파싱 오류:", jsonError);
          errorMessage += " - JSON 파싱 실패";
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Google AI API 응답 JSON 파싱 오류:", jsonError);
        throw new Error("Google AI API 응답을 파싱할 수 없습니다.");
      }

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error("Google AI API 응답 구조:", data);
        throw new Error("Google AI API 응답 형식 오류");
      }

      const content = data.candidates[0].content.parts[0].text;

      try {
        // JSON 파싱 시도
        const parsedResponse = JSON.parse(content);
        return parsedResponse;
      } catch {
        // JSON 파싱 실패 시 마크다운에서 JSON 추출
        console.log("JSON 파싱 실패, 마크다운에서 JSON 추출 시도");

        // 마크다운 코드 블록에서 JSON 추출
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          try {
            const extractedJson = JSON.parse(jsonMatch[1]);
            console.log("마크다운에서 JSON 추출 성공");
            return extractedJson;
          } catch (extractError) {
            console.log("마크다운 JSON 추출 실패:", extractError);
          }
        }

        // 마크다운에서 인플루언서 정보 추출
        const extractedInfluencers = extractInfluencersFromMarkdown(content);
        console.log(`마크다운에서 ${extractedInfluencers.length}명의 인플루언서 추출`);

        return {
          influencers: extractedInfluencers,
          reasoning: content,
          categories: extractCategoriesFromText(content),
          targetAudience: "일반",
        };
      }
    } catch (error) {
      console.error(`Google AI API 호출 오류 (시도 ${attempt}/${maxRetries}):`, error);

      // 마지막 시도가 아니고 503 오류인 경우 재시도
      if (attempt < maxRetries && error instanceof Error && error.message.includes("503")) {
        console.log(`${retryDelay}ms 후 재시도... (${attempt + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        continue;
      }

      throw error; // 오류를 그대로 전파
    }
  }

  throw new Error("Google AI API 최대 재시도 횟수 초과");
}

// 마크다운에서 인플루언서 정보 추출
function extractInfluencersFromMarkdown(content: string): Record<string, unknown>[] {
  const influencers = [];

  // JSON 블록에서 인플루언서 정보 추출
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      const jsonContent = jsonMatch[1];
      const parsed = JSON.parse(jsonContent);
      if (parsed.influencers && Array.isArray(parsed.influencers)) {
        return parsed.influencers;
      }
    } catch (error) {
      console.log("JSON 블록 파싱 실패:", error);
    }
  }

  // 마크다운 텍스트에서 인플루언서 정보 추출
  const lines = content.split("\n");
  let currentInfluencer: Record<string, unknown> | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // 인플루언서 이름 패턴 (예: "name": "김성회 (G식백과)")
    const nameMatch = trimmedLine.match(/"name":\s*"([^"]+)"/);
    if (nameMatch) {
      if (currentInfluencer) {
        influencers.push(currentInfluencer);
      }
      currentInfluencer = {
        name: nameMatch[1],
        categories: [],
        followers: 1000000,
        engagement_rate: 3.0,
        reason: "",
      };
      continue;
    }

    // 카테고리 패턴
    const categoryMatch = trimmedLine.match(/"categories":\s*\[([^\]]+)\]/);
    if (categoryMatch && currentInfluencer) {
      const categoriesStr = categoryMatch[1];
      currentInfluencer.categories = categoriesStr
        .split(",")
        .map((cat) => cat.trim().replace(/"/g, ""))
        .filter((cat) => cat.length > 0);
    }

    // 팔로워 수 패턴
    const followersMatch = trimmedLine.match(/"followers":\s*(\d+)/);
    if (followersMatch && currentInfluencer) {
      currentInfluencer.followers = parseInt(followersMatch[1]);
    }

    // 참여율 패턴
    const engagementMatch = trimmedLine.match(/"engagement_rate":\s*([\d.]+)/);
    if (engagementMatch && currentInfluencer) {
      currentInfluencer.engagement_rate = parseFloat(engagementMatch[1]);
    }

    // 추천 이유 패턴
    const reasonMatch = trimmedLine.match(/"reason":\s*"([^"]+)"/);
    if (reasonMatch && currentInfluencer) {
      currentInfluencer.reason = reasonMatch[1];
    }
  }

  // 마지막 인플루언서 추가
  if (currentInfluencer) {
    influencers.push(currentInfluencer);
  }

  return influencers;
}

// 텍스트에서 카테고리 추출
function extractCategoriesFromText(text: string): string[] {
  const categories = [];
  const commonCategories = [
    "Beauty",
    "Tech",
    "Gaming",
    "Lifestyle",
    "Food",
    "Fashion",
    "Travel",
    "Fitness",
  ];

  for (const category of commonCategories) {
    if (text.toLowerCase().includes(category.toLowerCase())) {
      categories.push(category);
    }
  }

  return categories.length > 0 ? categories : ["Lifestyle"];
}

// YouTube Data API v3를 통한 채널 검색
async function searchYouTubeChannel(channelName: string) {
  try {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

    if (!GOOGLE_API_KEY) {
      console.log("YouTube API 키가 없습니다.");
      return null;
    }

    // 1. 채널명으로 검색
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(channelName)}&type=channel&key=${GOOGLE_API_KEY}&maxResults=1`,
    );

    if (!searchResponse.ok) {
      console.error("YouTube 검색 API 오류:", searchResponse.status);
      return null;
    }

    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      console.log(`채널을 찾을 수 없습니다: ${channelName}`);
      return null;
    }

    const channelId = searchData.items[0].id.channelId;
    // const channelSnippet = searchData.items[0].snippet; // 현재 사용하지 않음

    // 2. 채널 상세 정보 가져오기
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${GOOGLE_API_KEY}`,
    );

    if (!channelResponse.ok) {
      console.error("YouTube 채널 API 오류:", channelResponse.status);
      return null;
    }

    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      return null;
    }

    const channel = channelData.items[0];
    const statistics = channel.statistics;
    const snippet = channel.snippet;

    // 3. 최근 비디오 정보로 참여율 계산
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&key=${GOOGLE_API_KEY}&maxResults=5`,
    );

    let avgLikes = 0;
    if (videosResponse.ok) {
      const videosData = await videosResponse.json();
      if (videosData.items && videosData.items.length > 0) {
        // 비디오 ID들로 상세 정보 가져오기
        const videoIds = videosData.items
          .map((item: Record<string, unknown>) => (item.id as Record<string, unknown>)?.videoId)
          .join(",");
        const videoDetailsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${GOOGLE_API_KEY}`,
        );

        if (videoDetailsResponse.ok) {
          const videoDetails = await videoDetailsResponse.json();
          if (videoDetails.items) {
            const totalLikes = videoDetails.items.reduce(
              (sum: number, video: Record<string, unknown>) => {
                return (
                  sum +
                  parseInt(
                    ((video.statistics as Record<string, unknown>)?.likeCount as string) || "0",
                  )
                );
              },
              0,
            );
            avgLikes = Math.floor(totalLikes / videoDetails.items.length);
          }
        }
      }
    }

    // 4. YouTube API에서 받은 실제 데이터 그대로 사용
    const subscriberCount = parseInt(statistics.subscriberCount || 0);
    const viewCount = parseInt(statistics.viewCount || 0);
    const videoCount = parseInt(statistics.videoCount || 0);

    return {
      name: snippet.title,
      handle: snippet.customUrl || snippet.title.toLowerCase().replace(/\s+/g, ""),
      followers: subscriberCount,
      engagement_rate: 3.0, // 기본값 (실제 참여율은 복잡한 계산 필요)
      avg_likes: avgLikes || 0, // 실제 계산된 평균 좋아요 수
      verified: snippet.verified || false,
      profile_image_url: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
      bio: snippet.description || "",
      total_views: viewCount, // 총 조회수
      video_count: videoCount, // 비디오 수
    };
  } catch (error) {
    console.error(`YouTube API 검색 오류 (${channelName}):`, error);
    return null;
  }
}

// 실제 인플루언서 데이터와 매칭
async function matchWithRealInfluencers(aiResponse: AIResponse, query: string) {
  try {
    // Supabase에서 실제 인플루언서 데이터 가져오기
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase 설정이 없습니다. 환경변수를 확인해주세요.");
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // AI가 추천한 카테고리와 매칭되는 인플루언서 검색
    let searchQuery = supabase.from("influencers").select("*").eq("platform", "youtube");

    // AI 추천 카테고리가 있으면 필터링
    if (aiResponse.categories && aiResponse.categories.length > 0) {
      searchQuery = searchQuery.overlaps("categories", aiResponse.categories);
    }

    // 쿼리에서 키워드 추출하여 이름/핸들 검색
    const keywords = extractKeywords(query);
    if (keywords.length > 0) {
      const orConditions = keywords
        .map(
          (keyword) => `name.ilike.%${keyword}%,handle.ilike.%${keyword}%,bio.ilike.%${keyword}%`,
        )
        .join(",");
      searchQuery = searchQuery.or(orConditions);
    }

    const { data: influencers, error } = await searchQuery
      .order("followers", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Supabase 쿼리 오류:", error);
      throw new Error(`Supabase 쿼리 오류: ${error.message}`);
    }

    if (!influencers || influencers.length === 0) {
      console.log("매칭되는 인플루언서가 없어 YouTube API로 실제 데이터를 수집합니다.");

      // AI가 추천한 인플루언서들을 YouTube API로 검색하여 실제 데이터 수집
      const enrichedInfluencers = await Promise.all(
        aiResponse.influencers.map(async (inf) => {
          try {
            // YouTube API로 채널 정보 검색
            const youtubeData = await searchYouTubeChannel(inf.name as string);

            if (youtubeData) {
              return {
                name: youtubeData.name,
                handle: youtubeData.handle,
                platform: "youtube" as const,
                followers: youtubeData.followers,
                engagement_rate: youtubeData.engagement_rate,
                avg_likes: youtubeData.avg_likes,
                categories: inf.categories || ["Lifestyle"],
                verified: youtubeData.verified,
                profile_image_url: youtubeData.profile_image_url,
                bio: youtubeData.bio || inf.reason || "AI 추천 인플루언서",
                total_views: youtubeData.total_views || 0,
                video_count: youtubeData.video_count || 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
            } else {
              // YouTube API 검색 실패 시 AI 추천 데이터 사용
              return {
                name: inf.name as string,
                handle: (inf.name as string).toLowerCase().replace(/\s+/g, ""),
                platform: "youtube" as const,
                followers:
                  typeof inf.followers === "number"
                    ? inf.followers
                    : parseInt((inf.followers as string).toString().replace(/[^\d]/g, "")) ||
                      1000000,
                engagement_rate:
                  typeof inf.engagement_rate === "number"
                    ? inf.engagement_rate
                    : parseFloat((inf.engagement_rate as string).toString()) || 3.0,
                avg_likes: Math.floor(
                  (typeof inf.followers === "number"
                    ? inf.followers
                    : parseInt((inf.followers as string).toString().replace(/[^\d]/g, "")) ||
                      1000000) * 0.05,
                ),
                categories: inf.categories || ["Lifestyle"],
                verified: true,
                profile_image_url: null,
                bio: inf.reason || "AI 추천 인플루언서",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
            }
          } catch (error) {
            console.error(`YouTube API 검색 실패 (${inf.name}):`, error);
            // 오류 발생 시 AI 추천 데이터 사용
            return {
              name: inf.name as string,
              handle: (inf.name as string).toLowerCase().replace(/\s+/g, ""),
              platform: "youtube" as const,
              followers:
                typeof inf.followers === "number"
                  ? inf.followers
                  : parseInt((inf.followers as string).toString().replace(/[^\d]/g, "")) || 1000000,
              engagement_rate:
                typeof inf.engagement_rate === "number"
                  ? inf.engagement_rate
                  : parseFloat((inf.engagement_rate as string).toString()) || 3.0,
              avg_likes: Math.floor(
                (typeof inf.followers === "number"
                  ? inf.followers
                  : parseInt((inf.followers as string).toString().replace(/[^\d]/g, "")) ||
                    1000000) * 0.05,
              ),
              categories: inf.categories || ["Lifestyle"],
              verified: true,
              profile_image_url: null,
              bio: inf.reason || "AI 추천 인플루언서",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          }
        }),
      );

      // DB에 실제 YouTube 데이터 추가
      try {
        const { data: insertedInfluencers, error: insertError } = await supabase
          .from("influencers")
          .insert(enrichedInfluencers)
          .select();

        if (insertError) {
          console.error("YouTube 데이터 DB 추가 오류:", insertError);
          // DB 추가 실패 시에도 AI 추천 결과 반환
          return enrichedInfluencers.map((inf, index) => ({
            id: `ai-${index + 1}`,
            ...inf,
            aiScore: Math.round((85 + Math.random() * 15) * 10) / 10, // 85.0-100.0점 사이
          }));
        }

        console.log(
          `YouTube API로 수집한 인플루언서 ${insertedInfluencers.length}명을 DB에 추가했습니다.`,
        );

        // 추가된 인플루언서들에 AI 점수 추가하여 반환
        return insertedInfluencers.map((inf) => ({
          ...inf,
          aiScore: Math.round((85 + Math.random() * 15) * 10) / 10, // 85.0-100.0점 사이 (소수점 첫째 자리)
        }));
      } catch (error) {
        console.error("YouTube 데이터 처리 오류:", error);
        // 오류 발생 시에도 AI 추천 결과 반환
        return enrichedInfluencers.map((inf, index) => ({
          id: `ai-${index + 1}`,
          ...inf,
          aiScore: Math.round((85 + Math.random() * 15) * 10) / 10, // 85.0-100.0점 사이
        }));
      }
    }

    // AI 추천 점수 계산 및 정렬
    const scoredInfluencers = influencers
      .map((influencer) => ({
        ...influencer,
        aiScore: calculateAIScore(influencer, aiResponse),
      }))
      .sort((a, b) => b.aiScore - a.aiScore);

    return scoredInfluencers.slice(0, 8); // 상위 8명 반환
  } catch (error) {
    console.error("인플루언서 매칭 오류:", error);
    throw error; // 오류를 그대로 전파
  }
}

// 키워드 추출 함수
function extractKeywords(query: string): string[] {
  const keywords = query
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, " ")
    .split(" ")
    .filter((word) => word.length > 2)
    .slice(0, 5); // 최대 5개 키워드

  return keywords;
}

// AI 추천 점수 계산
function calculateAIScore(influencer: Record<string, unknown>, aiResponse: AIResponse): number {
  let score = 0;

  // 카테고리 매칭 점수 (40점 만점)
  if (aiResponse.categories && influencer.categories) {
    const matchingCategories = aiResponse.categories.filter((cat) =>
      (influencer.categories as string[]).some((infCat: string) =>
        infCat.toLowerCase().includes(cat.toLowerCase()),
      ),
    );
    score += (matchingCategories.length / aiResponse.categories.length) * 40;
  }

  // 참여율 점수 (30점 만점)
  const engagementScore = Math.min((influencer.engagement_rate as number) / 10, 1) * 30;
  score += engagementScore;

  // 팔로워 수 점수 (20점 만점)
  const followerScore = Math.min((influencer.followers as number) / 1000000, 1) * 20;
  score += followerScore;

  // 인증 상태 점수 (10점 만점)
  if (influencer.verified) {
    score += 10;
  }

  return Math.round(score);
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "검색 쿼리가 필요합니다." }, { status: 400 });
    }

    console.log("AI 검색 요청:", query);

    // 사용 가능한 AI 서비스 선택 (Google AI 우선, 실패 시 대안 사용)
    let aiResponse: AIResponse;

    if (GOOGLE_AI_API_KEY) {
      try {
        console.log("Google AI API 사용 (무료)");
        aiResponse = await callGoogleAI(query);
      } catch (error) {
        console.error("Google AI 실패, 대안 AI 서비스 시도:", error);

        // Google AI 실패 시 다른 AI 서비스 시도
        if (ANTHROPIC_API_KEY) {
          try {
            console.log("Anthropic Claude API 사용 (대안)");
            aiResponse = await callAnthropic(query);
          } catch (anthropicError) {
            console.error("Anthropic 실패, OpenAI 시도:", anthropicError);

            if (OPENAI_API_KEY) {
              try {
                console.log("OpenAI API 사용 (대안)");
                aiResponse = await callOpenAI(query);
              } catch (openaiError) {
                console.error("모든 AI 서비스 실패:", openaiError);
                return NextResponse.json(
                  {
                    error:
                      "모든 AI 서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.",
                  },
                  { status: 503 },
                );
              }
            } else {
              return NextResponse.json(
                { error: "AI 서비스가 일시적으로 사용할 수 없습니다." },
                { status: 503 },
              );
            }
          }
        } else if (OPENAI_API_KEY) {
          try {
            console.log("OpenAI API 사용 (대안)");
            aiResponse = await callOpenAI(query);
          } catch (openaiError) {
            console.error("OpenAI 실패:", openaiError);
            return NextResponse.json(
              { error: "AI 서비스가 일시적으로 사용할 수 없습니다." },
              { status: 503 },
            );
          }
        } else {
          return NextResponse.json(
            { error: "AI 서비스가 일시적으로 사용할 수 없습니다." },
            { status: 503 },
          );
        }
      }
    } else if (ANTHROPIC_API_KEY) {
      console.log("Anthropic Claude API 사용");
      aiResponse = await callAnthropic(query);
    } else if (OPENAI_API_KEY) {
      console.log("OpenAI API 사용");
      aiResponse = await callOpenAI(query);
    } else {
      // AI API 키가 없는 경우 직접 데이터 매칭
      console.log("AI 서비스 우회, 직접 데이터 매칭");
      aiResponse = {
        influencers: [],
        reasoning: `"${query}"에 맞는 인플루언서를 검색합니다.`,
        categories: extractCategoriesFromText(query),
        targetAudience: "일반",
      };
    }

    // 실제 인플루언서 데이터와 매칭
    const matchedInfluencers = await matchWithRealInfluencers(aiResponse, query);

    return NextResponse.json({
      success: true,
      influencers: matchedInfluencers,
      aiResponse: {
        reasoning: aiResponse.reasoning,
        categories: aiResponse.categories,
        targetAudience: aiResponse.targetAudience,
      },
      query: query,
    });
  } catch (error) {
    console.error("AI 검색 오류:", error);

    return NextResponse.json(
      {
        error: "AI 검색 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 },
    );
  }
}
