"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useContext } from "react";
import { LanguageContext } from "@/app/layout";

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

// 세련된 배경 컴포넌트
const ParticleBackground = () => (
  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.05),transparent_50%)]"></div>
  </div>
);

// 최적화된 카운터 컴포넌트
const Counter = React.memo(({ end, duration = 2 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "50px",
  });

  useEffect(() => {
    if (inView) {
      const startTime = Date.now();
      const startCount = count;

      const updateCount = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = Math.floor(startCount + (end - startCount) * easeOutQuart);

        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        }
      };

      requestAnimationFrame(updateCount);
    }
  }, [inView, end, duration, count]);

  return (
    <span ref={ref} className="font-bold text-4xl md:text-6xl">
      {count.toLocaleString()}+
    </span>
  );
});
Counter.displayName = "Counter";

// 마키 애니메이션 컴포넌트
const Marquee = ({
  children,
  direction = "left",
}: {
  children: React.ReactNode;
  direction?: "left" | "right";
}) => {
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div
        className="inline-flex"
        animate={{
          x: direction === "left" ? "-100%" : "100%",
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 20,
            ease: "linear",
          },
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default function Home() {
  const { language } = useContext(LanguageContext);

  const content = {
    ko: {
      hero: {
        title: "GLOW FACTORY",
        subtitle: "브랜드와 크리에이터를 연결하는",
        description: "인플루언서-브랜드 매칭 플랫폼으로 브랜드와 완벽한 크리에이터를 연결합니다",
      },
      buttons: {
        start: "여정 시작하기",
      },
      stats: {
        creators: "활성 크리에이터",
        brands: "연결된 브랜드",
        success: "성공률 %",
      },
      features: {
        title: "우리가 하는 일",
        forCreators: {
          title: "크리에이터를 위해",
          description:
            "같은 가치를 공유하는 브랜드를 만나고 연결하세요. 더 많은 협업을 성사시키고 업계에서 인정받으세요.",
          features: ["스마트 브랜드 매칭", "자동화된 협업 제안", "성과 분석"],
        },
        forBrands: {
          title: "브랜드를 위해",
          description:
            "엄선된 10,000명 이상의 인플루언서 네트워크와 연결하세요. 브랜드와 오디언스에 완벽한 매치를 찾으세요.",
          features: ["고급 크리에이터 검색", "캠페인 관리", "ROI 추적"],
        },
      },
      services: {
        title: "우리의 서비스",
        items: [
          {
            title: "스마트 매칭",
            description: "효율적인 알고리즘이 브랜드와 완벽한 크리에이터를 연결합니다",
          },
          {
            title: "캠페인 관리",
            description: "엔드투엔드 캠페인 실행 및 모니터링",
          },
          {
            title: "분석 대시보드",
            description: "실시간 성과 추적 및 인사이트",
          },
        ],
      },
      cta: {
        title: "시작할 준비가 되셨나요?",
        description:
          "이미 GlowFactory를 사용하여 비즈니스를 성장시키고 있는 수천 명의 브랜드와 크리에이터에 합류하세요.",
        buttons: {
          start: "여정 시작하기",
        },
        email: {
          subject: "GlowFactory 문의",
          body: "안녕하세요, GlowFactory에 대해 문의드립니다.%0D%0A%0D%0A문의 내용:%0D%0A",
        },
      },
    },
    en: {
      hero: {
        title: "GLOW FACTORY",
        subtitle: "Connecting Brands & Creators",
        description:
          "Influencer-brand matching platform that connects brands with the perfect creators",
      },
      buttons: {
        start: "Start Your Journey",
      },
      stats: {
        creators: "Active Creators",
        brands: "Brands Connected",
        success: "Success Rate %",
      },
      features: {
        title: "What We Do",
        forCreators: {
          title: "For Creators",
          description:
            "Meet and connect with brands that share the same values as you. Land more collaborations and gain esteemed recognition in the industry.",
          features: [
            "Smart brand matching",
            "Automated collaboration proposals",
            "Performance analytics",
          ],
        },
        forBrands: {
          title: "For Brands",
          description:
            "Connect with our network of over 10,000 carefully selected influencers. Find the perfect fit for your brand and audience.",
          features: ["Advanced creator search", "Campaign management", "ROI tracking"],
        },
      },
      services: {
        title: "Our Services",
        items: [
          {
            title: "Smart Matching",
            description: "Efficient algorithm connects brands with perfect creators",
          },
          {
            title: "Campaign Management",
            description: "End-to-end campaign execution and monitoring",
          },
          {
            title: "Analytics Dashboard",
            description: "Real-time performance tracking and insights",
          },
        ],
      },
      cta: {
        title: "Ready to Get Started?",
        description:
          "Join thousands of brands and creators who are already using GlowFactory to grow their business.",
        buttons: {
          start: "Start Your Journey",
        },
        email: {
          subject: "GlowFactory Inquiry",
          body: "Hello, I would like to inquire about GlowFactory.%0D%0A%0D%0AInquiry details:%0D%0A",
        },
      },
    },
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-white text-black overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <ParticleBackground />

        <div className="relative z-10 text-center px-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-none">
              <span className="block bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">
                GLOW
              </span>
              <span className="block text-black">FACTORY</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-4xl font-light text-gray-600 mb-4">
              {t.hero.subtitle}
            </h2>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
              {t.hero.description}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center"
          >
            <a
              href={`mailto:glowfactory2112@gmail.com?subject=${t.cta.email.subject}&body=${t.cta.email.body}`}
              className="inline-flex items-center px-8 py-4 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
            >
              {t.buttons.start}
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-black rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-black rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <FadeInUp delay={0.1}>
              <div>
                <Counter end={10000} />
                <p className="text-xl text-gray-600 mt-4">{t.stats.creators}</p>
              </div>
            </FadeInUp>
            <FadeInUp delay={0.2}>
              <div>
                <Counter end={5000} />
                <p className="text-xl text-gray-600 mt-4">{t.stats.brands}</p>
              </div>
            </FadeInUp>
            <FadeInUp delay={0.3}>
              <div>
                <Counter end={95} />
                <p className="text-xl text-gray-600 mt-4">{t.stats.success}</p>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeInUp>
            <h2 className="text-5xl md:text-7xl font-black text-center mb-20">
              {t.features.title}
            </h2>
          </FadeInUp>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* For Creators */}
            <FadeInUp delay={0.1}>
              <div className="group">
                <div className="group bg-white p-10 rounded-3xl border-2 border-gray-200 hover:border-gray-400 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <h3 className="text-5xl font-black mb-8 text-black tracking-tight">
                      {t.features.forCreators.title}
                    </h3>
                    <p className="text-xl text-gray-600 mb-10 leading-relaxed font-light">
                      {t.features.forCreators.description}
                    </p>
                    <ul className="space-y-6 text-gray-700">
                      {t.features.forCreators.features.map((feature, index) => (
                        <li key={index} className="flex items-center group/item">
                          <span className="w-3 h-3 bg-gradient-to-r from-black to-gray-600 rounded-full mr-6 group-hover/item:scale-125 transition-transform duration-300"></span>
                          <span className="text-lg font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </FadeInUp>

            {/* For Brands */}
            <FadeInUp delay={0.2}>
              <div className="group">
                <div className="group bg-white p-10 rounded-3xl border-2 border-gray-200 hover:border-gray-400 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <h3 className="text-5xl font-black mb-8 text-black tracking-tight">
                      {t.features.forBrands.title}
                    </h3>
                    <p className="text-xl text-gray-600 mb-10 leading-relaxed font-light">
                      {t.features.forBrands.description}
                    </p>
                    <ul className="space-y-6 text-gray-700">
                      {t.features.forBrands.features.map((feature, index) => (
                        <li key={index} className="flex items-center group/item">
                          <span className="w-3 h-3 bg-gradient-to-r from-black to-gray-600 rounded-full mr-6 group-hover/item:scale-125 transition-transform duration-300"></span>
                          <span className="text-lg font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-40 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <FadeInUp>
            <h2 className="text-5xl md:text-7xl font-black text-center mb-20">
              {t.services.title}
            </h2>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.services.items.map((service, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <div className="group">
                  <div className="group bg-white p-10 rounded-3xl border-2 border-gray-200 hover:border-gray-400 transition-all duration-500 transform hover:scale-110 hover:shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="w-20 h-20 bg-gradient-to-br from-black to-gray-700 rounded-3xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-300">
                        {["🤖", "📊", "📈"][index]}
                      </div>
                      <h3 className="text-3xl font-black mb-6 text-black tracking-tight">
                        {service.title}
                      </h3>
                      <p className="text-lg text-gray-600 leading-relaxed font-light">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 bg-black">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <FadeInUp>
            <h2 className="text-5xl md:text-7xl font-black mb-8 text-white">{t.cta.title}</h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              {t.cta.description}
            </p>
            <div className="flex justify-center">
              <a
                href={`mailto:glowfactory2112@gmail.com?subject=${t.cta.email.subject}&body=${t.cta.email.body}`}
                className="group inline-flex items-center px-16 py-8 bg-white text-black font-black text-2xl rounded-full hover:bg-gray-100 transition-all duration-500 transform hover:scale-110 hover:shadow-2xl border-4 border-transparent hover:border-gray-300 relative overflow-hidden"
              >
                <span className="relative z-10">{t.cta.buttons.start}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </a>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="py-20 bg-white overflow-hidden">
        <Marquee direction="left">
          <div className="flex items-center space-x-8 text-6xl font-black text-gray-200">
            <span>GLOW FACTORY</span>
            <span>•</span>
            <span>AI POWERED</span>
            <span>•</span>
            <span>INFLUENCER MATCHING</span>
            <span>•</span>
            <span>BRAND CONNECTIONS</span>
            <span>•</span>
            <span>CREATOR NETWORK</span>
            <span>•</span>
          </div>
        </Marquee>
      </section>
    </div>
  );
}
