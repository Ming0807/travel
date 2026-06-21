"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export function ConfettiEffect() {
  const [hasFired, setHasFired] = useState(false);

  useEffect(() => {
    if (hasFired) return;
    
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: ReturnType<typeof setInterval> = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        setHasFired(true);
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#E18868', '#f5a88c', '#FAF3EE', '#1a1c23']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#E18868', '#f5a88c', '#FAF3EE', '#1a1c23']
      });
    }, 250);

    return () => clearInterval(interval);
  }, [hasFired]);

  return null;
}
