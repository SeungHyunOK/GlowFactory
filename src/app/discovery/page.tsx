"use client";
import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useInfluencers } from "@/hooks/useInfluencers";
import { Influencer, YouTubeVideo } from "@/data/types";

export default function DiscoveryPage() {
  // 플랫폼 필터 (YouTube만)
  const [platformSelected, setPlatformSelected] = useState({
    youtube: true, // YouTube만 기본 활성화
  });

  // 검색 및 정렬
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("followers");

  // 팔로워 범위 필터
  const [followerRange, setFollowerRange] = useState({
    min: 0,
    max: 50000000,
  });

  // 참여율 범위 필터
  const [engagementRange, setEngagementRange] = useState({
    min: 0,
    max: 100,
  });

  // 카테고리 필터
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // 연령대 필터 (향후 사용 예정)
  // const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);

  // 빠른 필터
  const [quickFilter, setQuickFilter] = useState("all");

  // 인증된 인플루언서만
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);

  const { influencers, loading, error, refetch, syncFromGoogle } = useInfluencers();

  const youtubeActive = platformSelected.youtube;

  const baseBtn = "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs";
  const activeBtn = "bg-slate-900 text-white border-slate-900";
  const inactiveBtnPrimary = "bg-white text-slate-700";

  const Icon = ({ src, active }: { src: string; active: boolean }) => {
    return (
      <span
        aria-hidden
        className={`inline-block size-3 ${active ? "bg-white" : "bg-slate-600"}`}
        style={{
          maskImage: `url(${src})`,
          WebkitMaskImage: `url(${src})`,
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
          maskSize: "contain",
          WebkitMaskSize: "contain",
        }}
      />
    );
  };

  // 모든 카테고리 추출
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    influencers.forEach((influencer) => {
      influencer.categories.forEach((category) => categories.add(category));
    });
    return Array.from(categories).sort();
  }, [influencers]);

  // 필터링된 인플루언서 목록
  const filteredInfluencers = useMemo(() => {
    return influencers.filter((influencer) => {
      // 플랫폼 필터 (YouTube만)
      if (youtubeActive && influencer.platform !== "youtube") return false;

      // 검색어 필터
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          influencer.name.toLowerCase().includes(query) ||
          influencer.handle.toLowerCase().includes(query) ||
          influencer.categories.some((cat) => cat.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // 팔로워 범위 필터
      if (influencer.followers < followerRange.min || influencer.followers > followerRange.max) {
        return false;
      }

      // 참여율 범위 필터
      if (
        influencer.engagement_rate < engagementRange.min ||
        influencer.engagement_rate > engagementRange.max
      ) {
        return false;
      }

      // 카테고리 필터
      if (selectedCategories.length > 0) {
        const hasMatchingCategory = influencer.categories.some((category) =>
          selectedCategories.includes(category),
        );
        if (!hasMatchingCategory) return false;
      }

      // 인증된 인플루언서만 필터
      if (verifiedOnly && !influencer.verified) {
        return false;
      }

      // 빠른 필터
      switch (quickFilter) {
        case "micro":
          if (influencer.followers < 10000 || influencer.followers > 50000) return false;
          break;
        case "mid":
          if (influencer.followers < 50000 || influencer.followers > 500000) return false;
          break;
        case "macro":
          if (influencer.followers < 500000) return false;
          break;
        case "verified":
          if (!influencer.verified) return false;
          break;
      }

      return true;
    });
  }, [
    influencers,
    youtubeActive,
    searchQuery,
    followerRange,
    engagementRange,
    selectedCategories,
    verifiedOnly,
    quickFilter,
  ]);

  // 정렬
  const sortedInfluencers = useMemo(() => {
    return [...filteredInfluencers].sort((a, b) => {
      switch (sortBy) {
        case "followers":
          return b.followers - a.followers;
        case "engagement":
          return b.engagement_rate - a.engagement_rate;
        case "avg_likes":
          return b.avg_likes - a.avg_likes;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [filteredInfluencers, sortBy]);

  // 숫자 포맷팅 함수
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // 인플루언서 카드 컴포넌트 (React.memo로 최적화)
  const InfluencerCard = React.memo(({ influencer }: { influencer: Influencer }) => (
    <article className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 h-full flex flex-col">
      <div className="p-4 flex flex-col h-full">
        {/* 프로필 섹션 */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100">
              {influencer.profile_image_url ? (
                <Image
                  src={influencer.profile_image_url}
                  alt={influencer.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-600 font-semibold text-xs"
                style={{ display: influencer.profile_image_url ? "none" : "flex" }}
              >
                {influencer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
            </div>
            {influencer.verified && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate text-sm">{influencer.name}</h3>
            <p className="text-xs text-slate-500 truncate">@{influencer.handle}</p>
          </div>
        </div>

        {/* 카테고리 태그 */}
        <div className="flex flex-wrap gap-1 mb-3">
          {influencer.categories.slice(0, 2).map((category, index) => (
            <span
              key={index}
              className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs"
            >
              {category}
            </span>
          ))}
          {influencer.categories.length > 2 && (
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">
              +{influencer.categories.length - 2}
            </span>
          )}
        </div>

        {/* 통계 섹션 */}
        <div className="grid grid-cols-3 gap-2 mb-3 flex-1">
          <div className="text-center">
            <div className="text-sm font-bold text-slate-900">
              {formatNumber(influencer.followers)}
            </div>
            <div className="text-xs text-slate-500">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-slate-900">{influencer.engagement_rate}%</div>
            <div className="text-xs text-slate-500">Engagement</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-slate-900">
              {formatNumber(influencer.avg_likes)}
            </div>
            <div className="text-xs text-slate-500">Avg Likes</div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2 mt-auto">
          <button
            type="button"
            className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
          >
            Add to Campaign
          </button>
          <button
            type="button"
            onClick={() => setSelectedInfluencer(influencer)}
            className="flex-1 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors"
          >
            View Profile
          </button>
        </div>
      </div>
    </article>
  ));
  InfluencerCard.displayName = "InfluencerCard";

  // 인플루언서 상세 정보 모달
  const InfluencerModal = ({
    influencer,
    onClose,
  }: {
    influencer: Influencer;
    onClose: () => void;
  }) => {
    // 영상 재생 상태 관리
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
    // 실제 YouTube 영상 데이터 사용
    const recentVideos = influencer.recent_videos || [];

    // 디버깅을 위한 콘솔 로그
    console.log(`인플루언서 ${influencer.name}의 영상 데이터:`, {
      hasRecentVideos: !!influencer.recent_videos,
      recentVideosCount: recentVideos.length,
      recentVideos: recentVideos,
    });

    // YouTube 영상을 RecentPost 형식으로 변환
    const recentPosts = recentVideos.map((video: YouTubeVideo) => ({
      id: video.id,
      title: video.title,
      thumbnail_url:
        video.thumbnails?.high?.url ||
        video.thumbnails?.medium?.url ||
        video.thumbnails?.default?.url ||
        "/images/step1_influencer.png",
      views: video.viewCount,
      likes: video.likeCount,
      comments: video.commentCount,
      published_at: new Date(video.publishedAt).toLocaleDateString("ko-KR"),
      url: `https://www.youtube.com/watch?v=${video.id}`,
      video_id: video.id,
      description: video.description,
    }));

    // 실제 YouTube API 데이터만 사용 (가짜 데이터 제거)
    const realData = {
      // 실제 평균 조회수 계산 (최근 영상 기반)
      avg_views:
        recentPosts.length > 0
          ? Math.round(recentPosts.reduce((sum, post) => sum + post.views, 0) / recentPosts.length)
          : 0,

      // 실제 평균 댓글 수 계산 (최근 영상 기반)
      avg_comments:
        recentPosts.length > 0
          ? Math.round(
              recentPosts.reduce((sum, post) => sum + post.comments, 0) / recentPosts.length,
            )
          : 0,

      // 실제 최근 영상 데이터
      recent_posts: recentPosts,

      // 실제 인구통계 데이터 (DB에 저장된 것만 사용)
      follower_demographics: influencer.follower_demographics || null,

      // 실제 국가별 분석 데이터 (DB에 저장된 것만 사용)
      follower_analytics: influencer.follower_analytics || null,
    };

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">인플루언서 상세 분석</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="p-6">
            {/* 프로필 헤더 */}
            <div className="flex items-start gap-6 mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                  {influencer.profile_image_url ? (
                    <Image
                      src={influencer.profile_image_url}
                      alt={influencer.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-600 font-bold text-xl"
                    style={{ display: influencer.profile_image_url ? "none" : "flex" }}
                  >
                    {influencer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                </div>
                {influencer.verified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg font-bold">✓</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-3xl font-bold text-slate-900">{influencer.name}</h3>
                  {influencer.verified && (
                    <span className="text-blue-500 text-lg font-semibold">인증됨</span>
                  )}
                </div>
                <p className="text-slate-500 text-xl mb-4">@{influencer.handle}</p>

                {/* YouTube 프로필 링크 */}
                <div className="mb-4">
                  <a
                    href={`https://www.youtube.com/c/${influencer.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    YouTube 채널 보기
                  </a>
                </div>

                {/* 카테고리 */}
                <div className="flex flex-wrap gap-2">
                  {influencer.categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 핵심 통계 지표 */}
            <div className="mb-8">
              <h4 className="text-2xl font-bold text-slate-900 mb-6">핵심 통계</h4>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    {formatNumber(influencer.followers)}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">FOLLOWERS</div>
                </div>
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    {influencer.engagement_rate}%
                  </div>
                  <div className="text-sm text-slate-600 font-medium">ENGAGEMENT</div>
                </div>
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100">
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    {formatNumber(realData.avg_views)}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">AVG VIEWS</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {recentPosts.length > 0
                      ? `최근 ${recentPosts.length}개 영상 기준`
                      : "데이터 없음"}
                  </div>
                </div>
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100">
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    {formatNumber(influencer.avg_likes)}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">AVG LIKES</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {recentPosts.length > 0
                      ? `최근 ${recentPosts.length}개 영상 기준`
                      : "데이터 없음"}
                  </div>
                </div>
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100">
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    {formatNumber(realData.avg_comments)}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">AVG COMMENTS</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {recentPosts.length > 0
                      ? `최근 ${recentPosts.length}개 영상 기준`
                      : "데이터 없음"}
                  </div>
                </div>
              </div>
            </div>

            {/* 최근 영상 3개 */}
            <div className="mb-8">
              <h4 className="text-2xl font-bold text-slate-900 mb-6">최근 영상 3개</h4>

              {/* 선택된 영상 임베드 */}
              {selectedVideo && (
                <div className="mb-6">
                  <div className="bg-black rounded-xl overflow-hidden">
                    <iframe
                      width="100%"
                      height="400"
                      src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&rel=0`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full"
                    ></iframe>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-sm text-slate-600">영상이 재생 중입니다</p>
                    <button
                      onClick={() => setSelectedVideo(null)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              )}

              {/* 영상 목록 */}
              {realData.recent_posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {realData.recent_posts.map((post, index) => (
                    <div
                      key={post.id}
                      className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer group ${
                        selectedVideo === (post as { video_id: string }).video_id
                          ? "border-red-500 shadow-lg ring-2 ring-red-200"
                          : "border-slate-200 hover:shadow-lg"
                      }`}
                      onClick={() => setSelectedVideo((post as { video_id: string }).video_id)}
                    >
                      <div className="relative">
                        <div className="aspect-video bg-slate-200">
                          <Image
                            src={post.thumbnail_url}
                            alt={post.title}
                            width={400}
                            height={225}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="absolute top-3 left-3">
                          <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                            #{index + 1}
                          </span>
                        </div>
                        {selectedVideo !== (post as { video_id: string }).video_id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-white ml-1"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        )}
                        {selectedVideo === (post as { video_id: string }).video_id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-600/20">
                            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-white"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h5
                          className={`font-semibold mb-3 line-clamp-2 text-sm transition-colors ${
                            selectedVideo === (post as { video_id: string }).video_id
                              ? "text-red-600"
                              : "text-slate-900 group-hover:text-red-600"
                          }`}
                        >
                          {post.title}
                        </h5>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="text-center">
                            <div className="font-bold text-slate-900">
                              {formatNumber(post.views)}
                            </div>
                            <div className="text-slate-500">조회</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-slate-900">
                              {formatNumber(post.likes)}
                            </div>
                            <div className="text-slate-500">좋아요</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-slate-900">
                              {formatNumber(post.comments)}
                            </div>
                            <div className="text-slate-500">댓글</div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-xs text-slate-500">{post.published_at}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl">
                  <div className="text-slate-400 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    최근 영상이 없습니다
                  </h3>
                  <p className="text-slate-500 text-sm">
                    이 인플루언서의 최근 영상 데이터를 불러오는 중입니다.
                  </p>
                </div>
              )}
            </div>

            {/* 인구통계 섹션 - 실제 데이터만 표시 */}
            {realData.follower_demographics && (
              <div className="mb-8">
                <h4 className="text-2xl font-bold text-slate-900 mb-6">인구통계</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 성별 및 연령대 */}
                  <div>
                    <h5 className="text-xl font-bold text-slate-900 mb-4">AGE AND GENDER</h5>
                    <div className="bg-slate-50 rounded-xl p-6">
                      <div className="mb-6">
                        <h6 className="font-semibold text-slate-700 mb-3">성별 분포</h6>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Male</span>
                            <span className="font-medium">
                              {realData.follower_demographics.gender.male}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-3">
                            <div
                              className="bg-blue-500 h-3 rounded-full"
                              style={{ width: `${realData.follower_demographics.gender.male}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Female</span>
                            <span className="font-medium">
                              {realData.follower_demographics.gender.female}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-3">
                            <div
                              className="bg-pink-500 h-3 rounded-full"
                              style={{ width: `${realData.follower_demographics.gender.female}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h6 className="font-semibold text-slate-700 mb-3">연령대 분포</h6>
                        <div className="space-y-2">
                          {Object.entries(realData.follower_demographics.age_groups).map(
                            ([age, percentage]) => (
                              <div key={age} className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">{age}세</span>
                                <span className="font-medium">{percentage}%</span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 상위 국가 */}
                  {realData.follower_analytics && (
                    <div>
                      <h5 className="text-xl font-bold text-slate-900 mb-4">TOP COUNTRIES</h5>
                      <div className="bg-slate-50 rounded-xl p-6">
                        <div className="space-y-4">
                          {realData.follower_analytics.top_countries.map((country, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                  {index + 1}
                                </div>
                                <span className="text-slate-700 font-medium">
                                  {country.country}
                                </span>
                              </div>
                              <span className="font-bold text-lg text-slate-900">
                                {country.percentage}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 인구통계 데이터가 없는 경우 */}
            {!realData.follower_demographics && (
              <div className="mb-8">
                <h4 className="text-2xl font-bold text-slate-900 mb-6">인구통계</h4>
                <div className="bg-slate-50 rounded-xl p-8 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h5 className="text-lg font-semibold text-slate-700 mb-2">
                    인구통계 데이터 없음
                  </h5>
                  <p className="text-slate-500 text-sm">
                    이 인플루언서의 인구통계 데이터가 수집되지 않았습니다.
                    <br />
                    YouTube Analytics API를 통해 실제 데이터를 수집할 수 있습니다.
                  </p>
                </div>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex gap-4 pt-8 border-t border-slate-200">
              <button
                type="button"
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                캠페인에 추가
              </button>
              <button
                type="button"
                className="flex-1 border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
              >
                연락하기
              </button>
              <button
                type="button"
                className="px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
              >
                북마크
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30"
      role="main"
    >
      <div className="mx-auto max-w-7xl p-6">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="space-y-6 rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-lg border border-white/20 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-24px)] lg:overflow-auto">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 text-sm">🔍</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Filters</h2>
            </div>

            {/* 플랫폼 필터 (YouTube만) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Platform</span>
                <span className="text-xs text-slate-400">(YouTube only)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-pressed={youtubeActive}
                  onClick={() => setPlatformSelected((s) => ({ ...s, youtube: !s.youtube }))}
                  className={`${baseBtn} ${youtubeActive ? activeBtn : `${inactiveBtnPrimary}`}`}
                >
                  <Icon src="/icons/youtube.svg" active={youtubeActive} />
                  YouTube
                </button>
              </div>
            </div>

            {/* 팔로워 범위 필터 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Followers</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Min: {formatNumber(followerRange.min)}</span>
                  <span>Max: {formatNumber(followerRange.max)}</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Minimum</label>
                    <input
                      type="range"
                      min="0"
                      max="50000000"
                      step="100000"
                      value={followerRange.min}
                      onChange={(e) =>
                        setFollowerRange((prev) => ({ ...prev, min: parseInt(e.target.value) }))
                      }
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Maximum</label>
                    <input
                      type="range"
                      min="0"
                      max="50000000"
                      step="100000"
                      value={followerRange.max}
                      onChange={(e) =>
                        setFollowerRange((prev) => ({ ...prev, max: parseInt(e.target.value) }))
                      }
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 참여율 범위 필터 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Engagement Rate</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Min: {engagementRange.min.toFixed(1)}%</span>
                  <span>Max: {engagementRange.max.toFixed(1)}%</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Minimum</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={engagementRange.min}
                      onChange={(e) =>
                        setEngagementRange((prev) => ({ ...prev, min: parseFloat(e.target.value) }))
                      }
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Maximum</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={engagementRange.max}
                      onChange={(e) =>
                        setEngagementRange((prev) => ({ ...prev, max: parseFloat(e.target.value) }))
                      }
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 카테고리 필터 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Categories</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto">
                {allCategories.length > 0 ? (
                  allCategories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-3 text-sm hover:bg-white rounded-lg p-2 -m-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories((prev) => [...prev, category]);
                          } else {
                            setSelectedCategories((prev) => prev.filter((cat) => cat !== category));
                          }
                        }}
                        className="size-4 rounded border-slate-300 accent-indigo-600"
                      />
                      <span className="text-slate-700">{category}</span>
                      <span className="ml-auto text-xs text-slate-400">
                        ({influencers.filter((inf) => inf.categories.includes(category)).length})
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-2">No categories available</p>
                )}
              </div>
            </div>

            {/* 인증된 인플루언서만 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Verification</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <label className="flex items-center gap-3 text-sm hover:bg-white rounded-lg p-2 -m-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="size-4 rounded border-slate-300 accent-indigo-600"
                  />
                  <span className="text-slate-700">Verified Only</span>
                  <span className="ml-auto text-xs text-slate-400">
                    ({influencers.filter((inf) => inf.verified).length})
                  </span>
                </label>
              </div>
            </div>

            {/* 필터 초기화 */}
            <div className="pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setFollowerRange({ min: 0, max: 50000000 });
                  setEngagementRange({ min: 0, max: 100 });
                  setSelectedCategories([]);
                  // setSelectedAgeGroups([]);
                  setQuickFilter("all");
                  setVerifiedOnly(false);
                  setSearchQuery("");
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors flex items-center justify-center gap-2"
              >
                <span>🔄</span>
                Clear All Filters
              </button>
            </div>
          </aside>

          <section className="space-y-6" aria-label="Results">
            <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-lg border border-white/20">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for influencers by name, handle, or keywords…"
                      aria-label="Search influencers"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-2xl border-2 border-slate-200/50 bg-white/80 backdrop-blur-sm px-6 py-4 pl-12 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 transition-all duration-200 shadow-sm hover:shadow-md"
                    />
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                      🔍
                    </span>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickFilter("all")}
                    className={`rounded-2xl px-5 py-3 text-sm font-bold transition-all duration-200 ${
                      quickFilter === "all"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        : "bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-slate-50 hover:shadow-md border border-slate-200/50"
                    }`}
                  >
                    All Influencers
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickFilter("micro")}
                    className={`rounded-2xl px-5 py-3 text-sm font-bold transition-all duration-200 ${
                      quickFilter === "micro"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        : "bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-slate-50 hover:shadow-md border border-slate-200/50"
                    }`}
                  >
                    Micro (10K–50K)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickFilter("mid")}
                    className={`rounded-2xl px-5 py-3 text-sm font-bold transition-all duration-200 ${
                      quickFilter === "mid"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        : "bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-slate-50 hover:shadow-md border border-slate-200/50"
                    }`}
                  >
                    Mid-tier (50K–500K)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickFilter("macro")}
                    className={`rounded-2xl px-5 py-3 text-sm font-bold transition-all duration-200 ${
                      quickFilter === "macro"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        : "bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-slate-50 hover:shadow-md border border-slate-200/50"
                    }`}
                  >
                    Macro (500K+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickFilter("verified")}
                    className={`rounded-2xl px-5 py-3 text-sm font-bold transition-all duration-200 ${
                      quickFilter === "verified"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        : "bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-slate-50 hover:shadow-md border border-slate-200/50"
                    }`}
                  >
                    Verified Only
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
                    <p className="text-sm font-medium text-slate-700">
                      {sortedInfluencers.length} influencers
                    </p>
                  </div>
                  <span className="text-slate-300">•</span>
                  <p className="text-sm text-slate-500">of {influencers.length} total</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Sort by:</span>
                    <select
                      className="rounded-2xl border-2 border-slate-200/50 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm font-bold focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 outline-none transition-all duration-200 shadow-sm hover:shadow-md"
                      aria-label="Sort influencers"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="followers">Followers</option>
                      <option value="engagement">Engagement Rate</option>
                      <option value="avg_likes">Avg. Likes</option>
                      <option value="name">Name</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="List view"
                      className="rounded-2xl border-2 border-slate-200/50 bg-white/80 backdrop-blur-sm p-3 text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-200"
                    >
                      ☰
                    </button>
                    <button
                      type="button"
                      aria-label="Grid view"
                      className="rounded-2xl border-2 border-slate-200/50 bg-white/80 backdrop-blur-sm p-3 text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-200"
                    >
                      ▦
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 로딩 상태 */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
                  <p className="mt-4 text-lg font-semibold text-slate-700">
                    인플루언서 데이터를 불러오는 중...
                  </p>
                  <p className="mt-2 text-sm text-slate-500">잠시만 기다려주세요</p>
                </div>
              </div>
            )}

            {/* 에러 상태 */}
            {error && (
              <div className="rounded-3xl bg-gradient-to-br from-red-50 to-pink-50 p-8 text-center border border-red-200/50">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-red-800 mb-2">데이터 로딩 오류</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={refetch}
                    className="rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 px-6 py-3 text-sm font-bold text-white hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    다시 시도
                  </button>
                  <button
                    onClick={syncFromGoogle}
                    className="rounded-2xl border-2 border-red-300 bg-white/80 backdrop-blur-sm px-6 py-3 text-sm font-bold text-red-600 hover:bg-red-50 hover:shadow-md transition-all duration-200"
                  >
                    구글에서 동기화
                  </button>
                </div>
              </div>
            )}

            {/* 데이터가 없을 때 */}
            {!loading && !error && sortedInfluencers.length === 0 && (
              <div className="rounded-3xl bg-gradient-to-br from-slate-50 to-indigo-50 p-12 text-center border border-slate-200/50">
                <div className="text-8xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  인플루언서 데이터가 없습니다
                </h3>
                <p className="text-slate-600 mb-8 text-lg">
                  Supabase 테이블을 먼저 설정하고 recent_videos 컬럼을 추가해주세요.
                </p>

                <div className="flex gap-4 justify-center mb-8">
                  <button
                    onClick={syncFromGoogle}
                    className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-4 text-sm font-bold text-white hover:from-slate-900 hover:to-black transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    구글에서 데이터 동기화
                  </button>
                  <button
                    onClick={refetch}
                    className="rounded-2xl border-2 border-slate-300 bg-white/80 backdrop-blur-sm px-8 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:shadow-md transition-all duration-200"
                  >
                    새로고침
                  </button>
                </div>

                <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 text-left border border-white/20">
                  <h4 className="font-bold text-slate-800 mb-4 text-lg">📋 설정 방법:</h4>
                  <ol className="text-sm text-slate-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="bg-indigo-100 text-indigo-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        1
                      </span>
                      Supabase 대시보드 → SQL Editor로 이동
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-indigo-100 text-indigo-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                      <code className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-lg font-mono text-xs">
                        create_influencers_table.sql
                      </code>{" "}
                      파일의 SQL 실행
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-indigo-100 text-indigo-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        3
                      </span>
                      <code className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-lg font-mono text-xs">
                        add_recent_videos_column.sql
                      </code>{" "}
                      파일의 SQL 실행 (영상 데이터용)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-indigo-100 text-indigo-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        4
                      </span>
                      <code className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-lg font-mono text-xs">
                        EDGE_FUNCTION_SETUP.md
                      </code>{" "}
                      파일을 참고하여 자동 동기화 설정
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-indigo-100 text-indigo-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        5
                      </span>
                      위의 &quot;새로고침&quot; 버튼을 클릭하세요
                    </li>
                  </ol>
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-xl">
                    <p className="text-sm text-green-800 font-semibold">
                      🚀 <strong>자동화:</strong> Edge Function을 설정하면 매일 자동으로 YouTube
                      데이터를 수집합니다!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 일반 인플루언서 목록 */}
            {!loading && !error && sortedInfluencers.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {sortedInfluencers.map((influencer) => (
                  <InfluencerCard key={influencer.id} influencer={influencer} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* 인플루언서 상세 모달 */}
      {selectedInfluencer && (
        <InfluencerModal
          influencer={selectedInfluencer}
          onClose={() => setSelectedInfluencer(null)}
        />
      )}
    </main>
  );
}
