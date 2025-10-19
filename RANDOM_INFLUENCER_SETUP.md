# 8시간 간격 무작위 인플루언서 수집 설정 가이드

## 개요

매일 8시간 간격으로 무작위 인플루언서 정보를 수집하는 시스템입니다.

- **실행 시간**: UTC 00:00, 08:00, 16:00 (한국시간 09:00, 17:00, 01:00)
- **수집 방식**: 200개 이상의 카테고리에서 무작위로 3개 선택하여 검색
- **API 최적화**: 캐시 시스템과 재시도 정책으로 효율적인 데이터 수집

## 1. Edge Function 배포

### 1단계: Supabase CLI 로그인

```bash
npx supabase login
```

### 2단계: 프로젝트 연결

```bash
npx supabase link --project-ref your-project-ref
```

### 3단계: Edge Function 배포

```bash
npx supabase functions deploy random-influencer-sync
```

## 2. 환경 변수 설정

### Supabase 대시보드에서 환경 변수 설정:

1. Supabase 대시보드 → "Settings" → "Edge Functions"
2. "Environment Variables" 섹션에서 다음 변수들 추가:

```
GOOGLE_API_KEY=your_youtube_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 3. Cron Job 설정

### 1단계: SQL 실행

`setup-random-cron.sql` 파일의 내용을 Supabase SQL Editor에서 실행하세요.

### 2단계: URL 및 키 수정

SQL에서 다음 부분을 실제 값으로 수정:

- `YOUR_PROJECT_REF`: 실제 Supabase 프로젝트 참조 ID
- `YOUR_ANON_KEY`: Supabase anon 키

### 3단계: Cron Job 확인

```sql
SELECT * FROM cron.job WHERE jobname = 'random-influencer-sync-8h';
```

## 4. 무작위 수집 시스템 특징

### 카테고리 풀 (200개 이상)

- Beauty & Fashion
- Technology & Gaming
- Food & Cooking
- Fitness & Health
- Travel & Lifestyle
- Education & Science
- Entertainment & Comedy
- Music & Arts
- Business & Finance
- Sports & Recreation
- 기타 다양한 니치 카테고리들

### 무작위 선택 알고리즘

1. **카테고리 선택**: 200개 카테고리에서 3개 무작위 선택
2. **검색어 생성**: 각 카테고리마다 2개의 무작위 검색어 생성
3. **채널 수집**: 각 검색어마다 1개 채널 수집
4. **중복 방지**: 이미 처리된 채널은 건너뜀

### API 최적화

- **캐시 시스템**: 5분 TTL로 중복 API 호출 방지
- **재시도 정책**: 429/403 오류 시 지수 백오프
- **배치 처리**: 여러 채널을 한 번에 조회
- **지연 처리**: API 제한을 고려한 2초 간격

## 5. 실행 시간표

### UTC 기준

- **00:00** - 첫 번째 수집 (한국시간 09:00)
- **08:00** - 두 번째 수집 (한국시간 17:00)
- **16:00** - 세 번째 수집 (한국시간 01:00)

### 수집되는 데이터

- **채널명**: YouTube 채널 이름
- **구독자 수**: 실시간 구독자 수
- **참여율**: 1-10% 랜덤 (실제 계산 가능)
- **평균 좋아요**: 구독자 수의 1% 정도
- **카테고리**: 무작위 선택된 카테고리
- **인증 상태**: 100만 구독자 이상 시 인증
- **프로필 이미지**: YouTube 썸네일
- **채널 설명**: 채널 소개
- **총 조회수**: 채널 전체 조회수
- **비디오 수**: 업로드된 비디오 수

## 6. 모니터링

### Cron Job 실행 상태 확인:

```sql
SELECT * FROM cron.job_run_details
WHERE jobname = 'random-influencer-sync-8h'
ORDER BY start_time DESC;
```

### Edge Function 로그 확인:

```bash
npx supabase functions logs random-influencer-sync --follow
```

### 수집된 데이터 확인:

```sql
SELECT
  name,
  handle,
  categories,
  followers,
  engagement_rate,
  created_at
FROM influencers
WHERE created_at >= NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;
```

## 7. 수동 테스트

### Edge Function 수동 호출:

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/random-influencer-sync' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 8. 문제 해결

### Edge Function 배포 실패:

```bash
# 로그 확인
npx supabase functions logs random-influencer-sync

# 재배포
npx supabase functions deploy random-influencer-sync
```

### Cron Job 실행 안됨:

1. `pg_cron` 확장이 활성화되어 있는지 확인
2. Supabase 프로젝트에서 cron 기능이 활성화되어 있는지 확인
3. URL과 키가 올바른지 확인

### API 할당량 초과:

1. Google Cloud Console에서 할당량 확인
2. Edge Function에서 API 호출 간격 조정
3. 무작위 카테고리 수 줄이기

## 9. 고급 설정

### 수집 빈도 변경:

```sql
-- 6시간마다 실행
SELECT cron.unschedule('random-influencer-sync-8h');
SELECT cron.schedule(
  'random-influencer-sync-6h',
  '0 */6 * * *',
  -- ... 함수 호출 코드
);

-- 12시간마다 실행
SELECT cron.unschedule('random-influencer-sync-6h');
SELECT cron.schedule(
  'random-influencer-sync-12h',
  '0 */12 * * *',
  -- ... 함수 호출 코드
);
```

### 카테고리 풀 커스터마이징:

`random-influencer-sync/index.ts` 파일의 `RANDOM_CATEGORIES` 배열을 수정하여 원하는 카테고리만 수집하도록 설정할 수 있습니다.

### 알림 설정:

Edge Function 실행 결과를 Slack이나 Discord로 전송:

```typescript
// Slack 웹훅으로 알림 전송
await fetch("YOUR_SLACK_WEBHOOK_URL", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text: `무작위 인플루언서 수집 완료: ${count}개 채널 처리됨`,
  }),
});
```

## 10. 비용 최적화

### API 호출 최적화:

1. 무작위 카테고리 수 줄이기 (3개 → 2개)
2. 검색어 수 줄이기 (카테고리당 2개 → 1개)
3. API 호출 간격 늘리기 (2초 → 3초)

### 데이터 정리:

```sql
-- 30일 이상 된 데이터 삭제
DELETE FROM influencers
WHERE created_at < NOW() - INTERVAL '30 days';
```

## 11. 예상 결과

### 하루 수집량:

- **3회 실행** × **3개 카테고리** × **2개 검색어** × **1개 채널** = **18개 채널/일**
- **월 수집량**: 약 540개 채널
- **연 수집량**: 약 6,570개 채널

### 데이터 다양성:

- 200개 이상의 다양한 카테고리에서 무작위 선택
- 트렌딩한 새로운 인플루언서 발견
- 기존 데이터와 중복 최소화
- 다양한 규모의 채널 (마이크로부터 매크로까지)

이제 매일 8시간 간격으로 무작위 인플루언서 데이터를 자동으로 수집할 수 있습니다!
