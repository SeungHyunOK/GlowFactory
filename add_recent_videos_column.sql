-- influencers 테이블에 recent_videos 컬럼 추가
-- 이 SQL을 Supabase 대시보드 → SQL Editor에서 실행하세요

-- 1. recent_videos 컬럼 추가 (JSONB 타입)
ALTER TABLE influencers 
ADD COLUMN IF NOT EXISTS recent_videos JSONB DEFAULT '[]'::jsonb;

-- 2. 컬럼이 제대로 추가되었는지 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'influencers' 
AND column_name = 'recent_videos';

-- 3. 기존 데이터에 빈 배열 설정 (이미 있는 경우)
UPDATE influencers 
SET recent_videos = '[]'::jsonb 
WHERE recent_videos IS NULL;

-- 4. 테이블 구조 확인 (Supabase SQL Editor용)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'influencers' 
ORDER BY ordinal_position;
