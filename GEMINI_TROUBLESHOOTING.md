# Gemini API 문제 해결 가이드

## 🔍 404 오류 해결 방법

### 모델명 오류 (가장 흔한 원인)

- **오류**: `models/gemini-pro is not found`
- **해결**: `gemini-2.0-flash` 모델 사용 (v1beta API에서 지원됨)
- **사용 가능한 모델**: `gemini-2.0-flash`, `gemini-2.5-flash`, `gemini-2.0-pro-exp` 등

### 1. API 키 확인

```bash
# .env.local 파일 확인
cat .env.local

# 환경 변수가 제대로 로드되었는지 확인
echo $GOOGLE_AI_API_KEY
```

### 2. API 키 형식 확인

- API 키는 `AIza...` 형식이어야 합니다
- 공백이나 특수문자가 포함되지 않았는지 확인
- 따옴표로 감싸지 않았는지 확인

### 3. 올바른 API 키 발급

1. [Google AI Studio](https://aistudio.google.com/) 방문
2. "Get API Key" 클릭
3. "Create API Key" 선택
4. 새 프로젝트 생성 또는 기존 프로젝트 선택
5. API 키 복사

### 4. 환경 변수 재설정

```bash
# .env.local 파일 수정
GOOGLE_AI_API_KEY=AIzaSyC...your_actual_key_here

# 개발 서버 재시작
npm run dev
```

## 🚨 일반적인 오류들

### 404 Not Found

- **원인**: API 키가 잘못되었거나 권한이 없음
- **해결**: 새로운 API 키 발급

### 403 Forbidden

- **원인**: API 키에 Gemini API 권한이 없음
- **해결**: Google Cloud Console에서 API 활성화

### 429 Too Many Requests

- **원인**: API 할당량 초과
- **해결**: 잠시 후 재시도

## 🔧 디버깅 방법

### 1. 브라우저 개발자 도구

```
F12 → Console 탭에서 로그 확인:
- "Gemini API 호출 시작:" 로그 확인
- API 키가 제대로 로드되었는지 확인
```

### 2. 서버 로그 확인

```bash
# 터미널에서 Next.js 로그 확인
npm run dev
```

### 3. API 키 테스트

```bash
# curl로 API 키 테스트
curl -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY"
```

## ✅ 성공적인 설정 확인

다음 로그가 나타나면 성공:

```
Gemini API 호출 시작: {
  url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
  hasApiKey: true,
  query: "블랙코미디하는 인플루언서"
}
```

## 🆘 여전히 문제가 있다면

1. **API 키 재발급**: Google AI Studio에서 새 키 생성
2. **프로젝트 재시작**: `npm run dev` 재시작
3. **캐시 클리어**: 브라우저 캐시 삭제
4. **환경 변수 확인**: `.env.local` 파일 다시 확인
