-- 고빈도 인플루언서 수집 Cron Job 설정 (500명/일 목표)
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- 1. pg_cron 확장 활성화
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. 기존 Cron Job들 삭제 (오류 방지를 위해 조건부 삭제)
DO $$
BEGIN
    -- 존재하는 job만 삭제
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'random-influencer-sync-8h') THEN
        PERFORM cron.unschedule('random-influencer-sync-8h');
    END IF;
    
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'high-frequency-sync-1h') THEN
        PERFORM cron.unschedule('high-frequency-sync-1h');
    END IF;
END $$;

-- 3. 1시간마다 고빈도 수집 Cron Job 생성
SELECT cron.schedule(
  'high-frequency-sync-1h',
  '0 */1 * * *', -- 1시간마다 실행
  $$
  SELECT
    net.http_post(
      url := 'https://mwxwwaljfbbtwuerevcx.supabase.co/functions/v1/test-dummy-data',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eHd3YWxqZmJidHd1ZXJldmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyOTMwMzIsImV4cCI6MjA3Mzg2OTAzMn0.-6zg7LyylocpOmYGWOfuiVdo_tH_sQLyCvHg-TW-MMU"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- 4. Cron Job 상태 확인
SELECT * FROM cron.job WHERE jobname = 'high-frequency-sync-1h';

-- 5. 실행 로그 확인 (나중에 확인용)
-- SELECT * FROM cron.job_run_details 
-- WHERE jobname = 'high-frequency-sync-1h' 
-- ORDER BY start_time DESC 
-- LIMIT 10;

-- 주의사항:
-- 1. Edge Function이 먼저 배포되어 있어야 합니다
-- 2. 환경 변수(GOOGLE_API_KEY 등)가 설정되어 있어야 합니다

-- 실행 시간표 (1시간마다):
-- UTC 00:00 (한국시간 09:00) - 첫 번째 실행
-- UTC 01:00 (한국시간 10:00) - 두 번째 실행
-- UTC 02:00 (한국시간 11:00) - 세 번째 실행
-- ... (24시간 동안 계속)

-- 예상 수집량:
-- - 50개 쿼리 × 5개 채널 = 250명/회
-- - 1시간마다 실행 = 24회/일
-- - 총 수집량: 250명 × 24회 = 6,000명/일 (목표 500명 대폭 초과 달성!)

-- GitHub Actions와 함께:
-- - GitHub Actions: 1시간마다 실행 (24회/일)
-- - Cron Job: 1시간마다 실행 (24회/일)
-- - 총 실행 횟수: 48회/일
-- - 예상 수집량: 250명 × 48회 = 12,000명/일 (대폭 초과!)
