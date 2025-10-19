import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// YouTube Data API v3 클라이언트 생성
function createYouTubeClient() {
  const apiKey = Deno.env.get("GOOGLE_API_KEY");

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY 환경 변수가 설정되지 않았습니다.");
  }

  return {
    async get(url: string) {
      const response = await fetch(url);
      return { data: await response.json() };
    },
    async post(url: string, body: any) {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return { data: await response.json() };
    },
  };
}

// YouTube 채널 정보를 가져오는 함수
async function getYouTubeChannelInfo(channelId: string) {
  const apiKey = Deno.env.get("GOOGLE_API_KEY");
  const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error(`채널을 찾을 수 없습니다: ${channelId}`);
  }

  const channel = data.items[0];
  const snippet = channel.snippet;
  const statistics = channel.statistics;

  return {
    id: channel.id,
    title: snippet?.title || "",
    description: snippet?.description || "",
    customUrl: snippet?.customUrl || "",
    publishedAt: snippet?.publishedAt || "",
    thumbnails: snippet?.thumbnails || {},
    subscriberCount: parseInt(statistics?.subscriberCount || "0"),
    videoCount: parseInt(statistics?.videoCount || "0"),
    viewCount: parseInt(statistics?.viewCount || "0"),
  };
}

// YouTube 채널의 최근 비디오들을 가져오는 함수 (정확성 개선)
async function getYouTubeChannelVideos(channelId: string, maxResults: number = 5) {
  const apiKey = Deno.env.get("GOOGLE_API_KEY");

  // 채널의 업로드 플레이리스트 ID 가져오기
  const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
  const channelResponse = await fetch(channelUrl);
  const channelData = await channelResponse.json();

  if (!channelData.items || channelData.items.length === 0) {
    throw new Error(`채널을 찾을 수 없습니다: ${channelId}`);
  }

  const uploadsPlaylistId = channelData.items[0].contentDetails?.relatedPlaylists?.uploads;

  if (!uploadsPlaylistId) {
    throw new Error("업로드 플레이리스트를 찾을 수 없습니다.");
  }

  // 플레이리스트의 비디오들 가져오기 (더 많은 결과를 가져와서 필터링)
  const videosUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults * 3}&key=${apiKey}`;
  const videosResponse = await fetch(videosUrl);
  const videosData = await videosResponse.json();

  if (!videosData.items) {
    return [];
  }

  // 각 비디오의 상세 정보 가져오기
  const videoIds = videosData.items
    .map((item: any) => item.snippet?.resourceId?.videoId)
    .filter(Boolean);

  if (videoIds.length === 0) {
    return [];
  }

  const videosDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(",")}&key=${apiKey}`;
  const videosDetailsResponse = await fetch(videosDetailsUrl);
  const videosDetailsData = await videosDetailsResponse.json();

  if (!videosDetailsData.items) {
    return [];
  }

  // 영상 필터링 및 정확성 검증
  const filteredVideos = videosDetailsData.items
    .filter((video: any) => {
      // 1. 채널 ID가 일치하는지 확인 (채널 소유자 영상만)
      const videoChannelId = video.snippet?.channelId;
      if (videoChannelId !== channelId) {
        console.log(`영상 ${video.id}는 다른 채널(${videoChannelId})의 영상입니다. 제외합니다.`);
        return false;
      }

      // 2. 영상이 공개되어 있는지 확인
      const privacyStatus = video.snippet?.privacyStatus;
      if (privacyStatus !== "public") {
        console.log(`영상 ${video.id}는 비공개 영상입니다. 제외합니다.`);
        return false;
      }

      // 3. 영상이 너무 오래된 것은 제외 (최근 1년 이내)
      const publishedAt = new Date(video.snippet?.publishedAt);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      if (publishedAt < oneYearAgo) {
        console.log(`영상 ${video.id}는 너무 오래된 영상입니다. 제외합니다.`);
        return false;
      }

      // 4. 영상 제목이 유효한지 확인 (너무 짧거나 의미없는 제목 제외)
      const title = video.snippet?.title;
      if (
        !title ||
        title.length < 3 ||
        title.includes("Deleted video") ||
        title.includes("Private video")
      ) {
        console.log(`영상 ${video.id}는 유효하지 않은 제목입니다. 제외합니다.`);
        return false;
      }

      return true;
    })
    .slice(0, maxResults) // 최종적으로 요청된 개수만큼만 반환
    .map((video: any) => ({
      id: video.id,
      title: video.snippet?.title,
      description: video.snippet?.description,
      publishedAt: video.snippet?.publishedAt,
      thumbnails: video.snippet?.thumbnails,
      viewCount: parseInt(video.statistics?.viewCount || "0"),
      likeCount: parseInt(video.statistics?.likeCount || "0"),
      commentCount: parseInt(video.statistics?.commentCount || "0"),
      channelId: video.snippet?.channelId, // 채널 ID 추가로 검증
    }));

  console.log(`채널 ${channelId}: ${filteredVideos.length}개의 유효한 영상을 찾았습니다.`);
  return filteredVideos;
}

