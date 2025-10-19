-- 8시간 간격 무작위 인플루언서 수집 Cron Job 설정
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- 1. pg_cron 확장 활성화 (이미 활성화되어 있다면 무시)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. 기존 Cron Job이 있다면 삭제
SELECT cron.unschedule('random-influencer-sync-8h');

-- 3. 8시간 간격으로 무작위 인플루언서 수집 Cron Job 생성
-- 매일 00:00, 08:00, 16:00에 실행 (UTC 기준)
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

-- 5. 실행 로그 확인 (나중에 확인용)
-- SELECT * FROM cron.job_run_details 
-- WHERE jobname = 'random-influencer-sync-8h' 
-- ORDER BY start_time DESC 
-- LIMIT 10;

-- 주의사항:
-- 1. YOUR_PROJECT_REF를 실제 Supabase 프로젝트 참조 ID로 변경하세요
-- 2. YOUR_ANON_KEY를 실제 Supabase anon 키로 변경하세요
-- 3. Edge Function이 먼저 배포되어 있어야 합니다
-- 4. 환경 변수(GOOGLE_API_KEY 등)가 설정되어 있어야 합니다

-- 실행 시간표:
-- UTC 00:00 (한국시간 09:00) - 첫 번째 실행
-- UTC 08:00 (한국시간 17:00) - 두 번째 실행  
-- UTC 16:00 (한국시간 01:00) - 세 번째 실행
-- UTC 24:00 (한국시간 09:00) - 다음날 첫 번째 실행 (반복)
