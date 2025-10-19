# 환경변수 설정 가이드

## 📋 필요한 환경변수

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경변수들을 설정하세요:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# YouTube API 설정
GOOGLE_API_KEY=your_youtube_api_key_here

# Gemini AI API 설정
GOOGLE_AI_API_KEY=your_gemini_api_key_here

# Supabase 서비스 키 (서버 사이드용)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## 🔑 API 키 획득 방법

### 1. YouTube API 키

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "라이브러리" 이동
4. "YouTube Data API v3" 검색 후 활성화
5. "API 및 서비스" > "사용자 인증 정보" 이동
6. "사용자 인증 정보 만들기" > "API 키" 선택
7. 생성된 API 키를 `GOOGLE_API_KEY`에 설정

### 2. Gemini AI API 키

1. [Google AI Studio](https://aistudio.google.com/) 접속
2. "Get API Key" 클릭
3. 새 API 키 생성
4. 생성된 API 키를 `GOOGLE_AI_API_KEY`에 설정

### 3. Supabase 설정

1. [Supabase](https://supabase.com/) 접속
2. 프로젝트 생성 또는 기존 프로젝트 선택
3. "Settings" > "API" 이동
4. 다음 값들을 복사:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

## 🚀 설정 완료 후

1. 환경변수 설정 후 개발 서버 재시작:

   ```bash
   npm run dev
   ```

2. 데이터베이스에 `recent_videos` 컬럼 추가:

   ```sql
   -- Supabase SQL Editor에서 실행
   ALTER TABLE influencers
   ADD COLUMN IF NOT EXISTS recent_videos JSONB DEFAULT '[]'::jsonb;
   ```

3. Edge Functions 배포 (선택사항):
   ```bash
   supabase functions deploy sync-youtube-data
   supabase functions deploy random-influencer-sync
   ```

## ✅ 테스트 방법

1. Discovery 페이지에서 "AI 검색" 섹션 사용
2. "블랙코미디 인플루언서" 검색
3. 인플루언서 카드 클릭하여 상세 정보 확인
4. 최근 영상과 인구통계 데이터 확인

## 🔧 문제 해결

### 환경변수가 적용되지 않는 경우

1. 개발 서버 완전히 종료 후 재시작
2. `.env.local` 파일이 프로젝트 루트에 있는지 확인
3. 환경변수 이름이 정확한지 확인 (대소문자 구분)

### API 호출 실패 시

1. API 키가 올바른지 확인
2. API 할당량이 남아있는지 확인
3. 브라우저 개발자 도구에서 네트워크 탭 확인