// YouTube 채널을 검색하는 함수
async function searchYouTubeChannels(query: string, maxResults: number = 10) {
  const apiKey = Deno.env.get("GOOGLE_API_KEY");
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=channel&maxResults=${maxResults}&key=${apiKey}`;

  const searchResponse = await fetch(searchUrl);
  const searchData = await searchResponse.json();

  if (!searchData.items) {
    return [];
  }

  // 각 채널의 상세 정보 가져오기
  const channelIds = searchData.items.map((item: any) => item.snippet?.channelId).filter(Boolean);

  if (channelIds.length === 0) {
    return [];
  }

  const channelsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelIds.join(",")}&key=${apiKey}`;
  const channelsResponse = await fetch(channelsUrl);
  const channelsData = await channelsResponse.json();

  return (
    channelsData.items?.map((channel: any) => ({
      id: channel.id,
      title: channel.snippet?.title || "",
      description: channel.snippet?.description || "",
      customUrl: channel.snippet?.customUrl || "",
      publishedAt: channel.snippet?.publishedAt || "",
      thumbnails: channel.snippet?.thumbnails || {},
      subscriberCount: parseInt(channel.statistics?.subscriberCount || "0"),
      videoCount: parseInt(channel.statistics?.videoCount || "0"),
      viewCount: parseInt(channel.statistics?.viewCount || "0"),
    })) || []
  );
}

// YouTube 데이터를 인플루언서 데이터 형식으로 변환
function convertYouTubeToInfluencerData(channelData: any, videosData: any[] = []) {
  // 평균 조회수 계산
  const avgViews =
    videosData.length > 0
      ? Math.round(
          videosData.reduce((sum, video) => sum + (video.viewCount || 0), 0) / videosData.length,
        )
      : 0;

  // 평균 좋아요 수 계산
  const avgLikes =
    videosData.length > 0
      ? Math.round(
          videosData.reduce((sum, video) => sum + (video.likeCount || 0), 0) / videosData.length,
        )
      : 0;

  // 참여율 계산 (평균 좋아요 수 / 평균 조회 수 * 100)
  const engagementRate = avgViews > 0 ? (avgLikes / avgViews) * 100 : 0;

  return {
    name: channelData.title,
    handle: channelData.customUrl || channelData.id,
    platform: "youtube",
    followers: channelData.subscriberCount,
    engagement_rate: Math.round(engagementRate * 100) / 100,
    avg_likes: avgLikes,
    categories: ["YouTube", "Content Creator"],
    verified: false,
    profile_image_url: channelData.thumbnails?.high?.url || channelData.thumbnails?.default?.url,
    bio: channelData.description,
    location: "",
  };
}

// 무작위 인플루언서 데이터를 수집하는 함수
async function getRandomInfluencers() {
  // 다양한 카테고리와 키워드로 검색
  const searchQueries = [
    // 뷰티 & 패션
    "beauty influencer",
    "fashion blogger",
    "makeup tutorial",
    "skincare routine",
    "fashion haul",
    "outfit of the day",
    "beauty review",
    "style tips",

    // 라이프스타일
    "lifestyle vlogger",
    "daily vlog",
    "morning routine",
    "evening routine",
    "home decor",
    "interior design",
    "minimalist lifestyle",
    "productivity tips",

    // 테크 & 게임
    "tech reviewer",
    "gaming channel",
    "phone review",
    "laptop review",
    "tech news",
    "gaming setup",
    "streaming setup",
    "coding tutorial",

    // 요리 & 음식
    "cooking channel",
    "recipe tutorial",
    "food review",
    "baking tutorial",
    "healthy recipes",
    "meal prep",
    "restaurant review",
    "food vlog",

    // 여행 & 모험
    "travel vlogger",
    "travel guide",
    "adventure vlog",
    "backpacking",
    "city tour",
    "travel tips",
    "budget travel",
    "solo travel",

    // 피트니스 & 건강
    "fitness influencer",
    "workout routine",
    "gym tips",
    "yoga tutorial",
    "healthy lifestyle",
    "weight loss",
    "muscle building",
    "cardio workout",

    // 교육 & 학습
    "educational content",
    "tutorial",
    "how to",
    "learning tips",
    "study with me",
    "language learning",
    "skill development",
    "career advice",

    // 엔터테인먼트
    "comedy channel",
    "prank videos",
    "challenge videos",
    "reaction videos",
    "music covers",
    "dance tutorial",
    "magic tricks",
    "funny videos",
  ];

  const allChannels = [];
  const processedChannels = new Set(); // 중복 방지

  // 랜덤하게 쿼리 선택 (API 할당량 고려)
  const shuffledQueries = searchQueries.sort(() => Math.random() - 0.5);
  const selectedQueries = shuffledQueries.slice(0, 50); // 50개 쿼리 사용

  for (const query of selectedQueries) {
    try {
      console.log(`검색 중: ${query}`);
      const channels = await searchYouTubeChannels(query, 5); // 쿼리당 5개씩

      for (const channel of channels) {
        // 중복 방지
        if (processedChannels.has(channel.id)) {
          continue;
        }
        processedChannels.add(channel.id);

        try {
          // 각 채널의 최근 비디오들 가져오기
          const videos = await getYouTubeChannelVideos(channel.id, 3);

          // 데이터 변환
          const influencerData = convertYouTubeToInfluencerData(channel, videos);

          // 카테고리 자동 분류
          influencerData.categories = categorizeInfluencer(influencerData, query);

          // 영상 정보 추가
          influencerData.recent_videos = videos;

          allChannels.push(influencerData);
          console.log(
            `처리 완료: ${influencerData.name} (${influencerData.followers} 구독자) - ${videos.length}개 영상`,
          );

          // API 호출 제한을 고려한 지연
          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`채널 ${channel.id} 처리 오류:`, error);
        }
      }
    } catch (error) {
      console.error(`검색 쿼리 "${query}" 처리 오류:`, error);
    }
  }

  return allChannels;
}

