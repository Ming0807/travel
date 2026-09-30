"use client";

import { useEffect, useRef } from "react";

/** Progressive enhancement: SSR content stays visible even without this script. */
export function HomepageMotion() {
  const anchor = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = anchor.current?.closest("main");
    if (!root || typeof window.matchMedia !== "function") return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;
    const seen = new WeakSet<Element>();
    const animations = new Set<Animation>();
    const animate = (node: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
      if (preference.matches || typeof node.animate !== "function") return;
      const animation = node.animate(keyframes, options);
      animations.add(animation);
      animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
    };
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver((entries) => {
      entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
        observer?.unobserve(entry.target);
        const siblings = entry.target.parentElement ? Array.from(entry.target.parentElement.children) : [];
        const index = Math.max(0, siblings.indexOf(entry.target));
        animate(entry.target, [{ opacity: .55, transform: "translateY(16px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 440, delay: Math.min(index * 45, 180), easing: "cubic-bezier(.22,1,.36,1)" });
      });
    }, { threshold: .12 });
    const register = () => {
      root.querySelectorAll(".ed-hero-visual .ed-photo, .ed-hero-copy > *, .ed-category, .ed-destination").forEach((node) => {
        if (seen.has(node)) return;
        seen.add(node);
        if (node.closest(".ed-hero-visual")) {
          const rect = node.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) return;
          animate(node, [{ transform: "scale(1.035)" }, { transform: "scale(1)" }], { duration: 700, easing: "cubic-bezier(.22,1,.36,1)" });
        } else if (node.parentElement?.classList.contains("ed-hero-copy")) {
          const rect = node.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) return;
          const index = Array.from(node.parentElement.children).indexOf(node);
          animate(node, [{ opacity: .65, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 520, delay: Math.min(index * 50, 200), easing: "cubic-bezier(.22,1,.36,1)" });
        } else observer?.observe(node);
      });
    };
    register();
    // Watch only until the server-streamed sections arrive; Leaflet mutations
    // should not keep rescanning the page after the initial content is complete.
    const streamedContent = root.querySelector(".ed-closing") ? null : new MutationObserver(() => {
      register();
      if (root.querySelector(".ed-closing")) streamedContent?.disconnect();
    });
    streamedContent?.observe(root, { childList: true, subtree: true });
    const stop = () => { if (preference.matches) { observer?.disconnect(); animations.forEach((animation) => animation.cancel()); animations.clear(); } };
    preference.addEventListener("change", stop);
    return () => {
      streamedContent?.disconnect(); observer?.disconnect();
      preference.removeEventListener("change", stop);
      animations.forEach((animation) => animation.cancel());
    };
  }, []);
  return <span ref={anchor} hidden aria-hidden="true" />;
}
