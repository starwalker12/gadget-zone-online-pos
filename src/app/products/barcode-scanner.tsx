"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Camera, CameraOff } from "lucide-react";

type Props = {
  onDetected: (barcode: string) => void;
  disabled?: boolean;
};

type ScannerState =
  | { status: "idle" }
  | { status: "opening" }
  | { status: "scanning"; stream: MediaStream }
  | { status: "error"; message: string };

export function BarcodeScanner({ onDetected, disabled }: Props) {
  const [state, setState] = useState<ScannerState>({ status: "idle" });
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);
  const detectorRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const [hasNative, setHasNative] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHasNative("BarcodeDetector" in window);
  }, []);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (readerRef.current) {
      try { readerRef.current.reset(); } catch { /* noop */ }
      readerRef.current = null;
    }
    if (state.status === "scanning") {
      state.stream.getTracks().forEach((t) => t.stop());
    }
    setState({ status: "idle" });
  }, [state]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (readerRef.current) {
        try { readerRef.current.reset(); } catch { /* noop */ }
      }
      if (state.status === "scanning") {
        state.stream.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Native BarcodeDetector path (Chromium) ──
  const startNative = useCallback(async (stream: MediaStream) => {
    const BarcodeDetectorCtor = (window as any).BarcodeDetector;
    detectorRef.current = new BarcodeDetectorCtor({
      formats: [
        "qr_code", "ean_13", "ean_8", "upc_a", "upc_e",
        "code_128", "code_39", "code_93", "codabar",
        "itf", "data_matrix", "pdf417", "aztec",
      ],
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    const detect = async () => {
      if (!videoRef.current || !detectorRef.current) return;
      try {
        const codes = await detectorRef.current.detect(videoRef.current);
        if (codes.length > 0 && codes[0].rawValue) {
          onDetected(codes[0].rawValue);
          stopCamera();
          return;
        }
      } catch {
        // continue
      }
      rafRef.current = requestAnimationFrame(detect);
    };
    rafRef.current = requestAnimationFrame(detect);
  }, [onDetected, stopCamera]);

  // ── ZXing fallback path (Safari/Firefox) ──
  const startFallback = useCallback(async (stream: MediaStream) => {
    const { BrowserMultiFormatReader } = await import("@zxing/browser");
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    reader.decodeFromVideoElement(videoRef.current!, (result, err) => {
      if (result) {
        onDetected(result.getText());
        stopCamera();
      }
    });
  }, [onDetected, stopCamera]);

  const startCamera = useCallback(async () => {
    if (!hasNative && typeof window === "undefined") return;
    setState({ status: "opening" });

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
        });
      }

      setState({ status: "scanning", stream });

      if (hasNative) {
        await startNative(stream);
      } else {
        await startFallback(stream);
      }
    } catch (err) {
      const msg =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Camera permission denied."
          : "Could not open camera.";
      setState({ status: "error", message: msg });
    }
  }, [hasNative, startNative, startFallback]);

  // ── Render ──
  if (state.status === "scanning") {
    return (
      <div className="relative mt-2 overflow-hidden rounded-lg border border-slate-200 bg-black sm:col-span-2">
        <video ref={videoRef} autoPlay playsInline muted className="h-48 w-full object-cover" />
        <button
          type="button"
          onClick={stopCamera}
          className="absolute top-2 right-2 rounded-lg bg-slate-900/70 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-900"
        >
          <CameraOff className="mr-1 inline size-4" />
          Stop
        </button>
        <p className="absolute bottom-2 left-2 rounded bg-slate-900/60 px-2 py-1 text-xs text-white">
          Point camera at a barcode
        </p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <p className="text-xs text-red-600 sm:col-span-2">{state.message}</p>
    );
  }

  return (
    <button
      type="button"
      onClick={startCamera}
      disabled={disabled || state.status === "opening"}
      className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
    >
      {state.status === "opening" ? (
        "Opening camera…"
      ) : (
        <>
          <Camera className="mr-1 inline size-4" />
          Scan with camera
        </>
      )}
    </button>
  );
}
