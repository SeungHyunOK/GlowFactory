# Gemini API 설정 가이드

## 🔧 환경 변수 설정

### 1. Google AI API 키 발급

1. [Google AI Studio](https://aistudio.google.com/) 방문
2. Google 계정으로 로그인
3. "Get API Key" 클릭
4. 새 API 키 생성
5. API 키 복사

### 2. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수 추가:

```bash
# Google AI (Gemini) API
GOOGLE_AI_API_KEY=your_gemini_api_key_here

# YouTube Data API (이미 설정되어 있어야 함)
GOOGLE_API_KEY=your_youtube_api_key_here
```

### 3. 환경 변수 확인

터미널에서 다음 명령어로 환경 변수가 제대로 설정되었는지 확인:

```bash
# Next.js 개발 서버 재시작
npm run dev

# 또는 환경 변수 직접 확인
echo $GOOGLE_AI_API_KEY
```

### 3. Supabase 환경 변수 설정

Supabase 프로젝트 → Settings → Edge Functions → Environment Variables에서:

```
GOOGLE_AI_API_KEY=your_gemini_api_key_here
GOOGLE_API_KEY=your_youtube_api_key_here
```

## 🚀 새로운 검색 플로우

### 1. DB 우선 검색

```
사용자 쿼리 → DB 검색 → 결과 있음 → 기존 데이터 반환
```

### 2. Gemini + YouTube API 검색

```
DB에 없음 → Gemini API → 인플루언서 이름 추출 → YouTube API → 채널 정보 + 영상 정보 → DB 저장 → 사용자에게 표시
```

## 📊 검색 결과 소스

- **database**: 기존 DB에서 찾은 결과
- **gemini_youtube**: Gemini API + YouTube API로 새로 수집한 결과

## 🔍 디버깅

브라우저 개발자 도구 → Console에서 다음 로그 확인:

```
Gemini 검색 시작: "뷰티 인플루언서"
DB에서 기존 인플루언서 검색 중...
DB에 없음. Gemini API로 인플루언서 검색 중...
3명의 인플루언서 정보를 YouTube API로 수집 중...
3명의 인플루언서를 DB에 저장 중...
검색 완료: gemini_youtube에서 3명 발견
```

## ⚠️ 주의사항

1. **API 할당량**: Gemini API와 YouTube API 모두 할당량 제한이 있습니다
2. **응답 시간**: YouTube API 호출로 인해 검색 시간이 길어질 수 있습니다
3. **에러 처리**: API 호출 실패 시 적절한 에러 메시지가 표시됩니다

## 🎯 사용 예시

```
검색 쿼리: "뷰티 브랜드 런칭"
결과: Gemini가 추천한 뷰티 인플루언서들의 실제 YouTube 데이터
```

이제 AI 검색이 실제로 Gemini API를 사용하여 인플루언서를 찾고, YouTube API로 상세 정보를 수집합니다!
