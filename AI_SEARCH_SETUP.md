# AI 인플루언서 검색 설정 가이드

## 🤖 지원하는 AI 서비스

### 1. **OpenAI GPT-4** (권장)

- 가장 강력한 추천 성능
- 구조화된 JSON 응답 지원
- 높은 정확도

### 2. **Anthropic Claude**

- 안전하고 신뢰할 수 있는 AI
- 긴 컨텍스트 처리 우수
- 윤리적 AI 사용

### 3. **Google Gemini**

- 무료 사용량 제공
- 빠른 응답 속도
- Google 생태계 통합

## 🔧 환경변수 설정

### `.env.local` 파일에 추가:

```bash
# OpenAI (권장)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Anthropic Claude (대안)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here

# Google AI (대안)
GOOGLE_AI_API_KEY=your-google-ai-api-key-here
```

## 🚀 API 키 발급 방법

### 1. **OpenAI API 키 발급**

1. [OpenAI Platform](https://platform.openai.com/) 방문
2. 계정 생성 및 로그인
3. API Keys 섹션에서 새 키 생성
4. 사용량 제한 설정 (월 $5-20 권장)

### 2. **Anthropic API 키 발급**

1. [Anthropic Console](https://console.anthropic.com/) 방문
2. 계정 생성 및 로그인
3. API Keys에서 새 키 생성
4. 사용량 모니터링 설정

### 3. **Google AI API 키 발급**

1. [Google AI Studio](https://aistudio.google.com/) 방문
2. Google 계정으로 로그인
3. API 키 생성
4. 무료 사용량 확인

## 💰 비용 비교

### **OpenAI GPT-4**

- **입력**: $0.03/1K tokens
- **출력**: $0.06/1K tokens
- **월 예상 비용**: $10-30

### **Anthropic Claude**

- **입력**: $0.003/1K tokens
- **출력**: $0.015/1K tokens
- **월 예상 비용**: $5-15

### **Google Gemini**

- **무료 사용량**: 월 60회 요청
- **유료**: $0.0005/1K tokens
- **월 예상 비용**: $0-10

## 🛠️ 설정 단계

### 1. **환경변수 설정**

```bash
# .env.local 파일 생성
cp .env.example .env.local

# API 키 추가
echo "OPENAI_API_KEY=sk-your-key-here" >> .env.local
```

### 2. **개발 서버 재시작**

```bash
npm run dev
```

### 3. **테스트**

1. Discovery 페이지 방문
2. AI 검색 섹션에서 테스트 쿼리 입력
3. "뷰티 브랜드 런칭" 또는 "게임 마케팅" 검색

## 🔍 사용 예시

### **마케팅 목적별 검색 쿼리**

#### **뷰티 브랜드**

```
"새로운 뷰티 브랜드 런칭을 위한 인플루언서"
"화장품 마케팅 캠페인"
"스킨케어 제품 홍보"
```

#### **게임 마케팅**

```
"모바일 게임 출시 마케팅"
"게임 리뷰어 추천"
"게이밍 콘텐츠 크리에이터"
```

#### **패션 브랜드**

```
"패션 브랜드 협업"
"의류 마케팅"
"스타일 인플루언서"
```

#### **테크 제품**

```
"스마트폰 리뷰어"
"테크 가젯 마케팅"
"IT 제품 홍보"
```

## 📊 AI 추천 로직

### **1단계: 쿼리 분석**

- 마케팅 목적 파악
- 타겟 오디언스 식별
- 관련 카테고리 추출

### **2단계: 인플루언서 매칭**

- 카테고리 기반 필터링
- 팔로워 수 범위 설정
- 참여율 기준 정렬

### **3단계: 추천 점수 계산**

- 관련성 점수 (40%)
- 참여율 점수 (30%)
- 팔로워 수 점수 (20%)
- 인증 상태 점수 (10%)

## 🎯 최적화 팁

### **1. 구체적인 쿼리 작성**

```
❌ "인플루언서 찾기"
✅ "20대 여성을 타겟으로 한 뷰티 브랜드 런칭"
```

### **2. 타겟 오디언스 명시**

```
"10대 게이머를 위한 모바일 게임 마케팅"
"30대 직장인을 위한 피트니스 앱 홍보"
```

### **3. 예산 범위 포함**

```
"소규모 브랜드를 위한 마이크로 인플루언서"
"대기업 캠페인용 메가 인플루언서"
```

## 🔧 문제 해결

### **API 키 오류**

```bash
# 환경변수 확인
echo $OPENAI_API_KEY

# 서버 재시작
npm run dev
```

### **응답 지연**

- AI 서비스별 응답 시간 차이
- 네트워크 상태 확인
- API 사용량 제한 확인

### **추천 품질 개선**

- 더 구체적인 쿼리 작성
- 여러 키워드 조합 사용
- 피드백을 통한 학습

## 📈 모니터링

### **사용량 추적**

```typescript
// API 호출 로그
console.log("AI 검색 요청:", query);
console.log("AI 서비스:", selectedService);
console.log("응답 시간:", responseTime);
```

### **비용 모니터링**

- 각 AI 서비스 대시보드에서 사용량 확인
- 월별 비용 리포트 생성
- 사용량 제한 설정

이제 AI를 활용한 맞춤형 인플루언서 검색 서비스가 준비되었습니다! 🎉
