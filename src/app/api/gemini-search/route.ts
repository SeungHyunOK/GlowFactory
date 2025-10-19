import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// 메모리 캐시 (간단한 캐싱)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5분

// 캐시에서 데이터 가져오기
function getFromCache(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

// 캐시에 데이터 저장
function setCache(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() });
}

// 인플루언서 검색 결과 타입 (사용하지 않음 - 제거 예정)

// YouTube Data API v3를 사용한 채널 검색
async function searchYouTubeChannels(query: string, maxResults = 10) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY가 설정되지 않았습니다.");
  }

  try {
    console.log(`🔍 YouTube 채널 검색: "${query}"`);

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=channel&maxResults=${maxResults}&key=${apiKey}`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log(`❌ "${query}"에 대한 채널을 찾을 수 없습니다.`);
      return [];
    }

    console.log(`📋 ${data.items.length}개의 채널 검색 결과 발견`);

    // 채널 ID들 수집
    const channelIds = data.items
      .map((item: { snippet?: { channelId?: string } }) => item.snippet?.channelId)
      .filter(Boolean);

    if (channelIds.length === 0) {
      console.log(`❌ 유효한 채널 ID가 없습니다.`);
      return [];
    }

    console.log(`🎯 ${channelIds.length}개의 채널 상세 정보 수집 중...`);

    // 채널 상세 정보 가져오기
    const channelsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelIds.join(",")}&key=${apiKey}`;
    const channelsResponse = await fetch(channelsUrl);
    const channelsData = await channelsResponse.json();

    if (!channelsData.items || channelsData.items.length === 0) {
      console.log(`❌ 채널 상세 정보를 가져올 수 없습니다.`);
      return [];
    }

    const channels = channelsData.items.map(
      (channel: {
        id: string;
        snippet?: {
          title?: string;
          customUrl?: string;
          thumbnails?: { high?: { url?: string }; default?: { url?: string } };
          description?: string;
          publishedAt?: string;
        };
        statistics?: { subscriberCount?: string; viewCount?: string; videoCount?: string };
      }) => ({
        id: channel.id,
        name: channel.snippet?.title || "이름 없음",
        handle: channel.snippet?.customUrl || `@${channel.snippet?.title}`,
        platform: "youtube",
        followers: parseInt(channel.statistics?.subscriberCount || "0"),
        engagement_rate: 0, // YouTube Analytics API로 계산
        avg_likes: 0, // YouTube Analytics API로 계산
        categories: [], // 채널 설명 기반으로 분류
        verified: false,
        profile_image_url:
          channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.default?.url,
        bio: channel.snippet?.description || "",
        location: "",
        total_views: parseInt(channel.statistics?.viewCount || "0"),
        video_count: parseInt(channel.statistics?.videoCount || "0"),
        created_at: channel.snippet?.publishedAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    );

    console.log(`✅ ${channels.length}개의 채널 데이터 수집 완료`);
    return channels;
  } catch (error) {
    console.error(`❌ YouTube 채널 검색 오류:`, error);
    return [];
  }
}

// YouTube Data API v3를 사용한 최근 영상 수집
async function getChannelRecentVideos(channelId: string, maxResults = 3) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return [];
  }

  try {
    console.log(`📹 채널 ${channelId}의 최근 영상 수집 시작...`);

    // 채널의 업로드 플레이리스트 ID 가져오기
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
    const channelResponse = await fetch(channelUrl);
    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      console.log(`❌ 채널 ${channelId} 정보를 찾을 수 없습니다.`);
      return [];
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) {
      console.log(`❌ 채널 ${channelId}의 업로드 플레이리스트를 찾을 수 없습니다.`);
      return [];
    }

    console.log(`✅ 업로드 플레이리스트 ID: ${uploadsPlaylistId}`);

    // 플레이리스트의 비디오들 가져오기
    const videosUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${apiKey}`;
    const videosResponse = await fetch(videosUrl);
    const videosData = await videosResponse.json();

    if (!videosData.items || videosData.items.length === 0) {
      console.log(`❌ 채널 ${channelId}의 영상을 찾을 수 없습니다.`);
      return [];
    }

    console.log(`📋 ${videosData.items.length}개의 영상 아이템 발견`);

    // 각 비디오의 상세 정보 가져오기
    const videoIds = videosData.items
      .map(
        (item: { snippet?: { resourceId?: { videoId?: string } } }) =>
          item.snippet?.resourceId?.videoId,
      )
      .filter(Boolean);

    if (videoIds.length === 0) {
      console.log(`❌ 유효한 비디오 ID가 없습니다.`);
      return [];
    }

    console.log(`🎬 ${videoIds.length}개의 비디오 상세 정보 수집 중...`);

    const videosDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(",")}&key=${apiKey}`;
    const videosDetailsResponse = await fetch(videosDetailsUrl);
    const videosDetailsData = await videosDetailsResponse.json();

    if (!videosDetailsData.items || videosDetailsData.items.length === 0) {
      console.log(`❌ 비디오 상세 정보를 가져올 수 없습니다.`);
      return [];
    }

    const videos = videosDetailsData.items.map(
      (video: {
        id: string;
        snippet?: {
          title?: string;
          description?: string;
          publishedAt?: string;
          thumbnails?: Record<string, unknown>;
          channelId?: string;
        };
        statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
      }) => ({
        id: video.id,
        title: video.snippet?.title || "제목 없음",
        description: video.snippet?.description || "",
        publishedAt: video.snippet?.publishedAt || new Date().toISOString(),
        thumbnails: video.snippet?.thumbnails,
        viewCount: parseInt(video.statistics?.viewCount || "0"),
        likeCount: parseInt(video.statistics?.likeCount || "0"),
        commentCount: parseInt(video.statistics?.commentCount || "0"),
        channelId: video.snippet?.channelId,
      }),
    );

    console.log(`✅ ${videos.length}개의 영상 데이터 수집 완료`);
    return videos;
  } catch (error) {
    console.error(`❌ 채널 ${channelId} 영상 수집 오류:`, error);
    return [];
  }
}

