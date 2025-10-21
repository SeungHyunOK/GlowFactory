import { google } from "googleapis";

// 캐시 인터페이스
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// 메모리 캐시 클래스
class MemoryCache {
  private cache = new Map<string, CacheItem<unknown>>();
  private maxSize = 1000; // 최대 캐시 항목 수

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // 캐시 크기 제한
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
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

    // TTL 체크
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  // 특정 패턴의 캐시 삭제
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

// 전역 캐시 인스턴스
const cache = new MemoryCache();

// 재시도 정책 클래스
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
      } catch (error: unknown) {
        lastError = error as Error;

        // 429 (Rate Limit) 또는 403 (Quota Exceeded) 에러인 경우에만 재시도
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((error as any).status === 429 || (error as any).status === 403) {
          if (attempt < this.maxRetries) {
            const delay = this.baseDelay * Math.pow(2, attempt); // 지수 백오프
            console.log(`API 재시도 ${attempt + 1}/${this.maxRetries} (${delay}ms 후)`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        }

        // 재시도하지 않을 에러는 즉시 throw
        throw error;
      }
    }

    throw lastError!;
  }
}

const retryPolicy = new RetryPolicy();

// YouTube 클라이언트 생성
function createYouTubeClient() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  return google.youtube({
    version: "v3",
    auth: apiKey,
  });
}

// 최적화된 YouTube 채널 정보 조회
export async function getYouTubeChannelInfoOptimized(channelId: string) {
  const cacheKey = `channel:${channelId}`;

  // 캐시에서 먼저 확인
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`캐시에서 채널 정보 조회: ${channelId}`);
    return cached;
  }

  return retryPolicy.execute(async () => {
    const youtube = createYouTubeClient();

    // 최소한의 part만 요청
    const response = await youtube.channels.list({
      part: ["snippet", "statistics"], // contentDetails 제거
      id: [channelId],
      fields:
        "items(id,snippet(title,description,thumbnails),statistics(subscriberCount,videoCount,viewCount))",
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error(`채널을 찾을 수 없습니다: ${channelId}`);
    }

    const channel = response.data.items[0];
    const result = {
      id: channel.id!,
      title: channel.snippet?.title || "",
      description: channel.snippet?.description || "",
      thumbnails: channel.snippet?.thumbnails || {},
      subscriberCount: parseInt(channel.statistics?.subscriberCount || "0"),
      videoCount: parseInt(channel.statistics?.videoCount || "0"),
      viewCount: parseInt(channel.statistics?.viewCount || "0"),
    };

    // 5분 캐시
    cache.set(cacheKey, result, 5 * 60 * 1000);
    return result;
  });
}

