"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";

// 최적화된 파티클 효과 컴포넌트
const ParticleBackground = React.memo(() => {
  const particles = useMemo(
    () =>
      [...Array(10)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 2,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            willChange: "transform, opacity",
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
});

ParticleBackground.displayName = "ParticleBackground";

export default ParticleBackground;
