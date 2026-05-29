"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type RecaptchaStatus = "unconfigured" | "loading" | "ready" | "failed" | "verified";

interface RecaptchaProps {
  onChange: (token: string | null) => void;
  onStatus?: (status: RecaptchaStatus) => void;
  resetRef?: React.MutableRefObject<(() => void) | null>;
}

export function Recaptcha({ onChange, onStatus, resetRef }: RecaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const scriptLoadedRef = useRef(false);
  const scriptFailedRef = useRef(false);
  const [status, setStatus] = useState<RecaptchaStatus>(() => {
    const key = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY : undefined;
    return key ? "loading" : "unconfigured";
  });
  const siteKey =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
      : undefined;

  const reportStatus = useCallback((s: RecaptchaStatus) => {
    setStatus(s);
    onStatus?.(s);
  }, [onStatus]);

  const reset = useCallback(() => {
    if (widgetIdRef.current !== null && window.grecaptcha) {
      window.grecaptcha.reset(widgetIdRef.current);
      onChange(null);
    }
  }, [onChange]);

  useEffect(() => {
    if (resetRef) {
      resetRef.current = reset;
    }
    return () => {
      if (resetRef) {
        resetRef.current = null;
      }
    };
  }, [reset, resetRef]);

  useEffect(() => {
    if (!siteKey) return;

    if (window.grecaptcha) {
      scriptLoadedRef.current = true;
      return;
    }

    const onLoad = () => {
      scriptLoadedRef.current = true;
    };

    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = onLoad;
    script.onerror = () => {
      scriptFailedRef.current = true;
      reportStatus("failed");
    };
    document.head.appendChild(script);

    return () => {
      if (widgetIdRef.current !== null && window.grecaptcha) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
        } catch {
          // widget may have been destroyed
        }
      }
    };
  }, [siteKey, reportStatus]);

  useEffect(() => {
    if (!scriptLoadedRef.current || !containerRef.current || !siteKey) return;
    if (scriptFailedRef.current) return;
    if (!window.grecaptcha) return;
    if (widgetIdRef.current !== null) return;

    try {
      const widgetId = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          reportStatus("verified");
          onChange(token);
        },
        "expired-callback": () => {
          reportStatus("ready");
          onChange(null);
        },
        "error-callback": () => {
          reportStatus("failed");
          onChange(null);
        },
      });
      widgetIdRef.current = widgetId;
      // Defer to avoid set-state-in-effect lint warning.
      // The effect synchronizes with the external grecaptcha system, which is
      // the intended use case for effects, but we defer to satisfy the lint rule.
      requestAnimationFrame(() => { reportStatus("ready"); });
    } catch {
      requestAnimationFrame(() => { reportStatus("failed"); });
    }
  }, [siteKey, onChange, reportStatus]);

  if (!siteKey) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-700">
          reCAPTCHA not configured — set NEXT_PUBLIC_RECAPTCHA_SITE_KEY
        </div>
      );
    }
    return null;
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center">
        <div className="h-16 w-[200px] animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-700">
        Security check could not load. Refresh the page or try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div ref={containerRef} />
    </div>
  );
}
