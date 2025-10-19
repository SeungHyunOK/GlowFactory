"use client";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="w-full bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center text-white">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            브랜드와 인플루언서를 더 똑똑하게 연결합니다
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300 md:text-lg">
            GlowFactory는 데이터와 직관을 결합해 브랜드의 캠페인 성과를 높이고, 인플루언서의 가치가
            제대로 전달되도록 돕습니다.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/campaigns"
              className="inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100"
              aria-label="캠페인 둘러보기"
            >
              캠페인 둘러보기
            </Link>
            <Link
              href="/discovery"
              className="inline-flex items-center rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              aria-label="인플루언서 찾기"
            >
              인플루언서 찾기
            </Link>
          </div>
          <div className="mt-10">
            <Image
              src="/images/mainbanner.png"
              alt="GlowFactory 메인 배너"
              width={960}
              height={480}
              className="mx-auto rounded-2xl shadow-lg ring-1 ring-white/10"
              priority
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">제품 사용법</h2>
          <p className="mx-auto mt-2 max-w-xl text-slate-600">
            브랜드와 인플루언서 모두에게 간단한 3단계 프로세스
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* 브랜드(광고주) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">브랜드(광고주)</h3>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-500">STEP 1</p>
                <h4 className="mt-1 font-semibold text-slate-800">준비하기</h4>
                <Image
                  src="/images/step1_marketer.png"
                  alt="브랜드 준비하기"
                  width={300}
                  height={300}
                  className="mt-3 rounded-lg"
                />
                <p className="mt-2 text-sm text-slate-600">
                  이메일/소셜 로그인 후 브랜드 프로필 작성
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-500">STEP 2</p>
                <h4 className="mt-1 font-semibold text-slate-800">캠페인 만들기</h4>
                <Image
                  src="/images/step2_marketer.png"
                  alt="캠페인 만들기"
                  width={300}
                  height={300}
                  className="mt-3 rounded-lg"
                />
                <p className="mt-2 text-sm text-slate-600">
                  목적·조건·보상·일정 등록 후 AI 추천 확인
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-500">STEP 3</p>
                <h4 className="mt-1 font-semibold text-slate-800">협업</h4>
                <Image
                  src="/images/step3_marketer.png"
                  alt="브랜드 협업 진행"
                  width={300}
                  height={300}
                  className="mt-3 rounded-lg"
                />
                <p className="mt-2 text-sm text-slate-600">
                  제안서 승인·메시지 조율·콘텐츠 검수 후 완료
                </p>
              </div>
            </div>
          </div>

          {/* 인플루언서 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">인플루언서</h3>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-500">STEP 1</p>
                <h4 className="mt-1 font-semibold text-slate-800">준비하기</h4>
                <Image
                  src="/images/step1_influencer.png"
                  alt="인플루언서 준비하기"
                  width={300}
                  height={300}
                  className="mt-3 rounded-lg"
                />
                <p className="mt-2 text-sm text-slate-600">
                  회원가입 후 프로필(카테고리·채널·팔로워·참여율) 작성
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-500">STEP 2</p>
                <h4 className="mt-1 font-semibold text-slate-800">캠페인 찾기</h4>
                <Image
                  src="/images/step2_influencer.png"
                  alt="캠페인 찾기"
                  width={300}
                  height={300}
                  className="mt-3 rounded-lg"
                />
                <p className="mt-2 text-sm text-slate-600">
                  조건 검색·AI 추천 확인 후 지원 및 제안서 제출
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-500">STEP 3</p>
                <h4 className="mt-1 font-semibold text-slate-800">협업</h4>
                <Image
                  src="/images/step3_marketer.png"
                  alt="인플루언서 협업 진행"
                  width={300}
                  height={300}
                  className="mt-3 rounded-lg"
                />
                <p className="mt-2 text-sm text-slate-600">
                  커뮤니케이션·콘텐츠 제작·업로드 후 완료 및 히스토리 관리
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
