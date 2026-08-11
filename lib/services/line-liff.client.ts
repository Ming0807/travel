"use client";

type LiffClient = typeof import("@line/liff").default;

export type LineLinkLanguage = "th" | "en";

export type LineLinkResult =
  | {
      status: "linked";
      provider: "line";
    }
  | {
      status: "not_configured";
    }
  | {
      status: "login_redirected";
    }
  | {
      status: "error";
      code: string;
      message: string;
    };

export type LineRecoveryResult =
  | { status: "recovered" }
  | { status: "not_configured" }
  | { status: "login_redirected" }
  | { status: "error"; code: string; message: string };

type LineLinkInput = {
  hasConsented: true;
  language?: LineLinkLanguage;
};

type ApiFailure = {
  success?: false;
  error?: {
    code?: unknown;
    message?: unknown;
  } | string;
};

type ApiSuccess = {
  success: true;
  linked?: boolean;
  provider?: unknown;
};

let liffClientPromise: Promise<LiffClient> | null = null;

function getLineLiffId() {
  return process.env.NEXT_PUBLIC_LIFF_ID?.trim() || "";
}

export function isLineLiffConfigured() {
  return Boolean(getLineLiffId());
}

async function getInitializedLiffClient() {
  const liffId = getLineLiffId();

  if (!liffId) {
    return null;
  }

  if (!liffClientPromise) {
    liffClientPromise = import("@line/liff")
      .then(async ({ default: liff }) => {
        await liff.init({ liffId });
        return liff;
      })
      .catch((error: unknown) => {
        liffClientPromise = null;
        throw error;
      });
  }

  return liffClientPromise;
}

function getSafeError(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = (payload as ApiFailure).error;

    if (typeof error === "string" && error.trim()) {
      return {
        code: "LINE_LINK_FAILED",
        message: error,
      };
    }

    if (error && typeof error === "object") {
      const code = typeof error.code === "string" ? error.code : "LINE_LINK_FAILED";
      const message = typeof error.message === "string" && error.message.trim()
        ? error.message
        : fallback;

      return { code, message };
    }
  }

  return {
    code: "LINE_LINK_FAILED",
    message: fallback,
  };
}

async function readJsonSafely(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function linkLineAccount(input: LineLinkInput): Promise<LineLinkResult> {
  if (!input.hasConsented) {
    return {
      status: "error",
      code: "CONSENT_REQUIRED",
      message: "Please consent before linking LINE.",
    };
  }

  try {
    const liff = await getInitializedLiffClient();

    if (!liff) {
      return { status: "not_configured" };
    }

    if (!liff.isLoggedIn()) {
      liff.login({ redirectUri: window.location.href });
      return { status: "login_redirected" };
    }

    const idToken = liff.getIDToken();

    if (!idToken) {
      return {
        status: "error",
        code: "LINE_ID_TOKEN_UNAVAILABLE",
        message: "We could not verify LINE securely. Please try again.",
      };
    }

    const response = await fetch("/api/line/link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idToken,
        hasConsented: true,
        language: input.language,
      }),
    });
    const payload = (await readJsonSafely(response)) as ApiSuccess | ApiFailure | null;

    if (response.ok && payload?.success === true && payload.linked === true && payload.provider === "line") {
      return {
        status: "linked",
        provider: "line",
      };
    }

    const fallback = response.ok
      ? "We could not link LINE right now. Your guest passport is still available on this device."
      : "We could not save LINE linking right now. Please try again later.";
    const error = getSafeError(payload, fallback);

    return {
      status: "error",
      ...error,
    };
  } catch {
    return {
      status: "error",
      code: "LINE_LINK_UNAVAILABLE",
      message: "LINE linking is temporarily unavailable. You can continue as Guest.",
    };
  }
}

export async function recoverLinePassport(input: LineLinkInput): Promise<LineRecoveryResult> {
  if (!input.hasConsented) {
    return {
      status: "error",
      code: "CONSENT_REQUIRED",
      message: "กรุณายืนยันความยินยอมก่อนกู้คืนพาสปอร์ต",
    };
  }

  try {
    const liff = await getInitializedLiffClient();
    if (!liff) return { status: "not_configured" };

    if (!liff.isLoggedIn()) {
      liff.login({ redirectUri: window.location.href });
      return { status: "login_redirected" };
    }

    const idToken = liff.getIDToken();
    if (!idToken) {
      return {
        status: "error",
        code: "LINE_ID_TOKEN_UNAVAILABLE",
        message: "ไม่สามารถยืนยันบัญชี LINE ได้ กรุณาลองใหม่",
      };
    }

    const response = await fetch("/api/line/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idToken,
        hasConsented: true,
        language: input.language,
      }),
    });
    const payload = await readJsonSafely(response);

    if (
      response.ok &&
      payload &&
      typeof payload === "object" &&
      "success" in payload &&
      payload.success === true &&
      "recovered" in payload &&
      payload.recovered === true
    ) {
      return { status: "recovered" };
    }

    const error = getSafeError(payload, "ยังกู้คืนพาสปอร์ตไม่ได้ กรุณาลองใหม่");
    return { status: "error", ...error };
  } catch {
    return {
      status: "error",
      code: "LINE_RECOVERY_UNAVAILABLE",
      message: "LINE ยังไม่พร้อมใช้งานในตอนนี้ กรุณาลองใหม่ภายหลัง",
    };
  }
}
