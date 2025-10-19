# Supabase Edge Function 자동 동기화 설정 가이드

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
npx supabase functions deploy sync-youtube-data
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

### 환경 변수 설명:

- `GOOGLE_API_KEY`: YouTube Data API v3 키
- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase 서비스 역할 키 (RLS 우회 가능)

## 3. Cron Job 설정

### 1단계: SQL 실행

`setup-cron.sql` 파일의 내용을 Supabase SQL Editor에서 실행하세요.

### 2단계: URL 및 키 수정

SQL에서 다음 부분을 실제 값으로 수정:

- `your-project-ref`: 실제 Supabase 프로젝트 참조 ID
- `your-anon-key`: Supabase anon 키

### 3단계: Cron Job 확인

```sql
SELECT * FROM cron.job;
```

## 4. 수동 테스트

### Edge Function 수동 호출:

```bash
curl -X POST \
  'https://mwxwwaljfbbtwuerevcx.supabase.co/functions/v1/sync-youtube-data' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eHd3YWxqZmJidHd1ZXJldmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyOTMwMzIsImV4cCI6MjA3Mzg2OTAzMn0.-6zg7LyylocpOmYGWOfuiVdo_tH_sQLyCvHg-TW-MMU' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

### 로그 확인:

```bash
npx supabase functions logs sync-youtube-data
```

## 5. 자동 실행 스케줄

### 현재 설정:

- **실행 시간**: 매일 오전 9시 (UTC)
- **실행 내용**: YouTube API에서 인기 채널 데이터 수집
- **저장 위치**: Supabase `influencers` 테이블

### 스케줄 변경:

다른 시간으로 변경하려면 `setup-cron.sql`의 cron 표현식을 수정하세요:

- `'0 9 * * *'`: 매일 오전 9시
- `'0 */6 * * *'`: 6시간마다
- `'0 0 * * 1'`: 매주 월요일 자정

## 6. 모니터링

### Cron Job 실행 상태 확인:

```sql
SELECT * FROM cron.job_run_details
WHERE jobname = 'sync-youtube-data-daily'
ORDER BY start_time DESC;
```

### Edge Function 로그 확인:

```bash
npx supabase functions logs sync-youtube-data --follow
```

### Supabase 대시보드에서 확인:

1. "Database" → "influencers" 테이블
2. 데이터가 자동으로 추가되는지 확인

## 7. 문제 해결

### Edge Function 배포 실패:

```bash
# 로그 확인
npx supabase functions logs sync-youtube-data

# 재배포
npx supabase functions deploy sync-youtube-data
```

### Cron Job 실행 안됨:

1. `pg_cron` 확장이 활성화되어 있는지 확인
2. Supabase 프로젝트에서 cron 기능이 활성화되어 있는지 확인
3. URL과 키가 올바른지 확인

### API 할당량 초과:

1. Google Cloud Console에서 할당량 확인
2. Edge Function에서 API 호출 간격 조정
3. 검색 키워드 수 줄이기

## 8. 고급 설정

### 데이터 중복 방지:

Edge Function에서 기존 데이터를 업데이트하도록 수정:

```typescript
// 기존 데이터 확인 후 업데이트 또는 삽입
const { data: existing } = await supabase
  .from("influencers")
  .select("id")
  .eq("handle", influencer.handle)
  .eq("platform", influencer.platform);

if (existing && existing.length > 0) {
  // 업데이트
  await supabase.from("influencers").update(influencer).eq("id", existing[0].id);
} else {
  // 삽입
  await supabase.from("influencers").insert(influencer);
}
```

### 알림 설정:

Edge Function 실행 결과를 Slack이나 Discord로 전송:

```typescript
// Slack 웹훅으로 알림 전송
await fetch("YOUR_SLACK_WEBHOOK_URL", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text: `YouTube 데이터 동기화 완료: ${count}개 채널 처리됨`,
  }),
});
```

## 9. 비용 최적화

### API 호출 최적화:

1. 검색 키워드 수 줄이기
2. 채널당 비디오 수 줄이기
3. API 호출 간격 늘리기

### 데이터 정리:

```sql
-- 30일 이상 된 데이터 삭제
DELETE FROM influencers
WHERE created_at < NOW() - INTERVAL '30 days';
```

이제 매일 자동으로 YouTube API에서 최신 인플루언서 데이터를 수집하여 Supabase에 저장할 수 있습니다!
