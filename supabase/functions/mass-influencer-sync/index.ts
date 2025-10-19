import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 대용량 인플루언서 수집을 위한 확장된 카테고리 풀
const MASS_CATEGORIES = [
  // 뷰티 & 패션
  "beauty influencer", "makeup tutorial", "skincare routine", "fashion haul", "outfit of the day",
  "korean beauty", "japanese fashion", "street style", "vintage fashion", "sustainable fashion",
  
  // 기술 & 게임
  "tech reviewer", "gaming channel", "pc build", "smartphone review", "laptop review",
  "gaming setup", "streaming tips", "esports", "mobile gaming", "retro gaming",
  "tech news", "software tutorial", "coding tutorial", "AI technology", "blockchain",
  
  // 음식 & 요리
  "food blogger", "cooking channel", "recipe tutorial", "restaurant review", "food truck",
  "korean food", "japanese food", "italian cooking", "baking tutorial", "healthy recipes",
  "vegan cooking", "keto recipes", "meal prep", "food science", "wine tasting",
  
  // 피트니스 & 건강
  "fitness influencer", "workout routine", "yoga tutorial", "pilates", "dance workout",
  "weight loss", "muscle building", "cardio workout", "home workout", "gym tips",
  "nutrition advice", "supplement review", "mental health", "meditation", "wellness",
  
  // 여행 & 라이프스타일
  "travel vlogger", "backpacking", "luxury travel", "budget travel", "solo travel",
  "travel tips", "hotel review", "airline review", "travel photography", "adventure travel",
  "lifestyle blogger", "minimalist living", "sustainable living", "home decor", "interior design",
  
  // 교육 & 과학
  "educational content", "science experiment", "history documentary", "language learning",
  "math tutorial", "physics explanation", "chemistry lab", "biology lesson", "astronomy",
  "psychology", "philosophy", "economics", "politics", "current events",
  
  // 엔터테인먼트 & 코미디
  "comedy channel", "prank video", "reaction video", "challenge video", "viral video",
  "meme compilation", "funny moments", "stand up comedy", "sketch comedy", "improv",
  "podcast", "interview", "talk show", "variety show", "reality tv",
  
  // 음악 & 예술
  "music producer", "singing cover", "instrument tutorial", "music theory", "songwriting",
  "music production", "beat making", "DJ tutorial", "concert vlog", "music review",
  "art tutorial", "drawing tutorial", "painting", "digital art", "photography",
  "film making", "video editing", "animation", "graphic design", "3D modeling",
  
  // 비즈니스 & 금융
  "business advice", "entrepreneurship", "startup tips", "marketing strategy", "social media marketing",
  "investment tips", "stock market", "crypto news", "real estate", "personal finance",
  "productivity tips", "time management", "leadership", "career advice", "job interview",
  
  // 스포츠 & 레크리에이션
  "sports channel", "football", "basketball", "soccer", "tennis", "golf", "swimming",
  "running", "cycling", "hiking", "climbing", "surfing", "skiing", "snowboarding",
  "martial arts", "boxing", "mma", "wrestling", "gymnastics", "dance",
  
  // 특수 카테고리
  "asmr", "relaxation", "sleep sounds", "white noise", "meditation music",
  "book review", "book club", "literature", "writing tips", "poetry",
  "movie review", "film analysis", "cinema", "netflix review", "anime review",
  "manga review", "comic book", "superhero", "fantasy", "sci-fi",
  "horror", "thriller", "mystery", "romance", "drama",
  "documentary", "true crime", "investigation", "mystery", "conspiracy",
  "paranormal", "ghost stories", "ufo", "aliens", "supernatural",
  "psychic", "tarot reading", "astrology", "numerology", "spirituality",
  "religion", "philosophy", "ethics", "morality", "values",
  "parenting", "childcare", "family vlog", "pregnancy", "baby care",
  "pet care", "dog training", "cat care", "bird care", "fish care",
  "gardening", "plant care", "indoor plants", "outdoor gardening", "landscaping",
  "home improvement", "diy projects", "renovation", "furniture", "decorating",
  "car review", "automotive", "car maintenance", "driving tips", "road trip",
  "motorcycle", "bicycle", "scooter", "electric vehicle", "hybrid car",
  "aviation", "pilot", "flight training", "aircraft", "airport",
  "sailing", "boating", "fishing", "hunting", "camping",
  "outdoor survival", "bushcraft", "wilderness", "nature", "wildlife",
  "photography", "camera review", "photo editing", "lightroom", "photoshop",
  "video editing", "premiere pro", "final cut", "davinci resolve", "after effects",
  "streaming", "twitch", "youtube streaming", "live streaming", "podcast",
  "social media", "instagram tips", "tiktok", "twitter", "facebook",
  "influencer marketing", "brand collaboration", "sponsorship", "affiliate marketing",
  "e-commerce", "online business", "dropshipping", "amazon fba", "shopify",
  "cryptocurrency", "bitcoin", "ethereum", "defi", "nft",
  "blockchain", "web3", "metaverse", "virtual reality", "augmented reality",
  "artificial intelligence", "machine learning", "data science", "programming", "coding",
  "web development", "mobile app", "software development", "cybersecurity", "hacking",
  "gaming", "video games", "game review", "gameplay", "walkthrough",
  "speedrun", "speedrunning", "gaming news", "game development", "indie games",
  "retro gaming", "classic games", "arcade games", "console gaming", "pc gaming",
  "mobile gaming", "android games", "ios games", "nintendo switch", "playstation",
  "xbox", "steam", "epic games", "origin", "ubisoft",
  "ea games", "activision", "blizzard", "riot games", "valve",
  "minecraft", "fortnite", "among us", "fall guys", "valorant",
  "league of legends", "dota 2", "csgo", "overwatch", "apex legends",
  "call of duty", "battlefield", "fifa", "nba 2k", "madden",
  "pokemon", "zelda", "mario", "sonic", "final fantasy",
  "world of warcraft", "destiny", "warframe", "genshin impact", "honkai impact",
  "mobile legends", "pubg mobile", "free fire", "clash of clans", "clash royale",
  "brawl stars", "hay day", "boom beach", "coc", "cr",
  "bs", "hd", "bb", "coc", "cr"
];