// 배치로 여러 채널 정보 조회
export async function getYouTubeChannelsBatch(channelIds: string[]) {
  const cacheKey = `channels:${channelIds.sort().join(",")}`;

  // 캐시에서 먼저 확인
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`캐시에서 배치 채널 정보 조회: ${channelIds.length}개`);
    return cached;
  }

  return retryPolicy.execute(async () => {
    const youtube = createYouTubeClient();

    // 배치로 한 번에 조회 (최대 50개)
    const batchSize = 50;
    const results = [];

    for (let i = 0; i < channelIds.length; i += batchSize) {
      const batch = channelIds.slice(i, i + batchSize);

      const response = await youtube.channels.list({
        part: ["snippet", "statistics"],
        id: batch,
        fields:
          "items(id,snippet(title,description,thumbnails),statistics(subscriberCount,videoCount,viewCount))",
      });

      if (response.data.items) {
        results.push(
          ...response.data.items.map((channel) => ({
            id: channel.id!,
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

    // 5분 캐시
    cache.set(cacheKey, results, 5 * 60 * 1000);
    return results;
  });
}

// 최적화된 비디오 정보 조회 (배치) - 정확성 개선
export async function getYouTubeVideosBatch(videoIds: string[], channelId?: string) {
  const cacheKey = `videos:${videoIds.sort().join(",")}`;

  // 캐시에서 먼저 확인
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`캐시에서 배치 비디오 정보 조회: ${videoIds.length}개`);
    return cached;
  }

  return retryPolicy.execute(async () => {
    const youtube = createYouTubeClient();

    // 배치로 한 번에 조회 (최대 50개)
    const batchSize = 50;
    const results = [];

    for (let i = 0; i < videoIds.length; i += batchSize) {
      const batch = videoIds.slice(i, i + batchSize);

      const response = await youtube.videos.list({
        part: ["snippet", "statistics"],
        id: batch,
        fields:
          "items(id,snippet(title,publishedAt,channelId,privacyStatus),statistics(viewCount,likeCount,commentCount))",
      });

      if (response.data.items) {
        // 영상 필터링 및 정확성 검증
        const filteredVideos = response.data.items
          .filter((video) => {
            // 1. 채널 ID가 일치하는지 확인 (채널 소유자 영상만)
            if (channelId && video.snippet?.channelId !== channelId) {
              console.log(
                `영상 ${video.id}는 다른 채널(${video.snippet?.channelId})의 영상입니다. 제외합니다.`,
              );
              return false;
            }

            // 2. 영상이 공개되어 있는지 확인
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const privacyStatus = (video.snippet as any)?.privacyStatus;
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
          .map((video) => ({
            id: video.id!,
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

    // 10분 캐시 (비디오는 더 자주 변경됨)
    cache.set(cacheKey, results, 10 * 60 * 1000);
    return results;
  });
}

// 인기 채널 검색 (search.list 대신 직접 채널 ID 사용)
export async function getPopularYouTubeChannelsOptimized() {
  const cacheKey = "popular_channels";

  // 캐시에서 먼저 확인
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log("캐시에서 인기 채널 조회");
    return cached;
  }

  // 미리 정의된 인기 채널 ID들 (search.list 대신 사용)
  const popularChannelIds = [
    "UCBJycsmduvYEL83R_U4JriQ", // Marques Brownlee
    "UCXuqSBlHAE6Xw-yeJA0Tunw", // Linus Tech Tips
    "UCBJycsmduvYEL83R_U4JriQ", // MrBeast
    "UC-lHJZR3Gqxm24_Vd_AJ5Yw", // PewDiePie
    "UCq-Fj5jknLsUf-MWSy4_brA", // T-Series
    "UCBJycsmduvYEL83R_U4JriQ", // 5-Minute Crafts
    "UCBJycsmduvYEL83R_U4JriQ", // SET India
    "UCBJycsmduvYEL83R_U4JriQ", // WWE
    "UCBJycsmduvYEL83R_U4JriQ", // Zee Music Company
    "UCBJycsmduvYEL83R_U4JriQ", // Like Nastya
  ];

  try {
    // 배치로 채널 정보 조회
    const channels = await getYouTubeChannelsBatch(popularChannelIds);

    // 1시간 캐시
    cache.set(cacheKey, channels, 60 * 60 * 1000);
    return channels;
  } catch (error) {
    console.error("인기 채널 조회 오류:", error);
    return [];
  }
}

// 카테고리별 채널 검색 (search.list 최소화)
export async function searchYouTubeChannelsByCategory(category: string, maxResults: number = 5) {
  const cacheKey = `category_channels:${category}:${maxResults}`;

  // 캐시에서 먼저 확인
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`캐시에서 카테고리 채널 조회: ${category}`);
    return cached;
  }

  return retryPolicy.execute(async () => {
    const youtube = createYouTubeClient();

    // search.list 사용을 최소화 (1 unit)
    const response = await youtube.search.list({
      part: ["snippet"],
      q: category,
      type: ["channel"],
      maxResults: Math.min(maxResults, 5), // 최대 5개로 제한
      fields: "items(snippet(channelId,title,description,thumbnails))",
    });

    if (!response.data.items || response.data.items.length === 0) {
      return [];
    }

    // 채널 ID들 추출
    const channelIds = response.data.items
      .map((item) => item.snippet?.channelId)
      .filter(Boolean) as string[];

    if (channelIds.length === 0) {
      return [];
    }

    // 배치로 채널 상세 정보 조회
    const channels = await getYouTubeChannelsBatch(channelIds);

    // 30분 캐시
    cache.set(cacheKey, channels, 30 * 60 * 1000);
    return channels;
  });
}

// 캐시 관리 함수들
export function clearCache(): void {
  cache.clear();
}

export function clearChannelCache(): void {
  cache.deletePattern("^channel:");
  cache.deletePattern("^channels:");
}

export function clearVideoCache(): void {
  cache.deletePattern("^videos:");
}

// API 사용량 모니터링
export function getCacheStats() {
  return {
    size: cache["cache"].size,
    maxSize: cache["maxSize"],
  };
}

// YouTube 데이터를 인플루언서 데이터로 변환
export function convertYouTubeToInfluencerDataOptimized(
  channelData: Record<string, unknown>,
  videosData: Record<string, unknown>[] = [],
): Record<string, unknown> {
  // 평균 좋아요 계산
  const totalLikes = videosData.reduce((sum, video) => sum + (video.likeCount as number), 0);
  const avgLikes = videosData.length > 0 ? Math.round(totalLikes / videosData.length) : 0;

  // 참여율 계산 (간단한 공식)
  const totalViews = videosData.reduce((sum, video) => sum + (video.viewCount as number), 0);
  const totalEngagement = videosData.reduce(
    (sum, video) => sum + (video.likeCount as number) + (video.commentCount as number),
    0,
  );
  const engagementRate =
    totalViews > 0 ? Math.round((totalEngagement / totalViews) * 100 * 100) / 100 : 0;

  return {
    name: channelData.title as string,
    handle: (channelData.title as string).toLowerCase().replace(/\s+/g, ""),
    platform: "youtube",
    followers: channelData.subscriberCount as number,
    engagement_rate: engagementRate,
    avg_likes: avgLikes,
    categories: ["Lifestyle"], // 기본 카테고리
    verified: (channelData.subscriberCount as number) > 1000000, // 100만 구독자 이상을 인증으로 간주
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    profile_image_url:
      (channelData.thumbnails as any)?.high?.url || (channelData.thumbnails as any)?.medium?.url,
    bio: channelData.description as string,
    total_views: channelData.viewCount as number,
    video_count: channelData.videoCount as number,
  };
}
