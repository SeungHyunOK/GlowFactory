# 인플루언서 자동 수집 시스템 설정 완료

## 현재 상태

✅ **Edge Functions 배포 완료**

- `sync-youtube-data`: 정상 작동 (2명의 인플루언서 수집 성공)
- `random-influencer-sync`: 배포 완료
- `sync-youtube-data-optimized`: 배포 완료

✅ **환경 변수 설정 완료**

- `GOOGLE_API_KEY`: 설정됨
- `SUPABASE_URL`: 설정됨
- `SUPABASE_SERVICE_ROLE_KEY`: 설정됨

✅ **GitHub Actions 설정 완료**

- 매일 오전 9시 (UTC) 자동 실행
- `sync-youtube-data` 함수 호출

## 남은 작업: Cron Job 설정

### 1단계: Supabase 대시보드 접속

1. https://supabase.com/dashboard/project/mwxwwaljfbbtwuerevcx 접속
2. "SQL Editor" 메뉴 클릭

### 2단계: Cron Job SQL 실행

다음 SQL을 복사하여 SQL Editor에서 실행하세요:

```sql
-- 8시간 간격 무작위 인플루언서 수집 Cron Job 설정

-- 1. pg_cron 확장 활성화
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. 기존 Cron Job이 있다면 삭제
SELECT cron.unschedule('random-influencer-sync-8h');

-- 3. 8시간 간격으로 무작위 인플루언서 수집 Cron Job 생성
SELECT cron.schedule(
  'random-influencer-sync-8h',
  '0 */8 * * *', -- 8시간마다 실행
  $$
  SELECT
    net.http_post(
      url := 'https://mwxwwaljfbbtwuerevcx.supabase.co/functions/v1/random-influencer-sync',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eHd3YWxqZmJidHd1ZXJldmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyOTMwMzIsImV4cCI6MjA3Mzg2OTAzMn0.-6zg7LyylocpOmYGWOfuiVdo_tH_sQLyCvHg-TW-MMU"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- 4. Cron Job 상태 확인
SELECT * FROM cron.job WHERE jobname = 'random-influencer-sync-8h';
```

### 3단계: 실행 시간표 확인

**자동 실행 시간:**

- **UTC 00:00** (한국시간 09:00) - 첫 번째 실행
- **UTC 08:00** (한국시간 17:00) - 두 번째 실행
- **UTC 16:00** (한국시간 01:00) - 세 번째 실행

**GitHub Actions:**

- **UTC 00:00** (한국시간 09:00) - 매일 실행

### 4단계: 모니터링

**Cron Job 실행 로그 확인:**

```sql
SELECT * FROM cron.job_run_details
WHERE jobname = 'random-influencer-sync-8h'
ORDER BY start_time DESC
LIMIT 10;
```

**수집된 데이터 확인:**

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

## 예상 결과

### 하루 수집량:

- **GitHub Actions**: 1회 × 2명 = 2명/일
- **Cron Job**: 3회 × 2명 = 6명/일
- **총합**: 약 8명/일, 240명/월

### 수집되는 데이터:

- 채널명, 구독자 수, 참여율
- 카테고리, 인증 상태
- 프로필 이미지, 채널 설명
- 최근 영상 정보

## 문제 해결

### Edge Function 로그 확인:

```bash
npx supabase functions logs random-influencer-sync --follow
```

### 수동 테스트:

```bash
curl -X POST \
  'https://mwxwwaljfbbtwuerevcx.supabase.co/functions/v1/random-influencer-sync' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eHd3YWxqZmJidHd1ZXJldmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyOTMwMzIsImV4cCI6MjA3Mzg2OTAzMn0.-6zg7LyylocpOmYGWOfuiVdo_tH_sQLyCvHg-TW-MMU' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 완료 후 확인사항

1. ✅ Edge Functions 배포됨
2. ✅ 환경 변수 설정됨
3. ✅ GitHub Actions 활성화됨
4. ⏳ Cron Job 설정 (수동으로 SQL 실행 필요)
5. ⏳ 자동 수집 시작 (다음 실행 시간까지 대기)

**다음 실행 시간**: 오늘 오후 5시 (한국시간) 또는 내일 오전 9시 (한국시간)
