export type Campaign = {
  id: string;
  title: string;
  summary: string;
  status: string;
  channels: string[];
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
};

// 인플루언서 데이터 타입
export type Influencer = {
  id: string;
  name: string;
  handle: string;
  platform: "instagram" | "tiktok" | "youtube";
  followers: number;
  engagement_rate: number;
  avg_likes: number;
  categories: string[];
  verified: boolean;
  profile_image_url?: string;
  bio?: string;
  location?: string;
  description?: string;
  total_views?: number;
  video_count?: number;
  created_at: string;
  updated_at: string;
  // 상세 정보 추가
  avg_reach?: number;
  avg_comments?: number;
  influence_score?: number;
  ad_score?: number;
  recent_posts?: RecentPost[];
  recent_videos?: YouTubeVideo[]; // YouTube 영상 정보 추가
  follower_demographics?: FollowerDemographics | null; // null 허용 (데이터 없음)
  follower_analytics?: FollowerAnalytics | null; // null 허용 (데이터 없음)
  profile_visits?: number;
  profile_clicks?: number;
  total_impressions?: number;
};

// 최근 게시물 타입 (YouTube 영상 정보 포함)
export type RecentPost = {
  id: string;
  title: string;
  thumbnail_url: string;
  views: number;
  likes: number;
  comments: number;
  published_at: string;
  url: string;
  video_id?: string;
  description?: string;
  thumbnails?: {
    default?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    high?: { url: string; width: number; height: number };
    standard?: { url: string; width: number; height: number };
    maxres?: { url: string; width: number; height: number };
  };
  channelId?: string;
};

// YouTube 영상 타입
export type YouTubeVideo = {
  id: string;
  title: string;
  description?: string;
  publishedAt: string;
  thumbnails?: {
    default?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    high?: { url: string; width: number; height: number };
    standard?: { url: string; width: number; height: number };
    maxres?: { url: string; width: number; height: number };
  };
  viewCount: number;
  likeCount: number;
  commentCount: number;
  channelId?: string;
};

// 팔로워 인구통계 타입
export type FollowerDemographics = {
  gender: {
    male: number;
    female: number;
    other: number;
  };
  age_groups: {
    "13-17": number;
    "18-24": number;
    "25-34": number;
    "35-44": number;
    "45-54": number;
    "55+": number;
  };
};

// 팔로워 분석 타입
export type FollowerAnalytics = {
  hourly_distribution: { hour: number; count: number }[];
  top_countries: { country: string; percentage: number }[];
  top_cities: { city: string; percentage: number }[];
};

// 구글 API에서 가져온 인플루언서 데이터 타입
export type GoogleInfluencerData = {
  name: string;
  handle: string;
  platform: string;
  followers: number;
  engagement_rate: number;
  avg_likes: number;
  categories: string[];
  verified: boolean;
  profile_image_url?: string;
  bio?: string;
  location?: string;
};
