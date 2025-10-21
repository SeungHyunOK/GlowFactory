"use client";
import React, { useEffect, useState } from "react";
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
const Marquee = ({ children, direction = "left" }: { children: React.ReactNode; direction?: "left" | "right" }) => {
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

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
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
              <span className="block bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                GLOW
              </span>
              <span className="block text-white">FACTORY</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-4xl font-light text-gray-300 mb-4">
              Connecting
            </h2>
            <h2 className="text-2xl md:text-4xl font-light text-gray-300 mb-4">
              Brands &
            </h2>
            <h2 className="text-2xl md:text-4xl font-light text-gray-300 mb-8">
              Creators
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              AI-powered influencer discovery platform that connects brands with the perfect creators
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/discovery"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              Start Discovering
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-black transition-all duration-300"
            >
              Learn More
            </Link>
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
            className="w-6 h-10 border-2 border-white rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-white rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900 to-pink-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <FadeInUp delay={0.1}>
              <div>
                <Counter end={10000} />
                <p className="text-xl text-gray-300 mt-4">Active Creators</p>
              </div>
            </FadeInUp>
            <FadeInUp delay={0.2}>
              <div>
                <Counter end={5000} />
                <p className="text-xl text-gray-300 mt-4">Brands Connected</p>
              </div>
            </FadeInUp>
            <FadeInUp delay={0.3}>
              <div>
                <Counter end={95} />
                <p className="text-xl text-gray-300 mt-4">Success Rate %</p>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <FadeInUp>
            <h2 className="text-5xl md:text-7xl font-black text-center mb-20">
              What We Do
            </h2>
          </FadeInUp>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* For Creators */}
            <FadeInUp delay={0.1}>
              <div className="group">
                <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 p-8 rounded-3xl border border-pink-500/30 hover:border-pink-500/50 transition-all duration-300">
                  <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                    For Creators
                  </h3>
                  <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                    Meet and connect with brands that share the same values as you. 
                    Land more collaborations and gain esteemed recognition in the industry.
                  </p>
                  <ul className="space-y-4 text-gray-300">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-pink-500 rounded-full mr-4"></span>
                      AI-powered brand matching
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-pink-500 rounded-full mr-4"></span>
                      Automated collaboration proposals
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-pink-500 rounded-full mr-4"></span>
                      Performance analytics
                    </li>
                  </ul>
                </div>
              </div>
            </FadeInUp>

            {/* For Brands */}
            <FadeInUp delay={0.2}>
              <div className="group">
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 p-8 rounded-3xl border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300">
                  <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    For Brands
                  </h3>
                  <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                    Connect with our network of over 10,000 influencers hand-picked and curated by AI. 
                    Find the perfect fit for your brand and audience.
                  </p>
                  <ul className="space-y-4 text-gray-300">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-4"></span>
                      Advanced creator search
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-4"></span>
                      Campaign management
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-4"></span>
                      ROI tracking
                    </li>
                  </ul>
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 bg-gradient-to-b from-black to-purple-900">
        <div className="max-w-7xl mx-auto px-6">
          <FadeInUp>
            <h2 className="text-5xl md:text-7xl font-black text-center mb-20">
              Our Services
            </h2>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "AI Matching",
                description: "Smart algorithm connects brands with perfect creators",
                icon: "🤖",
                gradient: "from-pink-500 to-red-500"
              },
              {
                title: "Campaign Management",
                description: "End-to-end campaign execution and monitoring",
                icon: "📊",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                title: "Analytics Dashboard",
                description: "Real-time performance tracking and insights",
                icon: "📈",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                title: "Content Creation",
                description: "AI-assisted content planning and optimization",
                icon: "✨",
                gradient: "from-purple-500 to-pink-500"
              }
            ].map((service, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <div className="group">
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:transform hover:scale-105">
                    <div className={`w-16 h-16 bg-gradient-to-r ${service.gradient} rounded-2xl flex items-center justify-center text-2xl mb-6`}>
                      {service.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{service.description}</p>
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <FadeInUp>
            <h2 className="text-5xl md:text-7xl font-black mb-8">
              Ready to Get Started?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
              Join thousands of brands and creators who are already using GlowFactory to grow their business.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/discovery"
                className="inline-flex items-center px-12 py-6 bg-white text-black font-bold text-xl rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                Start Your Journey
              </Link>
              <Link
                href="#contact"
                className="inline-flex items-center px-12 py-6 border-2 border-white text-white font-bold text-xl rounded-full hover:bg-white hover:text-black transition-all duration-300"
              >
                Contact Us
              </Link>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="py-20 bg-black overflow-hidden">
        <Marquee direction="left">
          <div className="flex items-center space-x-8 text-6xl font-black text-gray-800">
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