"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, Check, Spinner, X } from "@phosphor-icons/react/dist/ssr";

type FacingMode = "environment" | "user";

type CameraCaptureDialogProps = {
  onCapture: (file: File) => void;
  onClose: () => void;
  onNativeFallback: () => void;
};

function cameraErrorMessage(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      return "ยังไม่ได้อนุญาตให้ใช้กล้อง กรุณาอนุญาตกล้องในการตั้งค่าเว็บไซต์ หรือใช้กล้องของอุปกรณ์แทน";
    }
    if (error.name === "NotFoundError" || error.name === "OverconstrainedError") {
      return "ไม่พบกล้องที่พร้อมใช้งาน กรุณาใช้กล้องของอุปกรณ์หรือเลือกจากคลังรูปแทน";
    }
    if (error.name === "NotReadableError" || error.name === "AbortError") {
      return "กล้องกำลังถูกใช้งานโดยแอปอื่น กรุณาปิดแอปนั้นแล้วลองใหม่";
    }
  }

  return "เปิดกล้องไม่สำเร็จ กรุณาลองใหม่ หรือใช้กล้องของอุปกรณ์แทน";
}

export function CameraCaptureDialog({
  onCapture,
  onClose,
  onNativeFallback,
}: CameraCaptureDialogProps) {
  const supportsBrowserCamera =
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices?.getUserMedia === "function";
  const [facingMode, setFacingMode] = useState<FacingMode>("environment");
  const [status, setStatus] = useState<"requesting" | "ready" | "error">(
    supportsBrowserCamera ? "requesting" : "error",
  );
  const [error, setError] = useState<string | null>(
    supportsBrowserCamera
      ? null
      : "เบราว์เซอร์นี้เปิดกล้องในหน้าเว็บไม่ได้ กรุณาเปิดแอปกล้องของอุปกรณ์แทน",
  );
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => !element.hasAttribute("hidden"));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (!supportsBrowserCamera) return;

    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: { facingMode: { ideal: facingMode } },
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => undefined);
        }
        setStatus("ready");
      })
      .catch((cameraError) => {
        if (cancelled) return;
        setError(cameraErrorMessage(cameraError));
        setStatus("error");
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [facingMode, supportsBrowserCamera]);

  useEffect(() => {
    return () => {
      if (capturedPreview) URL.revokeObjectURL(capturedPreview);
    };
  }, [capturedPreview]);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setCaptureError("กล้องยังไม่พร้อม กรุณารอสักครู่แล้วลองอีกครั้ง");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setCaptureError("ไม่สามารถเตรียมรูปจากกล้องได้ กรุณาลองใหม่");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        setCaptureError("บันทึกรูปจากกล้องไม่สำเร็จ กรุณาลองใหม่");
        return;
      }

      const file = new File([blob], `visit-photo-${Date.now()}.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
      if (capturedPreview) URL.revokeObjectURL(capturedPreview);
      setCapturedFile(file);
      setCapturedPreview(URL.createObjectURL(file));
      setCaptureError(null);
    }, "image/jpeg", 0.9);
  };

  const retakePhoto = () => {
    if (capturedPreview) URL.revokeObjectURL(capturedPreview);
    setCapturedFile(null);
    setCapturedPreview(null);
    setCaptureError(null);
  };

  const usePhoto = () => {
    if (!capturedFile) return;
    onCapture(capturedFile);
    onClose();
  };

  const useNativeCamera = () => {
    onClose();
    window.setTimeout(onNativeFallback, 0);
  };

  const dialog = (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-dialog-title"
      aria-describedby="camera-dialog-description"
      className="fixed inset-0 z-[100] flex h-[100dvh] max-h-[100dvh] w-screen flex-col overflow-hidden bg-black text-white"
    >
      <header className="flex min-h-16 shrink-0 items-center justify-between border-b border-white/15 px-4">
        <div>
          <h2 id="camera-dialog-title" className="text-base font-bold">ใช้กล้องถ่ายรูป</h2>
          <p id="camera-dialog-description" className="mt-0.5 text-xs text-white/70">
            ระบบจะขอสิทธิ์ใช้กล้องเมื่อคุณกดปุ่มนี้เท่านั้น
          </p>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="ปิดกล้อง"
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <X size={24} aria-hidden="true" />
        </button>
      </header>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-y-auto bg-black">
        {capturedPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={capturedPreview} alt="ภาพที่เพิ่งถ่าย" className="h-full w-full object-contain" />
        ) : (
          <video
            ref={videoRef}
            muted
            playsInline
            aria-label="ภาพสดจากกล้อง"
            className={`h-full w-full object-cover ${facingMode === "user" ? "-scale-x-100" : ""}`}
          />
        )}

        {status === "requesting" && !capturedPreview && (
          <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80">
            <Spinner size={32} className="animate-spin" aria-hidden="true" />
            <p className="text-sm font-medium">กำลังขอสิทธิ์และเปิดกล้อง...</p>
          </div>
        )}

        {status === "error" && !capturedPreview && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <Camera size={44} className="mb-4 text-white/70" aria-hidden="true" />
            <p role="alert" className="max-w-sm text-sm leading-6 text-white/90">{error}</p>
            <button
              type="button"
              onClick={useNativeCamera}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-bold text-black"
            >
              <Camera size={18} weight="fill" aria-hidden="true" />
              เปิดแอปกล้อง
            </button>
            {!supportsBrowserCamera && (
              <p className="mt-3 max-w-sm text-xs leading-5 text-white/60">
                อุปกรณ์บางรุ่นอาจให้เลือกแอปกล้องก่อนเปิดใช้งาน
              </p>
            )}
          </div>
        )}
      </div>

      <footer className="shrink-0 border-t border-white/15 bg-black px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
        {captureError && <p role="alert" className="mb-3 text-center text-sm text-red-300">{captureError}</p>}
        {capturedFile ? (
          <div className="mx-auto grid w-full max-w-md grid-cols-2 gap-3">
            <button
              type="button"
              onClick={retakePhoto}
              className="min-h-12 rounded-md border border-white/30 px-4 text-sm font-bold text-white"
            >
              ถ่ายใหม่
            </button>
            <button
              type="button"
              onClick={usePhoto}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-coral px-4 text-sm font-bold text-white"
            >
              <Check size={18} weight="bold" aria-hidden="true" />
              ใช้ภาพนี้
            </button>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-md items-center justify-between gap-4">
            <button
              type="button"
              disabled={status !== "ready"}
              onClick={() => {
                setStatus("requesting");
                setError(null);
                setFacingMode((current) => current === "environment" ? "user" : "environment");
              }}
              className="min-h-11 rounded-md px-3 text-sm font-bold text-white disabled:opacity-40"
            >
              สลับกล้อง
            </button>
            <button
              type="button"
              aria-label="ถ่ายภาพ"
              disabled={status !== "ready"}
              onClick={capturePhoto}
              className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/25 disabled:opacity-40"
            >
              <span className="h-12 w-12 rounded-full bg-white" />
            </button>
            <div className="w-[76px]" aria-hidden="true" />
          </div>
        )}
      </footer>
    </div>
  );

  return createPortal(dialog, document.body);
}
