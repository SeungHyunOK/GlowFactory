import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 무작위 인플루언서 수집을 위한 카테고리 풀
const RANDOM_CATEGORIES = [
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
  "fashion influencer",
  "cooking channel",
  "diy crafts",
  "photography",
  "art tutorial",
  "language learning",
  "book review",
  "movie review",
  "sports channel",
  "news commentary",
  "podcast",
  "asmr",
  "meditation",
  "yoga",
  "dance tutorial",
  "singing cover",
  "instrument tutorial",
  "science experiment",
  "history documentary",
  "nature vlog",
  "pet care",
  "gardening",
  "home improvement",
  "car review",
  "tech unboxing",
  "phone review",
  "laptop review",
  "gaming setup",
  "streaming tips",
  "social media tips",
  "business advice",
  "investment tips",
  "crypto news",
  "stock market",
  "real estate",
  "interior design",
  "fashion haul",
  "makeup tutorial",
  "skincare routine",
  "hair tutorial",
  "nail art",
  "jewelry making",
  "sewing tutorial",
  "knitting",
  "crochet",
  "woodworking",
  "metalworking",
  "3d printing",
  "robotics",
  "programming tutorial",
  "web development",
  "mobile app development",
  "game development",
  "graphic design",
  "video editing",
  "animation tutorial",
  "motion graphics",
  "ui ux design",
  "logo design",
  "branding",
  "marketing strategy",
  "content creation",
  "youtube growth",
  "instagram tips",
  "tiktok trends",
  "twitter strategy",
  "linkedin networking",
  "facebook marketing",
  "pinterest strategy",
  "snapchat marketing",
  "discord community",
  "twitch streaming",
  "youtube live",
  "instagram live",
  "tiktok live",
  "facebook live",
  "twitter spaces",
  "clubhouse rooms",
  "zoom meetings",
  "google meet",
  "microsoft teams",
  "slack workspace",
  "notion workspace",
  "trello boards",
  "asana projects",
  "airtable database",
  "zapier automation",
  "ifttt recipes",
  "automation tools",
  "productivity tips",
  "time management",
  "goal setting",
  "habit tracking",
  "mindfulness",
  "stress relief",
  "mental health",
  "therapy tips",
  "counseling advice",
  "relationship advice",
  "dating tips",
  "marriage counseling",
  "parenting advice",
  "child development",
  "education tips",
  "learning strategies",
  "study techniques",
  "exam preparation",
  "career advice",
  "job search",
  "resume writing",
  "interview tips",
  "networking strategies",
  "salary negotiation",
  "work life balance",
  "remote work",
  "freelancing",
  "entrepreneurship",
  "startup advice",
  "business planning",
  "financial planning",
  "budgeting tips",
  "saving money",
  "investing basics",
  "retirement planning",
  "insurance advice",
  "tax preparation",
  "estate planning",
  "wealth building",
  "passive income",
  "side hustle",
  "online business",
  "ecommerce",
  "dropshipping",
  "affiliate marketing",
  "influencer marketing",
  "social media marketing",
  "email marketing",
  "content marketing",
  "seo optimization",
  "google ads",
  "facebook ads",
  "instagram ads",
  "youtube ads",
  "tiktok ads",
  "twitter ads",
  "linkedin ads",
  "pinterest ads",
  "snapchat ads",
  "reddit ads",
  "quora ads",
  "youtube monetization",
  "patreon creator",
  "onlyfans creator",
  "substack newsletter",
  "medium writing",
  "blog monetization",
  "podcast monetization",
  "course creation",
  "coaching business",
  "consulting services",
  "freelance writing",
  "virtual assistant",
  "social media manager",
  "content creator",
  "video editor",
  "graphic designer",
  "web developer",
  "app developer",
  "game developer",
  "ui ux designer",
  "motion graphics artist",
  "3d artist",
  "animator",
  "illustrator",
  "photographer",
  "videographer",
  "drone pilot",
  "voice actor",
  "musician",
  "singer",
  "songwriter",
  "music producer",
  "dj",
  "dancer",
  "choreographer",
  "actor",
  "comedian",
  "magician",
  "ventriloquist",
  "puppeteer",
  "storyteller",
  "poet",
  "author",
  "screenwriter",
  "playwright",
  "director",
  "producer",
  "cinematographer",
  "sound engineer",
  "lighting technician",
  "set designer",
  "costume designer",
  "makeup artist",
  "hair stylist",
  "stylist",
  "fashion designer",
  "jewelry designer",
  "accessory designer",
  "shoe designer",
  "bag designer",
  "watch designer",
  "perfume creator",
  "skincare formulator",
  "cosmetic chemist",
  "nail technician",
  "lash technician",
  "brow specialist",
  "tattoo artist",
  "piercer",
  "body piercer",
  "massage therapist",
  "acupuncturist",
  "chiropractor",
  "physical therapist",
  "occupational therapist",
  "speech therapist",
  "nutritionist",
  "dietitian",
  "personal trainer",
  "yoga instructor",
  "pilates instructor",
  "dance instructor",
  "martial arts instructor",
  "swimming instructor",
  "tennis instructor",
  "golf instructor",
  "ski instructor",
  "snowboard instructor",
  "surfing instructor",
  "kitesurfing instructor",
  "windsurfing instructor",
  "sailing instructor",
  "kayaking instructor",
  "canoeing instructor",
  "rowing instructor",
  "cycling instructor",
  "running coach",
  "triathlon coach",
  "marathon coach",
  "ultra marathon coach",
  "trail running coach",
  "mountain biking coach",
  "road cycling coach",
  "track cycling coach",
  "bmx coach",
  "skateboarding coach",
  "roller skating coach",
  "ice skating coach",
  "figure skating coach",
  "hockey coach",
  "soccer coach",
  "basketball coach",
  "football coach",
  "baseball coach",
  "softball coach",
  "tennis coach",
  "badminton coach",
  "table tennis coach",
  "volleyball coach",
  "handball coach",
  "rugby coach",
  "cricket coach",
  "lacrosse coach",
  "field hockey coach",
  "ice hockey coach",
  "curling coach",
  "bowling coach",
  "darts coach",
  "pool coach",
  "snooker coach",
  "billiards coach",
  "chess coach",
  "poker coach",
  "blackjack coach",
  "roulette coach",
  "baccarat coach",
  "craps coach",
  "slot machine coach",
  "lottery coach",
  "scratch card coach",
  "bingo coach",
  "keno coach",
  "sports betting coach",
  "horse racing coach",
  "dog racing coach",
  "greyhound racing coach",
  "pigeon racing coach",
  "pigeon flying coach",
  "falconry coach",
  "bird watching coach",
  "nature photography coach",
  "wildlife photography coach",
  "landscape photography coach",
  "portrait photography coach",
  "wedding photography coach",
  "event photography coach",
  "sports photography coach",
  "fashion photography coach",
  "commercial photography coach",
  "product photography coach",
  "food photography coach",
  "real estate photography coach",
  "architectural photography coach",
  "street photography coach",
  "documentary photography coach",
  "photojournalism coach",
  "travel photography coach",
  "adventure photography coach",
  "underwater photography coach",
  "aerial photography coach",
  "drone photography coach",
  "astrophotography coach",
  "macro photography coach",
  "micro photography coach",
  "scientific photography coach",
  "medical photography coach",
  "forensic photography coach",
  "police photography coach",
  "military photography coach",
  "aviation photography coach",
  "automotive photography coach",
  "motorcycle photography coach",
  "bicycle photography coach",
  "boat photography coach",
  "ship photography coach",
  "yacht photography coach",
  "cruise ship photography coach",
  "ferry photography coach",
  "submarine photography coach",
  "diving photography coach",
  "snorkeling photography coach",
  "fishing photography coach",
  "hunting photography coach",
  "camping photography coach",
  "hiking photography coach",
  "climbing photography coach",
  "mountaineering photography coach",
  "rock climbing photography coach",
  "ice climbing photography coach",
  "bouldering photography coach",
  "free climbing photography coach",
  "aid climbing photography coach",
  "big wall climbing photography coach",
  "alpine climbing photography coach",
  "expedition climbing photography coach",
  "sport climbing photography coach",
  "traditional climbing photography coach",
  "top rope climbing photography coach",
  "lead climbing photography coach",
  "multi pitch climbing photography coach",
  "single pitch climbing photography coach",
  "indoor climbing photography coach",
  "outdoor climbing photography coach",
  "gym climbing photography coach",
  "home climbing photography coach",
  "backyard climbing photography coach",
  "garage climbing photography coach",
  "basement climbing photography coach",
  "attic climbing photography coach",
  "rooftop climbing photography coach",
  "balcony climbing photography coach",
  "deck climbing photography coach",
  "patio climbing photography coach",
  "garden climbing photography coach",
  "yard climbing photography coach",
  "field climbing photography coach",
  "meadow climbing photography coach",
  "forest climbing photography coach",
  "woodland climbing photography coach",
  "jungle climbing photography coach",
  "desert climbing photography coach",
  "canyon climbing photography coach",
  "valley climbing photography coach",
  "hill climbing photography coach",
  "mountain climbing photography coach",
  "peak climbing photography coach",
  "summit climbing photography coach",
  "ridge climbing photography coach",
  "arete climbing photography coach",
  "spine climbing photography coach",
  "buttress climbing photography coach",
  "pillar climbing photography coach",
  "tower climbing photography coach",
  "spire climbing photography coach",
  "needle climbing photography coach",
  "horn climbing photography coach",
  "fin climbing photography coach",
  "slab climbing photography coach",
  "face climbing photography coach",
  "wall climbing photography coach",
  "crack climbing photography coach",
  "chimney climbing photography coach",
  "offwidth climbing photography coach",
  "lieback climbing photography coach",
  "mantle climbing photography coach",
  "stem climbing photography coach",
  "layback climbing photography coach",
  "undercling climbing photography coach",
  "gaston climbing photography coach",
  "mono climbing photography coach",
  "crimp climbing photography coach",
  "pinch climbing photography coach",
  "jug climbing photography coach",
  "sloper climbing photography coach",
  "pocket climbing photography coach",
  "edge climbing photography coach",
  "rail climbing photography coach",
  "ledge climbing photography coach",
  "shelf climbing photography coach",
  "step climbing photography coach",
  "foothold climbing photography coach",
  "handhold climbing photography coach",
  "grip climbing photography coach",
  "hold climbing photography coach",
  "feature climbing photography coach",
  "texture climbing photography coach",
  "surface climbing photography coach",
  "material climbing photography coach",
  "rock climbing photography coach",
  "stone climbing photography coach",
  "granite climbing photography coach",
  "limestone climbing photography coach",
  "sandstone climbing photography coach",
  "basalt climbing photography coach",
  "gneiss climbing photography coach",
  "schist climbing photography coach",
  "marble climbing photography coach",
  "quartzite climbing photography coach",
  "conglomerate climbing photography coach",
  "breccia climbing photography coach",
  "tuff climbing photography coach",
  "volcanic climbing photography coach",
  "igneous climbing photography coach",
  "sedimentary climbing photography coach",
  "metamorphic climbing photography coach",
  "crystalline climbing photography coach",
  "foliated climbing photography coach",
  "non foliated climbing photography coach",
  "clastic climbing photography coach",
  "chemical climbing photography coach",
  "organic climbing photography coach",
  "biogenic climbing photography coach",
  "authigenic climbing photography coach",
  "allogenic climbing photography coach",
  "autogenic climbing photography coach",
  "allochthonous climbing photography coach",
  "autochthonous climbing photography coach",
  "parautochthonous climbing photography coach",
  "allochthonous climbing photography coach",
  "autochthonous climbing photography coach",
  "parautochthonous climbing photography coach",
];

