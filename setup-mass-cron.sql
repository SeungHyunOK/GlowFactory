-- 대용량 인플루언서 수집 Cron Job 설정 (500명/일 목표)
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- 1. pg_cron 확장 활성화
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. 기존 Cron Job들 삭제
SELECT cron.unschedule('random-influencer-sync-8h');
SELECT cron.unschedule('mass-influencer-sync-2h');

-- 3. 2시간마다 대용량 수집 Cron Job 생성
SELECT cron.schedule(
  'mass-influencer-sync-2h',
  '0 */2 * * *', -- 2시간마다 실행
  $$
  SELECT
    net.http_post(
      url := 'https://mwxwwaljfbbtwuerevcx.supabase.co/functions/v1/mass-influencer-sync',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eHd3YWxqZmJidHd1ZXJldmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyOTMwMzIsImV4cCI6MjA3Mzg2OTAzMn0.-6zg7LyylocpOmYGWOfuiVdo_tH_sQLyCvHg-TW-MMU"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- 4. Cron Job 상태 확인
SELECT * FROM cron.job WHERE jobname = 'mass-influencer-sync-2h';

-- 5. 실행 로그 확인 (나중에 확인용)
-- SELECT * FROM cron.job_run_details 
-- WHERE jobname = 'mass-influencer-sync-2h' 
-- ORDER BY start_time DESC 
-- LIMIT 10;

-- 주의사항:
-- 1. Edge Function이 먼저 배포되어 있어야 합니다
-- 2. 환경 변수(GOOGLE_API_KEY 등)가 설정되어 있어야 합니다

-- 실행 시간표 (2시간마다):
-- UTC 00:00 (한국시간 09:00) - 첫 번째 실행
-- UTC 02:00 (한국시간 11:00) - 두 번째 실행
-- UTC 04:00 (한국시간 13:00) - 세 번째 실행
-- UTC 06:00 (한국시간 15:00) - 네 번째 실행
-- UTC 08:00 (한국시간 17:00) - 다섯 번째 실행
-- UTC 10:00 (한국시간 19:00) - 여섯 번째 실행
-- UTC 12:00 (한국시간 21:00) - 일곱 번째 실행
-- UTC 14:00 (한국시간 23:00) - 여덟 번째 실행
-- UTC 16:00 (한국시간 01:00) - 아홉 번째 실행
-- UTC 18:00 (한국시간 03:00) - 열 번째 실행
-- UTC 20:00 (한국시간 05:00) - 열한 번째 실행
-- UTC 22:00 (한국시간 07:00) - 열두 번째 실행

-- 예상 수집량:
-- - 100개 쿼리 × 5개 채널 = 500명/회
-- - 2시간마다 실행 = 12회/일
-- - 총 수집량: 500명 × 12회 = 6,000명/일 (목표 500명 초과 달성!)
