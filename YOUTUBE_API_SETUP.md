# YouTube Data API v3 설정 가이드

## 1. Google Cloud Console에서 API 키 생성

### 1단계: Google Cloud Console 접속

1. [Google Cloud Console](https://console.cloud.google.com/)에 로그인
2. 새 프로젝트 생성 또는 기존 프로젝트 선택

### 2단계: YouTube Data API v3 활성화

1. 왼쪽 메뉴에서 "API 및 서비스" → "라이브러리" 클릭
2. "YouTube Data API v3" 검색
3. "사용" 버튼 클릭하여 API 활성화

### 3단계: API 키 생성

1. "API 및 서비스" → "사용자 인증 정보" 클릭
2. "사용자 인증 정보 만들기" → "API 키" 선택
3. 생성된 API 키 복사

### 4단계: API 키 제한 설정 (권장)

1. 생성된 API 키 옆의 연필 아이콘 클릭
2. "애플리케이션 제한사항"에서 "HTTP 리퍼러" 선택
3. 도메인 추가 (예: `localhost:3000/*`, `yourdomain.com/*`)
4. "API 제한사항"에서 "키 제한" 선택
5. "YouTube Data API v3" 선택
6. "저장" 클릭

## 2. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google API 설정
GOOGLE_API_KEY=your_youtube_api_key_here
```

## 3. API 사용량 제한 확인

### 일일 할당량

- YouTube Data API v3는 기본적으로 일일 10,000 단위 할당량을 제공합니다.
- 각 API 호출은 다음과 같은 비용이 듭니다:
  - 채널 정보 조회: 1 단위
  - 비디오 목록 조회: 1 단위
  - 비디오 상세 정보 조회: 1 단위
  - 검색: 100 단위

### 할당량 증가 요청

1. Google Cloud Console → "API 및 서비스" → "할당량"
2. "YouTube Data API v3" 선택
3. "할당량 편집" 클릭
4. 필요한 할당량 요청

## 4. 테스트 방법

### 1단계: 개발 서버 실행

```bash
npm run dev
```

### 2단계: API 테스트

1. 브라우저에서 `http://localhost:3000/discovery` 접속
2. "구글에서 데이터 동기화" 버튼 클릭
3. YouTube 채널 데이터가 Supabase에 저장되는지 확인

### 3단계: 로그 확인

개발자 도구의 콘솔에서 YouTube API 호출 로그를 확인할 수 있습니다.

## 5. 문제 해결

### API 키 오류

```
Error: GOOGLE_API_KEY 환경 변수가 설정되지 않았습니다.
```

**해결 방법:** `.env.local` 파일에 `GOOGLE_API_KEY` 환경 변수를 올바르게 설정하세요.

### 할당량 초과 오류

```
Error: The request cannot be completed because you have exceeded your quota.
```

**해결 방법:**

1. Google Cloud Console에서 할당량 확인
2. 다음 날까지 기다리거나 할당량 증가 요청

### API 비활성화 오류

```
Error: YouTube Data API v3 has not been used in project.
```

**해결 방법:** Google Cloud Console에서 YouTube Data API v3를 활성화하세요.

## 6. 고급 설정

### 특정 채널 ID로 데이터 가져오기

```typescript
import { getYouTubeChannelInfo, getYouTubeChannelVideos } from "@/lib/youtube-api";

// 특정 채널 정보 가져오기
const channelInfo = await getYouTubeChannelInfo("UC_x5XG1OV2P6uZZ5FSM9Ttw");
const videos = await getYouTubeChannelVideos("UC_x5XG1OV2P6uZZ5FSM9Ttw", 10);
```

### 검색 키워드 커스터마이징

`src/lib/youtube-api.ts` 파일의 `getPopularYouTubeChannels` 함수에서 검색 키워드를 수정할 수 있습니다.

## 7. 보안 주의사항

1. **API 키 보안**: API 키를 공개 저장소에 커밋하지 마세요.
2. **도메인 제한**: 프로덕션 환경에서는 API 키에 도메인 제한을 설정하세요.
3. **할당량 모니터링**: API 사용량을 정기적으로 확인하세요.

## 8. 비용 최적화

1. **캐싱**: 자주 조회하는 데이터는 캐싱을 고려하세요.
2. **배치 처리**: 여러 요청을 한 번에 처리하세요.
3. **필요한 데이터만**: 필요한 필드만 요청하세요.
