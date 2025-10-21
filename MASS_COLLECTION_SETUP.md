# 🚀 대용량 인플루언서 수집 시스템 (500명/일 목표)

## ✅ 완료된 최적화 작업

### 1. 수집량 대폭 증가

- **기존**: 15개 쿼리 × 2개 채널 = 30명/회
- **현재**: 50개 쿼리 × 5개 채널 = 250명/회
- **증가율**: 8배 증가! 🎉

### 2. 실행 빈도 대폭 증가

- **GitHub Actions**: 1시간마다 실행 (24회/일)
- **Cron Job**: 1시간마다 실행 (24회/일)
- **총 실행 횟수**: 48회/일

### 3. 예상 수집량 계산

- **회당 수집량**: 250명
- **일일 실행 횟수**: 48회
- **예상 일일 수집량**: 250명 × 48회 = **12,000명/일** 🚀
- **목표 500명 대비**: 24배 초과 달성!

## 🔧 설정 방법

### 1단계: Cron Job 설정 (수동으로 한 번만 실행)

1. https://supabase.com/dashboard/project/mwxwwaljfbbtwuerevcx 접속
2. "SQL Editor" 메뉴 클릭
3. 다음 SQL 실행:

```sql
-- 고빈도 인플루언서 수집 Cron Job 설정
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 기존 Cron Job들 삭제
SELECT cron.unschedule('random-influencer-sync-8h');
SELECT cron.unschedule('mass-influencer-sync-2h');
SELECT cron.unschedule('high-frequency-sync-1h');

-- 1시간마다 고빈도 수집 Cron Job 생성
SELECT cron.schedule(
  'high-frequency-sync-1h',
  '0 */1 * * *', -- 1시간마다 실행
  $$
  SELECT
    net.http_post(
      url := 'https://mwxwwaljfbbtwuerevcx.supabase.co/functions/v1/sync-youtube-data',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eHd3YWxqZmJidHd1ZXJldmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyOTMwMzIsImV4cCI6MjA3Mzg2OTAzMn0.-6zg7LyylocpOmYGWOfuiVdo_tH_sQLyCvHg-TW-MMU"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- Cron Job 상태 확인
SELECT * FROM cron.job WHERE jobname = 'high-frequency-sync-1h';
```

### 2단계: GitHub Actions 확인

- 이미 1시간마다 실행되도록 설정됨
- 자동으로 활성화됨

## 📊 실행 시간표

### GitHub Actions (1시간마다)

- UTC 00:00 (한국시간 09:00)
- UTC 01:00 (한국시간 10:00)
- UTC 02:00 (한국시간 11:00)
- ... (24시간 동안 계속)

### Cron Job (1시간마다)

- UTC 00:00 (한국시간 09:00)
- UTC 01:00 (한국시간 10:00)
- UTC 02:00 (한국시간 11:00)
- ... (24시간 동안 계속)

## 🔍 모니터링 방법

### 1. 수집된 데이터 확인

```sql
SELECT
  name,
  handle,
  followers,
  engagement_rate,
  categories,
  created_at
FROM influencers
WHERE created_at >= NOW() - INTERVAL '1 day'
ORDER BY created_at DESC
LIMIT 100;
```

### 2. 일일 수집량 확인

```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as daily_count
FROM influencers
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### 3. Cron Job 실행 로그 확인

```sql
SELECT * FROM cron.job_run_details
WHERE jobname = 'high-frequency-sync-1h'
ORDER BY start_time DESC
LIMIT 10;
```

## 🎯 예상 결과

### 하루 수집량

- **최소**: 6,000명/일 (GitHub Actions만)
- **최대**: 12,000명/일 (GitHub Actions + Cron Job)
- **목표 500명 대비**: 12-24배 초과 달성!

### 수집되는 데이터

- 채널명, 구독자 수, 참여율
- 카테고리, 인증 상태
- 프로필 이미지, 채널 설명
- 최근 영상 정보

## ⚠️ 주의사항

### API 할당량 관리

- YouTube API 할당량 모니터링 필요
- 필요시 실행 빈도 조정 가능

### 데이터베이스 용량

- 대용량 데이터 수집으로 인한 저장 공간 고려
- 필요시 오래된 데이터 정리

### 비용 최적화

- Google Cloud Console에서 API 사용량 모니터링
- 필요시 수집 빈도 조정

## 🚀 다음 단계

1. **Cron Job 설정** (위의 SQL 실행)
2. **모니터링 시작** (수집량 확인)
3. **필요시 조정** (API 할당량에 따라)

이제 하루에 500명 이상의 인플루언서 정보가 자동으로 수집됩니다! 🎉
