# Supabase Cron 대안: Database Webhooks 사용

## 문제: pg_cron이 작동하지 않는 경우

Supabase의 일부 플랜에서는 `pg_cron`이 제한될 수 있습니다. 이 경우 다음 대안들을 사용할 수 있습니다.

## 대안 1: 외부 Cron 서비스 사용

### GitHub Actions 사용 (무료)

`.github/workflows/sync-youtube.yml` 파일 생성:

```yaml
name: Sync YouTube Data
on:
  schedule:
    - cron: "0 9 * * *" # 매일 오전 9시 (UTC)
  workflow_dispatch: # 수동 실행 가능

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Call Supabase Edge Function
        run: |
          curl -X POST \
            'https://mwxwwaljfbbtwuerevcx.supabase.co/functions/v1/sync-youtube-data' \
            -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eHd3YWxqZmJidHd1ZXJldmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyOTMwMzIsImV4cCI6MjA3Mzg2OTAzMn0.-6zg7LyylocpOmYGWOfuiVdo_tH_sQLyCvHg-TW-MMU' \
            -H 'Content-Type: application/json' \
            -d '{}'
```

### Vercel Cron Jobs 사용

`vercel.json` 파일 생성:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-youtube",
      "schedule": "0 9 * * *"
    }
  ]
}
```

그리고 `src/app/api/cron/sync-youtube/route.ts` 생성:

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://mwxwwaljfbbtwuerevcx.supabase.co/functions/v1/sync-youtube-data",
      {
        method: "POST",
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eHd3YWxqZmJidHd1ZXJldmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyOTMwMzIsImV4cCI6MjA3Mzg2OTAzMn0.-6zg7LyylocpOmYGWOfuiVdo_tH_sQLyCvHg-TW-MMU",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      },
    );

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## 대안 2: 수동 트리거 사용

### Supabase Dashboard에서 수동 실행

1. Supabase 대시보드 → Functions
2. `sync-youtube-data` 함수 선택
3. "Invoke" 버튼 클릭

### API 라우트를 통한 수동 실행

디스커버리 페이지의 "구글에서 데이터 동기화" 버튼을 사용

## 대안 3: 외부 서비스 사용

### Uptime Robot (무료)

- 5분마다 체크하는 무료 플랜
- HTTP 요청으로 Edge Function 호출

### Cron-job.org (무료)

- 무료 cron 서비스
- 매일 지정된 시간에 HTTP 요청

## 권장 방법

**GitHub Actions**를 사용하는 것을 권장합니다:

1. 무료
2. 안정적
3. 로그 확인 가능
4. 수동 실행 가능

GitHub Actions 설정을 원하시면 `.github/workflows/sync-youtube.yml` 파일을 생성해드릴 수 있습니다.
