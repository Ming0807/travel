/**
 * Simple in-memory rate limiter using a Map.
 * Note: For a multi-instance production environment (e.g., Vercel Serverless), 
 * a centralized store like Redis/Upstash is recommended. This is sufficient for MVP.
 */

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export function rateLimit(ip: string, limit: number, windowMs: number): { success: boolean; remaining: number } {
  const now = Date.now();
  let record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    record = {
      count: 0,
      resetAt: now + windowMs,
    };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }

  record.count += 1;
  rateLimitMap.set(ip, record);

  return { 
    success: true, 
    remaining: limit - record.count 
  };
}
