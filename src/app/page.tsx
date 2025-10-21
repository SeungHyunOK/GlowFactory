"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import dynamic from "next/dynamic";

const FadeInUp = React.memo(
  ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
    const [ref, inView] = useInView({
      triggerOnce: true,
      threshold: 0.1,
      rootMargin: "50px",
    });

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 60 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
        transition={{
          duration: 0.6,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    );
  },
);
FadeInUp.displayName = "FadeInUp";

// Dynamic import로 파티클 컴포넌트 로드 (SSR 문제 해결)
const ParticleBackground = dynamic(() => import("@/components/ParticleBackground"), {
  ssr: false,
  loading: () => null,
});

// 최적화된 카운터 컴포넌트
const Counter = React.memo(({ end, duration = 2 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "50px",
  });

  const animate = useCallback(
    (currentTime: number, startTime: number) => {
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        requestAnimationFrame((time) => animate(time, startTime));
      }
    },
    [end, duration],
  );

  useEffect(() => {
    if (inView) {
      const startTime = performance.now();
      requestAnimationFrame((time) => animate(time, startTime));
    }
  }, [inView, animate]);

  return (
    <motion.div
      ref={ref}
      className="text-4xl font-bold text-blue-600 mb-2"
      style={{ willChange: "contents" }}
    >
      {count}
      {end >= 100 ? "+" : ""}
    </motion.div>
  );
});
Counter.displayName = "Counter";

// 최적화된 Stagger 컴포넌트들
const StaggerContainer = React.memo(({ children }: { children: React.ReactNode }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "50px",
  });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
          },
        },
      }}
      style={{ willChange: "contents" }}
    >
      {children}
    </motion.div>
  );
});
StaggerContainer.displayName = "StaggerContainer";

const StaggerItem = React.memo(({ children }: { children: React.ReactNode }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 40 },
      visible: { opacity: 1, y: 0 },
    }}
    transition={{
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    }}
    style={{ willChange: "transform, opacity" }}
  >
    {children}
  </motion.div>
));
StaggerItem.displayName = "StaggerItem";

