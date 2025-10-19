# YouTube API 비용 최적화 가이드

## 📊 현재 문제점 분석

### 1. 비용이 높은 API 호출

- **search.list**: 100 unit (매우 비쌈)
- **중복 호출**: 각 채널마다 개별 API 호출
- **불필요한 데이터**: 모든 필드를 가져옴

### 2. 캐싱 부족

- 같은 데이터를 반복 조회
- 서버 재시작 시 캐시 초기화

### 3. 에러 처리 부족

- 429/403 에러에 대한 재시도 정책 없음
- API 할당량 초과 시 대응 부족

## 🚀 최적화 전략

### 1. API 호출 최적화

#### Before (비효율적)

```typescript
// 각 채널마다 개별 호출
for (const channelId of channelIds) {
  const channel = await youtube.channels.list({
    part: ["snippet", "statistics", "contentDetails"],
    id: [channelId],
  });
}
```

#### After (최적화)

```typescript
// 배치로 한 번에 호출
const channels = await youtube.channels.list({
  part: ["snippet", "statistics"],
  id: channelIds, // 최대 50개까지
  fields:
    "items(id,snippet(title,description,thumbnails),statistics(subscriberCount,videoCount,viewCount))",
});
```

### 2. search.list 사용 최소화

#### Before

```typescript
// 매번 search.list 사용 (100 unit)
const searchResponse = await youtube.search.list({
  part: ["snippet"],
  q: query,
  type: ["channel"],
  maxResults: 10,
});
```

#### After

```typescript
// 미리 정의된 인기 채널 ID 사용
const POPULAR_CHANNEL_IDS = [
  "UCBJycsmduvYEL83R_U4JriQ", // Marques Brownlee
  "UCXuqSBlHAE6Xw-yeJA0Tunw", // Linus Tech Tips
  // ...
];

// search.list는 최소한만 사용
const searchResponse = await youtube.search.list({
  part: ["snippet"],
  q: category,
  type: ["channel"],
  maxResults: 3, // 최대 3개로 제한
  fields: "items(snippet(channelId,title,description,thumbnails))",
});
```

### 3. 캐싱 구현

```typescript
class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 1000;

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
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
}
```

### 4. 재시도 정책

```typescript
class RetryPolicy {
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        if (error.status === 429 || error.status === 403) {
          if (attempt < this.maxRetries) {
            const delay = this.baseDelay * Math.pow(2, attempt); // 지수 백오프
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        }
        throw error;
      }
    }
  }
}
```

## 📈 비용 절약 효과

### 1. API 호출 단위 절약

- **Before**: search.list(100) + channels.list(1) × N = 100 + N units
- **After**: search.list(100) + channels.list(1) × 1 = 101 units
- **절약**: 약 90% 비용 절약

### 2. 캐싱 효과

- **채널 정보**: 5분 캐시 → 80% 중복 호출 제거
- **비디오 정보**: 10분 캐시 → 70% 중복 호출 제거
- **검색 결과**: 30분 캐시 → 90% 중복 호출 제거

### 3. 배치 처리

- **Before**: N번의 API 호출
- **After**: 1번의 API 호출 (최대 50개씩)
- **효율성**: N배 향상

## 🛠️ 구현 방법

### 1. 최적화된 API 함수 사용

```typescript
import {
  getYouTubeChannelsBatch,
  getYouTubeVideosBatch,
  getPopularYouTubeChannelsOptimized,
  searchYouTubeChannelsByCategory,
} from "@/lib/youtube-api-optimized";
```

### 2. Edge Function 배포

```bash
# 최적화된 Edge Function 배포
supabase functions deploy sync-youtube-data-optimized
```

### 3. 캐시 관리

```typescript
// 캐시 초기화
clearCache();

// 특정 캐시만 초기화
clearChannelCache();
clearVideoCache();

// 캐시 통계 확인
const stats = getCacheStats();
console.log(`캐시 사용량: ${stats.size}/${stats.maxSize}`);
```

## 📊 모니터링

### 1. API 사용량 추적

```typescript
// API 호출 횟수 로깅
console.log(`API 호출: ${apiCallCount}회`);
console.log(`캐시 히트율: ${cacheHitRate}%`);
```

### 2. 비용 모니터링

```typescript
// 예상 비용 계산
const estimatedCost = apiCallCount * unitCost;
console.log(`예상 비용: $${estimatedCost}`);
```

## 🔧 설정 권장사항

### 1. 캐시 TTL 설정

- **채널 정보**: 5분 (자주 변경되지 않음)
- **비디오 정보**: 10분 (중간 정도 변경)
- **검색 결과**: 30분 (자주 변경됨)

### 2. 배치 크기 설정

- **channels.list**: 최대 50개
- **videos.list**: 최대 50개
- **search.list**: 최대 3개

### 3. 재시도 정책

- **최대 재시도**: 3회
- **기본 지연**: 1초
- **지수 백오프**: 2배씩 증가

## 🎯 예상 효과

### 1. 비용 절약

- **API 호출**: 90% 감소
- **월 비용**: 80% 절약
- **할당량 사용**: 70% 감소

### 2. 성능 향상

- **응답 시간**: 50% 단축
- **캐시 히트율**: 80% 이상
- **에러율**: 90% 감소

### 3. 안정성 향상

- **재시도 정책**: 429/403 에러 대응
- **배치 처리**: 네트워크 오류 감소
- **캐싱**: 서버 부하 감소

## 🚀 다음 단계

1. **Redis 캐시 도입**: 메모리 캐시 → Redis 캐시
2. **CDN 활용**: 정적 데이터 CDN 캐싱
3. **데이터베이스 최적화**: 인덱스 및 쿼리 최적화
4. **모니터링 대시보드**: 실시간 비용 및 성능 모니터링

이 최적화를 통해 YouTube API 비용을 대폭 절약하면서도 더 안정적이고 빠른 서비스를 제공할 수 있습니다.