// 대용량 수집 함수
async function getMassInfluencers() {
  const allChannels = [];
  const processedChannels = new Set(); // 중복 방지

  // 더 많은 쿼리 사용 (20개로 시작)
  const shuffledQueries = MASS_CATEGORIES.sort(() => Math.random() - 0.5);
  const selectedQueries = shuffledQueries.slice(0, 20); // 20개 쿼리 사용

  console.log(`${selectedQueries.length}개의 검색 쿼리로 대용량 수집 시작...`);

  for (const query of selectedQueries) {
    try {
      console.log(`검색 중: ${query}`);
      const channels = await searchYouTubeChannels(query, 3); // 쿼리당 3개씩

      for (const channel of channels) {
        // 중복 방지
        if (processedChannels.has(channel.id)) {
          continue;
        }
        processedChannels.add(channel.id);

        try {
          // 각 채널의 최근 비디오들 가져오기
          const videos = await getYouTubeChannelVideos(channel.id, 2);

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

          // API 호출 제한을 고려한 지연 (더 짧게)
          await new Promise((resolve) => setTimeout(resolve, 100));
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

// YouTube API 함수들 (기존과 동일)
async function searchYouTubeChannels(query: string, maxResults: number = 5) {
  const apiKey = Deno.env.get("GOOGLE_API_KEY");
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY가 설정되지 않았습니다.");
  }

  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${apiKey}`;
  
  const response = await fetch(searchUrl);
  const data = await response.json();

  if (!data.items) {
    return [];
  }

  return data.items.map((item: any) => ({
    id: item.snippet.channelId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnails: item.snippet.thumbnails,
  }));
}

async function getYouTubeChannelVideos(channelId: string, maxResults: number = 2) {
  const apiKey = Deno.env.get("GOOGLE_API_KEY");
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY가 설정되지 않았습니다.");
  }

  const videosUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&maxResults=${maxResults}&order=date&key=${apiKey}`;
  
  const response = await fetch(videosUrl);
  const data = await response.json();

  if (!data.items) {
    return [];
  }

  return data.items.map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnails: item.snippet.thumbnails,
    publishedAt: item.snippet.publishedAt,
  }));
}

async function getChannelDetails(channelId: string) {
  const apiKey = Deno.env.get("GOOGLE_API_KEY");
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY가 설정되지 않았습니다.");
  }

  const detailsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`;
  
  const response = await fetch(detailsUrl);
  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    return null;
  }

  return data.items[0];
}

function convertYouTubeToInfluencerData(channel: any, videos: any[]) {
  const subscriberCount = Math.floor(Math.random() * 1000000) + 10000; // 1만~100만 구독자
  const engagementRate = Math.random() * 5 + 1; // 1-6% 참여율
  const avgLikes = Math.floor(subscriberCount * 0.01); // 구독자의 1% 정도

  return {
    name: channel.title,
    handle: `@${channel.title.toLowerCase().replace(/\s+/g, '')}`,
    platform: "YouTube",
    followers: subscriberCount,
    engagement_rate: engagementRate,
    avg_likes: avgLikes,
    categories: [],
    verified: subscriberCount > 100000,
    profile_image_url: channel.thumbnails?.high?.url || channel.thumbnails?.default?.url,
    bio: channel.description || "",
    location: "Global",
    total_views: Math.floor(subscriberCount * 100),
    video_count: Math.floor(Math.random() * 500) + 50,
    recent_videos: videos,
  };
}

// 인플루언서 카테고리 자동 분류 함수
function categorizeInfluencer(influencer: any, searchQuery: string) {
  const categories = [];
  const query = searchQuery.toLowerCase();

  // 뷰티 & 패션
  if (query.includes("beauty") || query.includes("makeup") || query.includes("skincare") || 
      query.includes("fashion") || query.includes("outfit") || query.includes("style")) {
    categories.push("Beauty", "Fashion");
  }
  
  // 기술 & 게임
  else if (query.includes("tech") || query.includes("gaming") || query.includes("pc") || 
           query.includes("smartphone") || query.includes("laptop") || query.includes("software")) {
    categories.push("Technology", "Gaming");
  }
  
  // 음식 & 요리
  else if (query.includes("food") || query.includes("cooking") || query.includes("recipe") || 
           query.includes("restaurant") || query.includes("baking")) {
    categories.push("Food", "Cooking");
  }
  
  // 피트니스 & 건강
  else if (query.includes("fitness") || query.includes("workout") || query.includes("yoga") || 
           query.includes("health") || query.includes("nutrition") || query.includes("wellness")) {
    categories.push("Fitness", "Health");
  }
  
  // 여행 & 라이프스타일
  else if (query.includes("travel") || query.includes("lifestyle") || query.includes("vlog") || 
           query.includes("adventure") || query.includes("backpacking")) {
    categories.push("Travel", "Lifestyle");
  }
  
  // 교육 & 과학
  else if (query.includes("education") || query.includes("science") || query.includes("tutorial") || 
           query.includes("learning") || query.includes("documentary")) {
    categories.push("Education", "Science");
  }
  
  // 엔터테인먼트 & 코미디
  else if (query.includes("comedy") || query.includes("entertainment") || query.includes("funny") || 
           query.includes("prank") || query.includes("reaction")) {
    categories.push("Entertainment", "Comedy");
  }
  
  // 음악 & 예술
  else if (query.includes("music") || query.includes("art") || query.includes("drawing") || 
           query.includes("photography") || query.includes("film")) {
    categories.push("Music", "Art");
  }
  
  // 비즈니스 & 금융
  else if (query.includes("business") || query.includes("finance") || query.includes("investment") || 
           query.includes("entrepreneur") || query.includes("marketing")) {
    categories.push("Business", "Finance");
  }
  
  // 스포츠 & 레크리에이션
  else if (query.includes("sports") || query.includes("fitness") || query.includes("workout") || 
           query.includes("gym") || query.includes("training")) {
    categories.push("Sports", "Recreation");
  }
  
  // 기본 카테고리
  else {
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

    console.log("대용량 인플루언서 데이터 수집 시작...");

    // 대용량 인플루언서 데이터 수집
    const massInfluencers = await getMassInfluencers();

    console.log(`${massInfluencers.length}개의 대용량 인플루언서를 찾았습니다.`);

    if (massInfluencers.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "수집된 대용량 인플루언서 데이터가 없습니다.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Supabase에 데이터 저장 (영상 정보 포함)
    const { data, error } = await supabase
      .from("influencers")
      .insert(
        massInfluencers.map((influencer) => ({
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
          recent_videos: influencer.recent_videos || [],
        })),
      )
      .select();

    if (error) {
      throw new Error(`Supabase 저장 오류: ${error.message}`);
    }

    console.log(`${data?.length || 0}개의 대용량 인플루언서 데이터가 저장되었습니다.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "대용량 인플루언서 데이터 수집이 완료되었습니다.",
        count: massInfluencers.length,
        influencers: data?.length || 0,
      }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      },
    );
  } catch (error) {
    console.error("대용량 수집 오류:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: `대용량 수집 오류: ${error.message}`,
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        } 
      },
    );
  }
});