// 인플루언서 카테고리 자동 분류 함수
function categorizeInfluencer(influencer: any, searchQuery: string) {
  const categories = [];

  // 검색 쿼리 기반 분류
  if (
    searchQuery.includes("beauty") ||
    searchQuery.includes("makeup") ||
    searchQuery.includes("skincare")
  ) {
    categories.push("Beauty");
  }
  if (
    searchQuery.includes("fashion") ||
    searchQuery.includes("style") ||
    searchQuery.includes("outfit")
  ) {
    categories.push("Fashion");
  }
  if (
    searchQuery.includes("tech") ||
    searchQuery.includes("gaming") ||
    searchQuery.includes("review")
  ) {
    categories.push("Technology");
  }
  if (
    searchQuery.includes("cooking") ||
    searchQuery.includes("recipe") ||
    searchQuery.includes("food")
  ) {
    categories.push("Food");
  }
  if (searchQuery.includes("travel") || searchQuery.includes("adventure")) {
    categories.push("Travel");
  }
  if (
    searchQuery.includes("fitness") ||
    searchQuery.includes("workout") ||
    searchQuery.includes("gym")
  ) {
    categories.push("Fitness");
  }
  if (
    searchQuery.includes("lifestyle") ||
    searchQuery.includes("vlog") ||
    searchQuery.includes("routine")
  ) {
    categories.push("Lifestyle");
  }
  if (
    searchQuery.includes("education") ||
    searchQuery.includes("tutorial") ||
    searchQuery.includes("learning")
  ) {
    categories.push("Education");
  }
  if (
    searchQuery.includes("comedy") ||
    searchQuery.includes("funny") ||
    searchQuery.includes("entertainment")
  ) {
    categories.push("Entertainment");
  }

  // 기본 카테고리
  if (categories.length === 0) {
    categories.push("Content Creator", "YouTube");
  }

  return categories;
}

serve(async (req) => {
  try {
    // CORS 헤더 설정
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    };

    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    // Supabase 클라이언트 생성
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("무작위 인플루언서 데이터 수집 시작...");

    // 무작위 인플루언서 데이터 수집
    const randomInfluencers = await getRandomInfluencers();

    console.log(`${randomInfluencers.length}개의 무작위 인플루언서를 찾았습니다.`);

    // Supabase에 데이터 저장 (영상 정보 포함)
    const { data, error } = await supabase
      .from("influencers")
      .insert(
        randomInfluencers.map((influencer) => ({
          name: influencer.name,
          handle: influencer.handle,
          platform: influencer.platform,
          followers: influencer.followers,
          engagement_rate: influencer.engagement_rate,
          avg_likes: influencer.avg_likes,
          categories: influencer.categories,
          verified: influencer.verified,
          profile_image_url: influencer.profile_image_url,
          bio: influencer.bio,
          location: influencer.location,
          recent_videos: influencer.recent_videos || [], // 영상 정보 추가
        })),
      )
      .select();

    if (error) {
      throw new Error(`Supabase 저장 오류: ${error.message}`);
    }

    console.log(`${data?.length || 0}개의 인플루언서 데이터가 저장되었습니다.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "무작위 인플루언서 데이터 수집이 완료되었습니다.",
        count: data?.length || 0,
        influencers: randomInfluencers.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("YouTube 데이터 동기화 오류:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
          "Content-Type": "application/json",
        },
        status: 500,
      },
    );
  }
});
