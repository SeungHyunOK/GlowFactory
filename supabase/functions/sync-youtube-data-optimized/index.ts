import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 캐시 인터페이스
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// 메모리 캐시 클래스
class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 500;

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new MemoryCache();

// 재시도 정책
class RetryPolicy {
  private maxRetries: number;
  private baseDelay: number;

  constructor(maxRetries: number = 3, baseDelay: number = 1000) {
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        if (error.status === 429 || error.status === 403) {
          if (attempt < this.maxRetries) {
            const delay = this.baseDelay * Math.pow(2, attempt);
            console.log(`API 재시도 ${attempt + 1}/${this.maxRetries} (${delay}ms 후)`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        }

        throw error;
      }
    }

    throw lastError!;
  }
}

const retryPolicy = new RetryPolicy();

// 배치로 채널 정보 조회
async function getYouTubeChannelsBatch(channelIds: string[]) {
  const cacheKey = `channels:${channelIds.sort().join(",")}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`캐시에서 배치 채널 정보 조회: ${channelIds.length}개`);
    return cached;
  }

  return retryPolicy.execute(async () => {
    const apiKey = Deno.env.get("GOOGLE_API_KEY");
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY가 설정되지 않았습니다.");
    }

    const batchSize = 50;
    const results = [];

    for (let i = 0; i < channelIds.length; i += batchSize) {
      const batch = channelIds.slice(i, i + batchSize);

      const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${batch.join(",")}&fields=items(id,snippet(title,description,thumbnails),statistics(subscriberCount,videoCount,viewCount))&key=${apiKey}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`YouTube API 오류: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.items) {
        results.push(
          ...data.items.map((channel: any) => ({
            id: channel.id,
            title: channel.snippet?.title || "",
            description: channel.snippet?.description || "",
            thumbnails: channel.snippet?.thumbnails || {},
            subscriberCount: parseInt(channel.statistics?.subscriberCount || "0"),
            videoCount: parseInt(channel.statistics?.videoCount || "0"),
            viewCount: parseInt(channel.statistics?.viewCount || "0"),
          })),
        );
      }
    }

    cache.set(cacheKey, results, 5 * 60 * 1000);
    return results;
  });
}

// 배치로 비디오 정보 조회 (정확성 개선)
async function getYouTubeVideosBatch(videoIds: string[], channelId?: string) {
  const cacheKey = `videos:${videoIds.sort().join(",")}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`캐시에서 배치 비디오 정보 조회: ${videoIds.length}개`);
    return cached;
  }

  return retryPolicy.execute(async () => {
    const apiKey = Deno.env.get("GOOGLE_API_KEY");
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY가 설정되지 않았습니다.");
    }

    const batchSize = 50;
    const results = [];

    for (let i = 0; i < videoIds.length; i += batchSize) {
      const batch = videoIds.slice(i, i + batchSize);

      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${batch.join(",")}&fields=items(id,snippet(title,publishedAt,channelId,privacyStatus),statistics(viewCount,likeCount,commentCount))&key=${apiKey}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`YouTube API 오류: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.items) {
        // 영상 필터링 및 정확성 검증
        const filteredVideos = data.items
          .filter((video: any) => {
            // 1. 채널 ID가 일치하는지 확인 (채널 소유자 영상만)
            if (channelId && video.snippet?.channelId !== channelId) {
              console.log(
                `영상 ${video.id}는 다른 채널(${video.snippet?.channelId})의 영상입니다. 제외합니다.`,
              );
              return false;
            }

            // 2. 영상이 공개되어 있는지 확인
            const privacyStatus = video.snippet?.privacyStatus;
            if (privacyStatus !== "public") {
              console.log(`영상 ${video.id}는 비공개 영상입니다. 제외합니다.`);
              return false;
            }

            // 3. 영상이 너무 오래된 것은 제외 (최근 1년 이내)
            const publishedAt = new Date(video.snippet?.publishedAt || "");
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
          .map((video: any) => ({
            id: video.id,
            title: video.snippet?.title || "",
            publishedAt: video.snippet?.publishedAt || "",
            channelId: video.snippet?.channelId,
            viewCount: parseInt(video.statistics?.viewCount || "0"),
            likeCount: parseInt(video.statistics?.likeCount || "0"),
            commentCount: parseInt(video.statistics?.commentCount || "0"),
          }));

        results.push(...filteredVideos);
      }
    }

    console.log(`배치 비디오 조회: ${results.length}개의 유효한 영상을 찾았습니다.`);

    cache.set(cacheKey, results, 10 * 60 * 1000);
    return results;
  });
}

