import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const layoutSource = readFileSync(resolve(process.cwd(), "app/layout.tsx"), "utf8");
const globalStyles = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");

describe("public design system contract", () => {
  it("exposes Noto Sans Thai and Kanit variables on the body", () => {
    expect(layoutSource).toMatch(/variable:\s*["']--font-body["']/);
    expect(layoutSource).toMatch(/variable:\s*["']--font-heading["']/);
    expect(layoutSource).toMatch(/<body[^>]*className=\{[\s\S]*notoSansThai\.variable[\s\S]*kanit\.variable[\s\S]*\}/);
  });

  it("defines the approved public palette and radius tokens", () => {
    expect(globalStyles).toMatch(/--public-ink:\s*#17212B/);
    expect(globalStyles).toMatch(/--public-coral:\s*#E77455/);
    expect(globalStyles).toMatch(/--public-teal:\s*#0A6B62/);
    expect(globalStyles).toMatch(/--public-gold:\s*#D6A13D/);
    expect(globalStyles).toMatch(/--public-canvas:\s*#F8FAFC/);
    expect(globalStyles).toMatch(/--public-radius-control:\s*6px/);
    expect(globalStyles).toMatch(/--public-radius-panel:\s*8px/);
  });

  it("assigns distinct Noto Sans Thai body and Kanit heading roles", () => {
    expect(globalStyles).toMatch(/body\s*\{[^}]*font-family:\s*var\(--font-body\)/s);
    expect(globalStyles).toMatch(/h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6\s*\{[^}]*font-family:\s*var\(--font-heading\)/s);
    expect(globalStyles).not.toMatch(/body\s*\{[^}]*font-family:\s*var\(--font-heading\)/s);
  });

  it("defines a reduced-motion contract for scroll, animation, and transitions", () => {
    const reducedMotion = globalStyles.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";

    expect(reducedMotion).toMatch(/scroll-behavior:\s*auto/);
    expect(reducedMotion).toMatch(/animation-duration:\s*0\.01ms/);
    expect(reducedMotion).toMatch(/transition-duration:\s*0\.01ms/);
  });

  it("does not retain unloaded Prompt or Sarabun in the active font contract", () => {
    expect(`${layoutSource}\n${globalStyles}`).not.toMatch(/Prompt|Sarabun/);
  });
});