// 배치 처리로 여러 채널의 통계를 한 번에 수집 (API 호출 최적화)
async function getBatchChannelAnalytics(channelIds: string[]) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey || channelIds.length === 0) {
    return {};
  }

  try {
    // 여러 채널의 통계를 한 번의 API 호출로 수집
    const statsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIds.join(",")}&key=${apiKey}`;
    const response = await fetch(statsUrl);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return {};
    }

    const analyticsMap: Record<
      string,
      { avg_views: number; engagement_rate: number; total_views: number; video_count: number }
    > = {};

    data.items.forEach(
      (channel: {
        id: string;
        statistics?: { subscriberCount?: string; viewCount?: string; videoCount?: string };
      }) => {
        const stats = channel.statistics;
        const subscriberCount = parseInt(stats?.subscriberCount || "0");
        const viewCount = parseInt(stats?.viewCount || "0");
        const videoCount = parseInt(stats?.videoCount || "0");

        // 평균 조회수 계산
        const avgViews = videoCount > 0 ? Math.round(viewCount / videoCount) : 0;

        // 참여율 추정 (구독자 대비 평균 조회수)
        const engagementRate = subscriberCount > 0 ? (avgViews / subscriberCount) * 100 : 0;

        analyticsMap[channel.id] = {
          avg_views: avgViews,
          engagement_rate: Math.round(engagementRate * 100) / 100,
          total_views: viewCount,
          video_count: videoCount,
        };
      },
    );

    return analyticsMap;
  } catch (error) {
    console.error("배치 YouTube Analytics 오류:", error);
    return {};
  }
}

// 개별 채널 통계 (fallback) - 사용하지 않음
/*
async function getChannelAnalytics(channelId: string) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const statsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;
    const response = await fetch(statsUrl);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const stats = data.items[0].statistics;
    const subscriberCount = parseInt(stats.subscriberCount || "0");
    const viewCount = parseInt(stats.viewCount || "0");
    const videoCount = parseInt(stats.videoCount || "0");

    const avgViews = videoCount > 0 ? Math.round(viewCount / videoCount) : 0;
    const engagementRate = subscriberCount > 0 ? (avgViews / subscriberCount) * 100 : 0;

    return {
      avg_views: avgViews,
      engagement_rate: Math.round(engagementRate * 100) / 100,
      total_views: viewCount,
      video_count: videoCount,
    };
  } catch (error) {
    console.error("YouTube Analytics 오류:", error);
    return null;
  }
}
*/

// 통합 DB 검색 (기존 DB + YouTube API 검색)
async function searchInfluencersInDB(query: string) {
  // 캐시 확인
  const cacheKey = `search_${query.toLowerCase()}`;
  const cachedResult = getFromCache(cacheKey) as {
    existing: unknown[];
    youtube: unknown[];
    total: number;
  } | null;
  if (cachedResult) {
    console.log(`캐시에서 결과 반환: ${query}`);
    return cachedResult;
  }

  // 1. 먼저 기존 DB에서 검색
  const { data: existingData, error: existingError } = await supabase
    .from("influencers")
    .select("*")
    .or(`name.ilike.%${query}%, handle.ilike.%${query}%, bio.ilike.%${query}%`)
    .limit(10);

  if (existingError) {
    console.error("기존 DB 검색 오류:", existingError);
  }

  // 2. YouTube Data API v3로 실시간 검색
  let youtubeResults = [];
  try {
    console.log(`YouTube API로 "${query}" 검색 중...`);
    youtubeResults = await searchYouTubeChannels(query, 8);

    // 배치 처리로 최적화: 모든 채널의 통계를 한 번에 수집
    const channelIds = youtubeResults.map((channel: { id: string }) => channel.id);
    const batchAnalytics = await getBatchChannelAnalytics(channelIds);

    // 병렬 처리로 최적화: 영상 데이터만 개별 수집
    const channelPromises = youtubeResults.map(
      async (channel: { id: string; [key: string]: unknown }) => {
        try {
          // 배치로 수집한 통계 데이터 적용
          const analytics = batchAnalytics[channel.id];
          if (analytics) {
            channel.avg_views = analytics.avg_views;
            channel.engagement_rate = analytics.engagement_rate;
            channel.total_views = analytics.total_views;
            channel.video_count = analytics.video_count;
          }

          // 영상 데이터만 개별 수집 (병렬 처리)
          const recentVideos = await getChannelRecentVideos(channel.id, 3);
          channel.recent_videos = recentVideos;

          // 최근 영상 기반 평균 좋아요 계산
          if (recentVideos.length > 0) {
            const avgLikes = Math.round(
              recentVideos.reduce(
                (sum: number, video: { likeCount: number }) => sum + video.likeCount,
                0,
              ) / recentVideos.length,
            );
            channel.avg_likes = avgLikes;
          }

          return channel;
        } catch (error) {
          console.error(`채널 ${channel.id} 처리 오류:`, error);
          return channel; // 오류가 있어도 기본 채널 정보는 반환
        }
      },
    );

    // 모든 채널 처리 완료 대기
    youtubeResults = await Promise.all(channelPromises);

    // API 호출 제한을 고려한 지연 (YouTube API 할당량 관리)
    if (youtubeResults.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log(`YouTube API에서 ${youtubeResults.length}명의 채널 발견`);
  } catch (error) {
    console.error("YouTube API 검색 오류:", error);
  }

  // 3. 결과 통합 (기존 DB + YouTube API)
  const existingResults = existingData || [];
  const youtubeApiResults = youtubeResults;

  const result = {
    existing: existingResults,
    youtube: youtubeApiResults,
    total: existingResults.length + youtubeApiResults.length,
  };

  // 결과를 캐시에 저장
  setCache(cacheKey, result);

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: false,
        message: "검색어를 입력해주세요.",
      });
    }

    console.log(`통합 DB 검색 시작: "${query}"`);

    // 통합 DB 검색 (기존 DB + 인기 인플루언서 DB)
    const searchResults = await searchInfluencersInDB(query);

    if (searchResults.total === 0) {
      return NextResponse.json({
        success: false,
        message: "해당 쿼리에 맞는 인플루언서를 찾을 수 없습니다.",
      });
    }

    // 결과 통합
    const allInfluencers = [...searchResults.existing, ...searchResults.youtube];

    console.log(
      `검색 완료: 기존 DB ${searchResults.existing.length}명, YouTube API ${searchResults.youtube.length}명`,
    );

    return NextResponse.json({
      success: true,
      source: "unified_database",
      influencers: allInfluencers,
      message: `총 ${searchResults.total}명의 인플루언서를 찾았습니다.`,
      breakdown: {
        existing: searchResults.existing.length,
        youtube: searchResults.youtube.length,
      },
    });
  } catch (error) {
    console.error("통합 DB 검색 오류:", error);
    return NextResponse.json(
      {
        success: false,
        message: `검색 중 오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
      },
      { status: 500 },
    );
  }
}
