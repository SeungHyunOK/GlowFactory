# GlowFactory

브랜드와 인플루언서를 심플하고 고급스러운 UX로 연결하는 마케팅 플랫폼입니다.

## 주요 기능

- Discovery: 고급 필터와 카드 그리드로 인플루언서 탐색
- Campaigns:
  - 캠페인 등록/지원: 브랜드 캠페인 생성(목적·조건·일정·보상), 인플루언서 지원/제안서 제출
  - 승인/거절 프로세스: 제안 리스트 관리, 상태 배지, 승인/거절 액션
  - 메시지/알림: 좌측 대화 목록, 우측 스레드, 메시지 입력
  - 콘텐츠 제출 & 검수: 링크/파일 제출, 브랜드 검수 및 승인
  - 히스토리 관리: 진행 중/완료/거절됨 탭으로 참여 캠페인 관리

## 기술 스택

- Next.js 15, React 19
- TypeScript, ESLint, Prettier
- Tailwind CSS 4

## 시작하기

사전 준비: Node.js 20+ 권장

```bash
# 의존성 설치
npm ci

# 개발 서버 (Turbopack)
npm run dev

# 프로덕션 빌드/실행
npm run build
npm start

# 품질 도구
npm run lint        # ESLint 검사
npm run lint:fix    # 자동 수정
npm run format      # Prettier 포맷팅
npm run typecheck   # 타입 검사
```

## 환경변수

프로젝트 루트의 `.env` 파일 사용. 예시는 `.env.example` 참고 후 복사하여 수정하세요.

```bash
cp .env.example .env
```

## 주요 페이지

- 홈: `src/app/page.tsx`
- 인플루언서 Discovery: `src/app/discovery/page.tsx`
- 캠페인: `src/app/campaigns/page.tsx`

## 저장소

- GitHub: [`SeungHyunOK/GlowFactory`](https://github.com/SeungHyunOK/GlowFactory.git)

---

문의나 개선 제안은 이슈로 남겨주세요. 🙌