// 인기 채널 ID 목록 (search.list 대신 사용)
const POPULAR_CHANNEL_IDS = [
  "UCBJycsmduvYEL83R_U4JriQ", // Marques Brownlee
  "UCXuqSBlHAE6Xw-yeJA0Tunw", // Linus Tech Tips
  "UCX6OQ3DkcsbYNE6V8CQ4w", // MrBeast
  "UC-lHJZR3Gqxm24_Vd_AJ5Yw", // PewDiePie
  "UCq-Fj5jknLsUf-MWSy4_brA", // T-Series
  "UCBJycsmduvYEL83R_U4JriQ", // 5-Minute Crafts
  "UCBJycsmduvYEL83R_U4JriQ", // SET India
  "UCBJycsmduvYEL83R_U4JriQ", // WWE
  "UCBJycsmduvYEL83R_U4JriQ", // Zee Music Company
  "UCBJycsmduvYEL83R_U4JriQ", // Like Nastya
];

// 카테고리별 검색 (search.list 최소화)
async function searchYouTubeChannelsByCategory(category: string, maxResults: number = 3) {
  const cacheKey = `category_channels:${category}:${maxResults}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`캐시에서 카테고리 채널 조회: ${category}`);
    return cached;
  }

  return retryPolicy.execute(async () => {
    const apiKey = Deno.env.get("GOOGLE_API_KEY");
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY가 설정되지 않았습니다.");
    }

    // search.list 사용을 최소화 (1 unit)
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(category)}&type=channel&maxResults=${Math.min(maxResults, 3)}&fields=items(snippet(channelId,title,description,thumbnails))&key=${apiKey}`;

    const searchResponse = await fetch(searchUrl);

    if (!searchResponse.ok) {
      throw new Error(`YouTube API 오류: ${searchResponse.status} ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return [];
    }

    // 채널 ID들 추출
    const channelIds = searchData.items.map((item: any) => item.snippet?.channelId).filter(Boolean);

    if (channelIds.length === 0) {
      return [];
    }

    // 배치로 채널 상세 정보 조회
    const channels = await getYouTubeChannelsBatch(channelIds);

    cache.set(cacheKey, channels, 30 * 60 * 1000);
    return channels;
  });
}

// 인플루언서 데이터 변환
function convertYouTubeToInfluencerData(
  channelData: any,
  videosData: any[] = [],
  category: string,
) {
  const totalLikes = videosData.reduce((sum, video) => sum + video.likeCount, 0);
  const avgLikes = videosData.length > 0 ? Math.round(totalLikes / videosData.length) : 0;

  const totalViews = videosData.reduce((sum, video) => sum + video.viewCount, 0);
  const totalEngagement = videosData.reduce(
    (sum, video) => sum + video.likeCount + video.commentCount,
    0,
  );
  const engagementRate =
    totalViews > 0 ? Math.round((totalEngagement / totalViews) * 100 * 100) / 100 : 0;

  return {
    name: channelData.title,
    handle: channelData.title.toLowerCase().replace(/\s+/g, ""),
    platform: "youtube",
    followers: channelData.subscriberCount,
    engagement_rate: engagementRate,
    avg_likes: avgLikes,
    categories: [category],
    verified: channelData.subscriberCount > 1000000,
    profile_image_url: channelData.thumbnails?.high?.url || channelData.thumbnails?.medium?.url,
    bio: channelData.description,
    total_views: channelData.viewCount,
    video_count: channelData.videoCount,
  };
}

// 카테고리 자동 분류
function categorizeInfluencer(influencer: any, searchQuery: string) {
  const categories = [];

  if (searchQuery.includes("beauty") || searchQuery.includes("makeup")) {
    categories.push("Beauty", "Lifestyle");
  } else if (searchQuery.includes("tech") || searchQuery.includes("gaming")) {
    categories.push("Technology", "Gaming");
  } else if (searchQuery.includes("food") || searchQuery.includes("cooking")) {
    categories.push("Food", "Cooking");
  } else if (searchQuery.includes("fitness") || searchQuery.includes("workout")) {
    categories.push("Fitness", "Health");
  } else if (searchQuery.includes("travel") || searchQuery.includes("vlog")) {
    categories.push("Travel", "Lifestyle");
  } else {
    categories.push("Entertainment", "Lifestyle");
  }

  return categories;
}

// 중복 제거를 위한 유틸리티 함수들
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "");
}

function normalizeHandle(handle: string): string {
  return handle.toLowerCase().trim().replace(/[^\w]/g, "");
}

function isDuplicate(influencer: any, existingInfluencers: any[]): boolean {
  const normalizedName = normalizeName(influencer.name);
  const normalizedHandle = normalizeHandle(influencer.handle);

  return existingInfluencers.some((existing) => {
    const existingNormalizedName = normalizeName(existing.name);
    const existingNormalizedHandle = normalizeHandle(existing.handle);

    // 이름이 같거나 핸들이 같으면 중복으로 간주
    return (
      normalizedName === existingNormalizedName || normalizedHandle === existingNormalizedHandle
    );
  });
}

// 최적화된 인플루언서 데이터 수집
async function getOptimizedInfluencers() {
  const categories = [
    "beauty influencer",
    "tech reviewer",
    "gaming channel",
    "food blogger",
    "fitness influencer",
    "travel vlogger",
    "lifestyle blogger",
    "music producer",
    "comedy channel",
    "educational content",
  ];

  const allInfluencers = [];
  const processedChannels = new Set();
  const processedNames = new Set(); // 이름 기반 중복 방지
  const processedHandles = new Set(); // 핸들 기반 중복 방지

  // 1. 인기 채널들 먼저 처리 (search.list 없이)
  try {
    console.log("인기 채널 처리 중...");
    const popularChannels = await getYouTubeChannelsBatch(POPULAR_CHANNEL_IDS.slice(0, 5));

    for (const channel of popularChannels) {
      if (processedChannels.has(channel.id)) continue;

      const influencerData = convertYouTubeToInfluencerData(channel, [], "Popular");
      influencerData.categories = categorizeInfluencer(influencerData, "popular");

      // 중복 체크 (이름과 핸들 기반)
      const normalizedName = normalizeName(influencerData.name);
      const normalizedHandle = normalizeHandle(influencerData.handle);

      if (processedNames.has(normalizedName) || processedHandles.has(normalizedHandle)) {
        console.log(`중복 발견 (인기 채널): ${influencerData.name} - 건너뜀`);
        continue;
      }

      // 중복이 아니면 추가
      processedChannels.add(channel.id);
      processedNames.add(normalizedName);
      processedHandles.add(normalizedHandle);
      allInfluencers.push(influencerData);

      console.log(`인기 채널 추가: ${influencerData.name}`);
    }
  } catch (error) {
    console.error("인기 채널 처리 오류:", error);
  }

  // 2. 카테고리별 검색 (search.list 최소화)
  for (const category of categories.slice(0, 5)) {
    // 5개 카테고리만
    try {
      console.log(`카테고리 검색 중: ${category}`);
      const channels = await searchYouTubeChannelsByCategory(category, 2);

      for (const channel of channels) {
        if (processedChannels.has(channel.id)) continue;

        const influencerData = convertYouTubeToInfluencerData(channel, [], category);
        influencerData.categories = categorizeInfluencer(influencerData, category);

        // 중복 체크 (이름과 핸들 기반)
        const normalizedName = normalizeName(influencerData.name);
        const normalizedHandle = normalizeHandle(influencerData.handle);

        if (processedNames.has(normalizedName) || processedHandles.has(normalizedHandle)) {
          console.log(`중복 발견 (카테고리: ${category}): ${influencerData.name} - 건너뜀`);
          continue;
        }

        // 중복이 아니면 추가
        processedChannels.add(channel.id);
        processedNames.add(normalizedName);
        processedHandles.add(normalizedHandle);
        allInfluencers.push(influencerData);

        console.log(`카테고리 채널 추가: ${influencerData.name} (${category})`);
      }

      // API 호출 제한을 고려한 지연
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`카테고리 "${category}" 처리 오류:`, error);
    }
  }

  return allInfluencers;
}

// 기존 데이터베이스에서 중복 제거
async function removeExistingDuplicates(supabase: any) {
  try {
    console.log("기존 중복 데이터 제거 중...");

    // 중복된 데이터 찾기
    const { data: duplicates, error: findError } = await supabase
      .from("influencers")
      .select("name, platform, COUNT(*) as count")
      .group("name, platform")
      .having("COUNT(*) > 1");

    if (findError) {
      console.error("중복 데이터 조회 오류:", findError);
      return;
    }

    if (duplicates && duplicates.length > 0) {
      console.log(`발견된 중복 그룹: ${duplicates.length}개`);

      // 각 중복 그룹에서 최신 데이터만 유지
      for (const duplicate of duplicates) {
        const { data: records, error: selectError } = await supabase
          .from("influencers")
          .select("*")
          .eq("name", duplicate.name)
          .eq("platform", duplicate.platform)
          .order("updated_at", { ascending: false });

        if (selectError) {
          console.error("중복 레코드 조회 오류:", selectError);
          continue;
        }

        if (records && records.length > 1) {
          // 첫 번째(최신) 제외하고 나머지 삭제
          const idsToDelete = records.slice(1).map((record) => record.id);

          const { error: deleteError } = await supabase
            .from("influencers")
            .delete()
            .in("id", idsToDelete);

          if (deleteError) {
            console.error("중복 데이터 삭제 오류:", deleteError);
          } else {
            console.log(
              `${duplicate.name} (${duplicate.platform}) 중복 ${idsToDelete.length}개 제거`,
            );
          }
        }
      }
    }

    console.log("기존 중복 데이터 제거 완료");
  } catch (error) {
    console.error("중복 제거 중 오류:", error);
  }
}

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    console.log("최적화된 YouTube 데이터 동기화 시작...");

    // 1. 기존 중복 데이터 제거
    await removeExistingDuplicates(supabase);

    // 최적화된 인플루언서 데이터 수집
    const influencers = await getOptimizedInfluencers();

    if (influencers.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "수집된 인플루언서 데이터가 없습니다.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    console.log(`${influencers.length}명의 인플루언서 데이터 수집 완료`);

    // Supabase에 데이터 저장
    const { error } = await supabase.from("influencers").upsert(
      influencers.map((influencer) => ({
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
        total_views: influencer.total_views,
        video_count: influencer.video_count,
      })),
      { onConflict: "name,platform" },
    );

    if (error) {
      throw error;
    }

    console.log("데이터베이스 저장 완료");

    return new Response(
      JSON.stringify({
        success: true,
        message: `${influencers.length}명의 인플루언서 데이터가 성공적으로 동기화되었습니다.`,
        count: influencers.length,
        cache_stats: {
          size: cache["cache"].size,
          maxSize: cache["maxSize"],
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("동기화 오류:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "데이터 동기화 중 오류가 발생했습니다.",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
