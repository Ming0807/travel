"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="th">
      <body className="m-0 bg-background font-sans antialiased">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "2rem 1rem",
          }}
        >
          <div
            style={{
              maxWidth: "28rem",
              width: "100%",
              borderRadius: "2rem",
              background: "white",
              padding: "2rem",
              textAlign: "center",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                margin: "0 auto",
                display: "grid",
                width: "3.5rem",
                height: "3.5rem",
                placeItems: "center",
                borderRadius: "1rem",
                background: "#FFF1F0",
                color: "#E11D48",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm-8,56a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm8,104a12,12,0,1,1,12-12A12,12,0,0,1,128,184Z" />
              </svg>
            </div>
            <h1 style={{ marginTop: "1.25rem", fontSize: "1.75rem", fontWeight: 900, color: "#073F37" }}>
              เกิดข้อผิดพลาด
            </h1>
            <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", lineHeight: "1.625", color: "#64748B" }}>
              ระบบเกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองอีกครั้ง
              หากปัญหายังคงอยู่กรุณาติดต่อผู้ดูแลระบบ
            </p>
            {error.digest && (
              <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#94A3B8" }}>
                Error ID: {error.digest}
              </p>
            )}
            <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
              <button
                onClick={reset}
                style={{
                  display: "inline-flex",
                  borderRadius: "9999px",
                  background: "#0F766E",
                  padding: "0.75rem 1.25rem",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ลองอีกครั้ง
              </button>
              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  borderRadius: "9999px",
                  border: "2px solid #E2E8F0",
                  padding: "0.75rem 1.25rem",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "#334155",
                  background: "white",
                  textDecoration: "none",
                }}
              >
                กลับหน้าแรก
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