// 최적화된 메인 컴포넌트
const Home = React.memo(() => {
  return (
    <main className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
        {/* 배경 애니메이션 */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              x: [0, 50, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        {/* 파티클 효과 */}
        <ParticleBackground />

        <div className="relative mx-auto max-w-7xl px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8"
          >
            <motion.h1
              className="text-5xl font-bold tracking-tight text-gray-900 md:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              당신의 브랜드와 가장 어울리는
              <br />
              <motion.span
                className="text-blue-600"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                인플루언서
              </motion.span>
              와 협업하세요
            </motion.h1>

            <motion.p
              className="mx-auto mt-6 max-w-3xl text-xl text-gray-600 md:text-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              글로벌 AI 시딩 솔루션 GlowFactory
            </motion.p>

            <motion.p
              className="mx-auto mt-4 max-w-2xl text-lg text-gray-500"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              팔로워와 국가 제한 없이 적합한 인플루언서를 찾으세요!
              <br />
              원하는 비주얼, 컨셉의 인플루언서를 AI가 찾아 제안합니다
            </motion.p>
          </motion.div>

          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/discovery"
                className="inline-flex items-center rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-xl"
                aria-label="데모 체험하기"
              >
                데모 체험하기
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="#"
                className="inline-flex items-center rounded-full border-2 border-blue-600 px-8 py-4 text-lg font-semibold text-blue-600 hover:bg-blue-50 transition-all duration-300 hover:shadow-xl"
                aria-label="소개서 다운로드"
              >
                소개서 다운로드
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="w-full bg-white py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <FadeInUp>
            <motion.h2
              className="text-3xl font-bold text-gray-900 md:text-4xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              막막한 시딩 업무...
            </motion.h2>
          </FadeInUp>
          <FadeInUp delay={0.2}>
            <motion.p
              className="mt-4 text-2xl font-semibold text-blue-600"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              AI로 더 빠르게, 더 효과적으로!
            </motion.p>
          </FadeInUp>
        </div>
      </section>

      {/* Main Value Proposition */}
      <section className="w-full bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 md:text-5xl">
              당신의 인플루언서 그룹을 빠르게 발견하고
              <br />
              손쉽게 섭외하세요
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              인플루언서 시딩의 모든 과정에서 속도를 높여 드립니다
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 md:text-5xl">
              시간 효율 <span className="text-blue-600">30배</span> 상승!
            </h2>
            <p className="mt-4 text-xl text-gray-600">마케팅 생산성을 높여드려요</p>
            <p className="mt-2 text-lg text-gray-500">
              앞서가는 브랜드들은 이미 이렇게 일하고 있어요
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">캠페인 제안서 생성</h3>
              </div>
              <p className="text-gray-600">섭외에 필요한 모든 내용을 제안서 하나로 구성하세요</p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
              <div className="mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">캠페인 성과 측정</h3>
              </div>
              <p className="text-gray-600">실제로 콘텐츠를 올렸는지 조회수는 얼마인지 확인하세요</p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
              <div className="mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">DM 템플릿</h3>
              </div>
              <p className="text-gray-600">가장 잘 통했던 메시지를 다음 캠페인에도 사용하세요</p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
              <div className="mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">발송 모니터링</h3>
              </div>
              <p className="text-gray-600">제안서 발송량과 성사율을 쉽게 확인하세요</p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
              <div className="mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">브랜드 인플루언서 풀 만들기</h3>
              </div>
              <p className="text-gray-600">
                우리 브랜드와 가장 잘 맞는 인플루언서 그룹을 관리하세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="w-full bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 md:text-5xl">
              다음 차례는 여러분 입니다
            </h2>
            <p className="mt-4 text-xl text-gray-600">최고의 브랜드들과 만들어온 눈에 띄는 성과</p>
          </div>

          {/* Success Metrics */}
          <StaggerContainer>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <StaggerItem>
                <motion.div className="text-center" whileHover={{ scale: 1.05 }}>
                  <Counter end={30} duration={2} />
                  <div className="text-lg text-gray-600">시간 효율 상승</div>
                </motion.div>
              </StaggerItem>
              <StaggerItem>
                <motion.div className="text-center" whileHover={{ scale: 1.05 }}>
                  <Counter end={95} duration={2} />
                  <div className="text-lg text-gray-600">성사율 향상</div>
                </motion.div>
              </StaggerItem>
              <StaggerItem>
                <motion.div className="text-center" whileHover={{ scale: 1.05 }}>
                  <Counter end={500} duration={2} />
                  <div className="text-lg text-gray-600">성공한 캠페인</div>
                </motion.div>
              </StaggerItem>
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* Agency Services */}
      <section className="w-full bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 md:text-5xl">
              담당 인력이 부족하신가요?
            </h2>
            <p className="mt-4 text-xl text-gray-600">GlowFactory와 협업하세요!</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Service 1 */}
            <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">목표 기반 전략 수립</h3>
              </div>
              <p className="text-gray-600">고객사의 목표를 기반으로 콘텐츠 전략을 수립합니다.</p>
            </div>

            {/* Service 2 */}
            <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">가설 기반 캠페인 별 콘텐츠 기획</h3>
              </div>
              <p className="text-gray-600">
                캠페인 별 가설을 수립하여 위닝 콘텐츠를 발굴하는데 집중합니다.
              </p>
            </div>

            {/* Service 3 */}
            <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  데이터 기반 분석 및 인사이트 도출
                </h3>
              </div>
              <p className="text-gray-600">
                정량적 분석 및 캠페인/콘텐츠 별 인사이트 기반의 리포트를 제공합니다.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="#"
              className="inline-flex items-center rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-700 transition-colors"
              aria-label="상담 신청"
            >
              상담 신청
            </Link>
          </div>
        </div>
      </section>

      {/* Blog/Insights Section */}
      <section className="w-full bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 md:text-5xl">
              시딩 마케팅에 대한 전문적인 인사이트를 얻어가세요
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                AI와 인플루언서 시딩이 만났을 때 생기는 일
              </h3>
              <p className="text-blue-600 text-sm">마케팅 인사이트 알아보기 →</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                팔로워가 아닌 &apos;이것&apos;? 시딩 마케팅 성공을 위한 인플루언서 선정 기준
              </h3>
              <p className="text-blue-600 text-sm">마케팅 인사이트 알아보기 →</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                글로벌 인플루언서 마케팅 에이전시, &apos;GlowFactory&apos; 3단계 프로세스
              </h3>
              <p className="text-blue-600 text-sm">마케팅 인사이트 알아보기 →</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full bg-gradient-to-br from-blue-600 to-indigo-700 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            K-브랜드를 위한 AI 시딩 솔루션
          </h2>
          <p className="mt-6 text-xl text-blue-100">
            우리 브랜드 감도에 맞는 인플루언서를 손쉽게 찾고, 노출성과를 극대화 하세요.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="#"
              className="inline-flex items-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg hover:bg-gray-50 transition-colors"
              aria-label="가벼운 커피챗"
            >
              가벼운 커피챗
            </Link>
            <Link
              href="#"
              className="inline-flex items-center rounded-full border-2 border-white px-8 py-4 text-lg font-semibold text-white hover:bg-white/10 transition-colors"
              aria-label="소개서 다운로드"
            >
              소개서 다운로드
            </Link>
          </div>
        </div>
      </section>

      {/* How it works - Updated */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 md:text-5xl">제품 사용법</h2>
          <p className="mt-4 text-xl text-gray-600">
            브랜드와 인플루언서 모두에게 간단한 3단계 프로세스
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* 브랜드(광고주) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">브랜드(광고주)</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-medium text-blue-600">STEP 1</p>
                <h4 className="mt-1 font-semibold text-gray-800">준비하기</h4>
                <Image
                  src="/images/step1_marketer.png"
                  alt="브랜드 준비하기"
                  width={300}
                  height={300}
                  className="mt-3 rounded-lg"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
                <p className="mt-2 text-sm text-gray-600">
                  이메일/소셜 로그인 후 브랜드 프로필 작성
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-medium text-blue-600">STEP 2</p>
                <h4 className="mt-1 font-semibold text-gray-800">캠페인 만들기</h4>
                <Image
                  src="/images/step2_marketer.png"
                  alt="캠페인 만들기"
                  width={300}
                  height={300}
                  className="mt-3 rounded-lg"
                />
                <p className="mt-2 text-sm text-gray-600">
                  목적·조건·보상·일정 등록 후 AI 추천 확인
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-medium text-blue-600">STEP 3</p>
                <h4 className="mt-1 font-semibold text-gray-800">협업</h4>
                <Image
                  src="/images/step3_marketer.png"
                  alt="브랜드 협업 진행"
                  width={300}
                  height={300}
                  className="mt-3 rounded-lg"
                />
                <p className="mt-2 text-sm text-gray-600">
                  제안서 승인·메시지 조율·콘텐츠 검수 후 완료
                </p>
              </div>
            </div>
          </div>

          {/* 인플루언서 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">인플루언서</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-medium text-green-600">STEP 1</p>
                <h4 className="mt-1 font-semibold text-gray-800">준비하기</h4>
                <Image
                  src="/images/step1_influencer.png"
                  alt="인플루언서 준비하기"
                  width={300}
                  height={300}
                  className="mt-3 rounded-lg"
                />
                <p className="mt-2 text-sm text-gray-600">
                  회원가입 후 프로필(카테고리&middot;채널&middot;팔로워&middot;참여율) 작성
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-medium text-green-600">STEP 2</p>
                <h4 className="mt-1 font-semibold text-gray-800">캠페인 찾기</h4>
                <Image
                  src="/images/step2_influencer.png"
                  alt="캠페인 찾기"
                  width={300}
                  height={300}
                  className="mt-3 rounded-lg"
                />
                <p className="mt-2 text-sm text-gray-600">
                  조건 검색&middot;AI 추천 확인 후 지원 및 제안서 제출
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-medium text-green-600">STEP 3</p>
                <h4 className="mt-1 font-semibold text-gray-800">협업</h4>
                <Image
                  src="/images/step3_marketer.png"
                  alt="인플루언서 협업 진행"
                  width={300}
                  height={300}
                  className="mt-3 rounded-lg"
                />
                <p className="mt-2 text-sm text-gray-600">
                  커뮤니케이션&middot;콘텐츠 제작&middot;업로드 후 완료 및 히스토리 관리
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
});
Home.displayName = "Home";

export default Home;