// 무작위 카테고리 선택
function getRandomCategories(count: number = 3): string[] {
  const shuffled = [...RANDOM_CATEGORIES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// 무작위 검색어 생성
function generateRandomSearchTerms(category: string): string[] {
  const baseTerms = [
    `${category} 2024`,
    `new ${category}`,
    `popular ${category}`,
    `trending ${category}`,
    `best ${category}`,
    `top ${category}`,
    `famous ${category}`,
    `viral ${category}`,
    `hot ${category}`,
    `latest ${category}`,
  ];

  return baseTerms.sort(() => 0.5 - Math.random()).slice(0, 2);
}

// 캐시 인터페이스
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// 메모리 캐시 클래스
class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 100;

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

// 무작위 YouTube 채널 검색
async function searchRandomYouTubeChannels(searchTerm: string, maxResults: number = 2) {
  const cacheKey = `random_search:${searchTerm}:${maxResults}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`캐시에서 무작위 검색 결과 조회: ${searchTerm}`);
    return cached;
  }

  return retryPolicy.execute(async () => {
    const apiKey = Deno.env.get("GOOGLE_API_KEY");
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY가 설정되지 않았습니다.");
    }

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=channel&maxResults=${Math.min(maxResults, 2)}&fields=items(snippet(channelId,title,description,thumbnails))&key=${apiKey}`;

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

// 인플루언서 데이터 변환 (정확성 개선)
function convertYouTubeToInfluencerData(channelData: any, category: string, videos: any[] = []) {
  // 실제 영상 데이터를 기반으로 참여율 계산
  let engagementRate = 1; // 기본값
  let avgLikes = Math.floor(channelData.subscriberCount * 0.01); // 기본값

  if (videos.length > 0) {
    // 평균 조회수 계산
    const avgViews = videos.reduce((sum, video) => sum + (video.viewCount || 0), 0) / videos.length;

    // 평균 좋아요 수 계산
    const avgLikesFromVideos =
      videos.reduce((sum, video) => sum + (video.likeCount || 0), 0) / videos.length;

    // 참여율 계산 (평균 좋아요 수 / 평균 조회 수 * 100)
    if (avgViews > 0) {
      engagementRate = Math.round((avgLikesFromVideos / avgViews) * 100 * 100) / 100; // 소수점 둘째 자리까지
    }

    avgLikes = Math.round(avgLikesFromVideos);
  }

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
    recent_videos: videos.slice(0, 3), // 최근 3개 영상 정보 포함
  };
}

// 무작위 인플루언서 데이터 수집 (최적화된 버전)
async function getRandomInfluencers() {
  const randomCategories = getRandomCategories(2); // 2개 카테고리로 줄여서 API 호출 최적화
  const allInfluencers = [];
  const processedChannels = new Set();

  console.log(`무작위 선택된 카테고리: ${randomCategories.join(", ")}`);

  // 병렬 처리로 성능 향상
  const categoryPromises = randomCategories.map(async (category) => {
    try {
      console.log(`카테고리 검색 중: ${category}`);

      // 각 카테고리에서 1개의 무작위 검색어만 생성 (API 호출 최적화)
      const searchTerms = generateRandomSearchTerms(category).slice(0, 1);
      const categoryInfluencers = [];

      for (const searchTerm of searchTerms) {
        console.log(`검색어: ${searchTerm}`);
        const channels = await searchRandomYouTubeChannels(searchTerm, 1);

        for (const channel of channels) {
          if (processedChannels.has(channel.id)) continue;

          try {
            // 각 채널의 최근 영상들 가져오기 (정확성 검증 포함)
            const videos = await getYouTubeChannelVideos(channel.id, 2); // 영상 수를 2개로 줄임

            const influencerData = convertYouTubeToInfluencerData(channel, category, videos);

            // 영상 정보 추가
            influencerData.recent_videos = videos;

            processedChannels.add(channel.id);
            categoryInfluencers.push(influencerData);

            console.log(
              `무작위 인플루언서 추가: ${influencerData.name} (${category}) - ${videos.length}개 영상 확인`,
            );
          } catch (error) {
            console.error(`채널 ${channel.id} 영상 조회 오류:`, error);
            // 영상 조회 실패해도 기본 데이터로 인플루언서 추가
            const influencerData = convertYouTubeToInfluencerData(channel, category);
            processedChannels.add(channel.id);
            categoryInfluencers.push(influencerData);
          }
        }

        // API 호출 제한을 고려한 지연 (1초로 단축)
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      return categoryInfluencers;
    } catch (error) {
      console.error(`카테고리 "${category}" 처리 오류:`, error);
      return [];
    }
  });

  // 모든 카테고리를 병렬로 처리
  const results = await Promise.all(categoryPromises);

  // 결과를 평탄화
  for (const categoryInfluencers of results) {
    allInfluencers.push(...categoryInfluencers);
  }

  return allInfluencers;
}

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    console.log("무작위 인플루언서 데이터 수집 시작...");

    // 무작위 인플루언서 데이터 수집
    const influencers = await getRandomInfluencers();

    if (influencers.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "수집된 무작위 인플루언서 데이터가 없습니다.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    console.log(`${influencers.length}명의 무작위 인플루언서 데이터 수집 완료`);

    // Supabase에 데이터 저장 (영상 정보 포함)
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
        recent_videos: influencer.recent_videos || [], // 영상 정보 추가
      })),
      { onConflict: "name,platform" },
    );

    if (error) {
      throw error;
    }

    console.log("무작위 인플루언서 데이터베이스 저장 완료");

    return new Response(
      JSON.stringify({
        success: true,
        message: `${influencers.length}명의 무작위 인플루언서 데이터가 성공적으로 수집되었습니다.`,
        count: influencers.length,
        categories: influencers.map((i) => i.categories[0]),
        cache_stats: {
          size: cache["cache"].size,
          maxSize: cache["maxSize"],
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("무작위 인플루언서 수집 오류:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "무작위 인플루언서 데이터 수집 중 오류가 발생했습니다.",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
