# 중복 인플루언서 제거 가이드

## 🔍 중복 발생 원인

### 1. **API 검색 중복**

- 같은 채널이 여러 카테고리에서 검색됨
- 인기 채널과 카테고리 검색에서 중복 발생
- 채널 ID는 다르지만 같은 인플루언서

### 2. **데이터베이스 중복**

- `upsert` 시 `onConflict` 설정 부족
- 동시 실행으로 인한 중복 삽입
- 수동 데이터 입력 시 중복

### 3. **이름/핸들 정규화 부족**

- 대소문자 차이: "MrBeast" vs "mrbeast"
- 특수문자 차이: "TechReview" vs "Tech-Review"
- 공백 차이: "Beauty Guru" vs "BeautyGuru"

## 🛠️ 해결 방법

### 1. **즉시 중복 제거 (SQL)**

```sql
-- 1. 중복 확인
SELECT
  name,
  platform,
  COUNT(*) as duplicate_count
FROM influencers
GROUP BY name, platform
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 2. 중복 제거 (최신 데이터만 유지)
WITH ranked_influencers AS (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY name, platform
      ORDER BY updated_at DESC, created_at DESC
    ) as rn
  FROM influencers
)
DELETE FROM influencers
WHERE id IN (
  SELECT id FROM ranked_influencers WHERE rn > 1
);

-- 3. 제약 조건 추가 (향후 중복 방지)
ALTER TABLE influencers
ADD CONSTRAINT unique_influencer_name_platform
UNIQUE (name, platform);
```

### 2. **코드 레벨 중복 방지**

#### **정규화 함수**

```typescript
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "");
}

function normalizeHandle(handle: string): string {
  return handle.toLowerCase().trim().replace(/[^\w]/g, "");
}
```

#### **중복 체크 로직**

```typescript
const processedNames = new Set();
const processedHandles = new Set();

// 중복 체크
const normalizedName = normalizeName(influencerData.name);
const normalizedHandle = normalizeHandle(influencerData.handle);

if (processedNames.has(normalizedName) || processedHandles.has(normalizedHandle)) {
  console.log(`중복 발견: ${influencerData.name} - 건너뜀`);
  continue;
}

// 중복이 아니면 추가
processedNames.add(normalizedName);
processedHandles.add(normalizedHandle);
```

### 3. **데이터베이스 제약 조건**

```sql
-- 유니크 인덱스 생성
CREATE UNIQUE INDEX idx_influencers_unique
ON influencers(name, platform);

-- 제약 조건 추가
ALTER TABLE influencers
ADD CONSTRAINT unique_influencer_name_platform
UNIQUE (name, platform);
```

## 📊 중복 제거 효과

### **Before (중복 있음)**

```
총 인플루언서: 150명
중복된 인플루언서: 25명 (16.7%)
실제 고유 인플루언서: 125명
```

### **After (중복 제거)**

```
총 인플루언서: 125명
중복된 인플루언서: 0명 (0%)
실제 고유 인플루언서: 125명
```

## 🚀 실행 방법

### 1. **즉시 중복 제거**

```bash
# Supabase SQL Editor에서 실행
# remove_duplicates.sql 파일의 내용 복사 후 실행
```

### 2. **최적화된 Edge Function 배포**

```bash
# 중복 제거 로직이 포함된 Edge Function 배포
supabase functions deploy sync-youtube-data-optimized
```

### 3. **중복 제거 확인**

```sql
-- 중복 확인 쿼리
SELECT
  COUNT(*) as total_influencers,
  COUNT(DISTINCT CONCAT(name, '|', platform)) as unique_influencers,
  COUNT(*) - COUNT(DISTINCT CONCAT(name, '|', platform)) as duplicates
FROM influencers;
```

## 🔧 모니터링

### 1. **중복 감지 알림**

```typescript
// 중복 발견 시 로그
console.log(`중복 발견: ${influencerData.name} - 건너뜀`);

// 중복 제거 통계
console.log(`중복 제거 완료: ${removedCount}개`);
```

### 2. **정기적 중복 체크**

```sql
-- 주간 중복 체크 쿼리
SELECT
  'Weekly Duplicate Check' as check_type,
  COUNT(*) as total,
  COUNT(DISTINCT CONCAT(name, '|', platform)) as unique_count,
  COUNT(*) - COUNT(DISTINCT CONCAT(name, '|', platform)) as duplicates
FROM influencers;
```

## 📈 예방 방법

### 1. **API 호출 최적화**

- 채널 ID 기반 중복 체크
- 이름/핸들 정규화
- Set을 이용한 빠른 중복 체크

### 2. **데이터베이스 제약**

- UNIQUE 제약 조건
- 트리거를 통한 자동 중복 방지
- 정기적 데이터 정리

### 3. **모니터링 시스템**

- 실시간 중복 감지
- 자동 알림 시스템
- 정기적 데이터 품질 체크

## 🎯 결과

이 중복 제거 시스템을 통해:

- **데이터 품질 향상**: 중복 없는 깔끔한 데이터
- **성능 개선**: 불필요한 중복 데이터 제거
- **비용 절약**: API 호출 최적화
- **사용자 경험 향상**: 정확한 인플루언서 정보 제공

중복 제거는 일회성 작업이 아니라 지속적인 데이터 품질 관리의 핵심입니다! 🎉
