import { google } from "googleapis";
import { GoogleInfluencerData } from "@/data/types";

// YouTube Data API v3 클라이언트 생성
function createYouTubeClient() {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY 환경 변수가 설정되지 않았습니다.");
  }

  return google.youtube({
    version: "v3",
    auth: apiKey,
  });
}

// YouTube 채널 정보를 가져오는 함수
export async function getYouTubeChannelInfo(channelId: string) {
  try {
    const youtube = createYouTubeClient();

    // 채널 정보 가져오기
    const channelResponse = await youtube.channels.list({
      part: ["snippet", "statistics"],
      id: [channelId],
    });

    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      throw new Error(`채널을 찾을 수 없습니다: ${channelId}`);
    }

    const channel = channelResponse.data.items[0];
    const snippet = channel.snippet;
    const statistics = channel.statistics;

    return {
      id: channel.id!,
      title: snippet?.title || "",
      description: snippet?.description || "",
      customUrl: snippet?.customUrl || "",
      publishedAt: snippet?.publishedAt || "",
      thumbnails: snippet?.thumbnails || {},
      subscriberCount: parseInt(statistics?.subscriberCount || "0"),
      videoCount: parseInt(statistics?.videoCount || "0"),
      viewCount: parseInt(statistics?.viewCount || "0"),
    };
  } catch (error) {
    console.error("YouTube 채널 정보 조회 오류:", error);
    throw error;
  }
}

// YouTube 채널의 최근 비디오들을 가져오는 함수 (정확성 개선)
export async function getYouTubeChannelVideos(channelId: string, maxResults: number = 5) {
  try {
    const youtube = createYouTubeClient();

    // 채널의 업로드 플레이리스트 ID 가져오기
    const channelResponse = await youtube.channels.list({
      part: ["contentDetails"],
      id: [channelId],
    });

    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      throw new Error(`채널을 찾을 수 없습니다: ${channelId}`);
    }

    const uploadsPlaylistId =
      channelResponse.data.items[0].contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      throw new Error("업로드 플레이리스트를 찾을 수 없습니다.");
    }

    // 플레이리스트의 비디오들 가져오기 (더 많은 결과를 가져와서 필터링)
    const videosResponse = await youtube.playlistItems.list({
      part: ["snippet"],
      playlistId: uploadsPlaylistId,
      maxResults: maxResults * 3, // 더 많은 결과를 가져와서 필터링
    });

    if (!videosResponse.data.items) {
      return [];
    }

    // 각 비디오의 상세 정보 가져오기
    const videoIds = videosResponse.data.items
      .map((item) => item.snippet?.resourceId?.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) {
      return [];
    }

    const videosDetailsResponse = await youtube.videos.list({
      part: ["snippet", "statistics"],
      id: videoIds.filter(Boolean) as string[],
    });

    if (!videosDetailsResponse.data.items) {
      return [];
    }

    // 영상 필터링 및 정확성 검증
    const filteredVideos = videosDetailsResponse.data.items
      .filter((video) => {
        // 1. 채널 ID가 일치하는지 확인 (채널 소유자 영상만)
        const videoChannelId = video.snippet?.channelId;
        if (videoChannelId !== channelId) {
          console.log(`영상 ${video.id}는 다른 채널(${videoChannelId})의 영상입니다. 제외합니다.`);
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
      .slice(0, maxResults) // 최종적으로 요청된 개수만큼만 반환
      .map((video) => ({
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
  } catch (error) {
    console.error("YouTube 채널 비디오 조회 오류:", error);
    throw error;
  }
}

// YouTube 채널을 검색하는 함수
export async function searchYouTubeChannels(query: string, maxResults: number = 10) {
  try {
    const youtube = createYouTubeClient();

    const searchResponse = await youtube.search.list({
      part: ["snippet"],
      q: query,
      type: ["channel"],
      maxResults,
    });

    if (!searchResponse.data.items) {
      return [];
    }

    // 각 채널의 상세 정보 가져오기
    const channelIds = searchResponse.data.items
      .map((item) => item.snippet?.channelId)
      .filter(Boolean);

    if (channelIds.length === 0) {
      return [];
    }

    const channelsResponse = await youtube.channels.list({
      part: ["snippet", "statistics"],
      id: channelIds.filter(Boolean) as string[],
    });

    return (
      channelsResponse.data.items?.map((channel) => ({
        id: channel.id!,
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
  } catch (error) {
    console.error("YouTube 채널 검색 오류:", error);
    throw error;
  }
}

// YouTube 데이터를 GoogleInfluencerData 형식으로 변환하는 함수
export function convertYouTubeToInfluencerData(
  channelData: Record<string, unknown>,
  videosData: Record<string, unknown>[] = [],
): GoogleInfluencerData {
  // 평균 조회수 계산
  const avgViews =
    videosData.length > 0
      ? Math.round(
          videosData.reduce((sum, video) => sum + ((video.viewCount as number) || 0), 0) /
            videosData.length,
        )
      : 0;

  // 평균 좋아요 수 계산
  const avgLikes =
    videosData.length > 0
      ? Math.round(
          videosData.reduce((sum, video) => sum + ((video.likeCount as number) || 0), 0) /
            videosData.length,
        )
      : 0;

  // 참여율 계산 (평균 좋아요 수 / 평균 조회 수 * 100)
  const engagementRate = avgViews > 0 ? (avgLikes / avgViews) * 100 : 0;

  return {
    name: channelData.title as string,
    handle: (channelData.customUrl as string) || (channelData.id as string),
    platform: "youtube",
    followers: channelData.subscriberCount as number,
    engagement_rate: Math.round(engagementRate * 100) / 100, // 소수점 둘째 자리까지
    avg_likes: avgLikes,
    categories: ["YouTube", "Content Creator"], // 기본 카테고리
    verified: false, // YouTube API에서 직접 확인할 수 없으므로 기본값
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    profile_image_url:
      (channelData.thumbnails as any)?.high?.url || (channelData.thumbnails as any)?.default?.url,
    bio: channelData.description as string,
    location: "", // YouTube API에서 직접 제공하지 않음
  };
}

// 인기 YouTube 채널들을 가져오는 함수 (예시)
export async function getPopularYouTubeChannels(): Promise<GoogleInfluencerData[]> {
  try {
    // 인기 채널 검색 키워드들
    const searchQueries = [
      "beauty influencer",
      "fashion influencer",
      "lifestyle vlogger",
      "tech reviewer",
      "gaming channel",
      "cooking channel",
      "travel vlogger",
      "fitness influencer",
    ];

    const allChannels: GoogleInfluencerData[] = [];

    for (const query of searchQueries) {
      try {
        const channels = await searchYouTubeChannels(query, 3);

        for (const channel of channels) {
          try {
            // 각 채널의 최근 비디오들 가져오기
            const videos = await getYouTubeChannelVideos(channel.id, 5);

            // 데이터 변환
            const influencerData = convertYouTubeToInfluencerData(channel, videos);
            allChannels.push(influencerData);

            // API 호출 제한을 고려한 지연
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
  } catch (error) {
    console.error("인기 YouTube 채널 조회 오류:", error);
    throw error;
  }
}
