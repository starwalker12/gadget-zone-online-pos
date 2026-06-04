import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { env } from "@/lib/env";

const COOKIE_NAME = "captcha_ok";
const CAPTCHA_WINDOW_SECONDS = 300;
const MAX_ATTEMPTS = 5;

type CaptchaPassData = {
  ip: string;
  ts: number;
  remaining: number;
};

function getHmacKey(): string | null {
  return env.RECAPTCHA_SECRET_KEY ?? null;
}

function signPayload(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("hex");
}

function verifySignature(payload: string, signature: string, key: string): boolean {
  try {
    const expected = signPayload(payload, key);
    if (expected.length !== signature.length) return false;
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

function encode(data: CaptchaPassData, key: string): string {
  const payload = JSON.stringify(data);
  const sig = signPayload(payload, key);
  return `${payload}.${sig}`;
}

function decode(raw: string, key: string, clientIp: string): CaptchaPassData | null {
  const dotIndex = raw.lastIndexOf(".");
  if (dotIndex === -1) return null;
  const payload = raw.slice(0, dotIndex);
  const sig = raw.slice(dotIndex + 1);

  if (!verifySignature(payload, sig, key)) return null;

  let data: CaptchaPassData;
  try {
    data = JSON.parse(payload);
  } catch {
    return null;
  }

  if (typeof data.ip !== "string" || typeof data.ts !== "number" || typeof data.remaining !== "number") return null;
  if (data.ip !== clientIp) return null;

  const ageMs = Date.now() - data.ts;
  if (ageMs > CAPTCHA_WINDOW_SECONDS * 1000) return null;
  if (data.remaining <= 0) return null;

  return data;
}

export async function setCaptchaPass(ip: string): Promise<void> {
  const key = getHmacKey();
  if (!key) return;

  const data: CaptchaPassData = { ip, ts: Date.now(), remaining: MAX_ATTEMPTS };
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encode(data, key), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: CAPTCHA_WINDOW_SECONDS,
    path: "/",
  });
}

export async function readCaptchaPass(ip: string): Promise<CaptchaPassData | null> {
  const key = getHmacKey();
  if (!key) return null;

  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  return decode(raw, key, ip);
}

export async function decrementCaptchaPass(ip: string): Promise<void> {
  const key = getHmacKey();
  if (!key) return;

  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return;

  const data = decode(raw, key, ip);
  if (!data) return;

  data.remaining -= 1;

  if (data.remaining <= 0) {
    cookieStore.set(COOKIE_NAME, "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
    return;
  }

  cookieStore.set(COOKIE_NAME, encode(data, key), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: CAPTCHA_WINDOW_SECONDS,
    path: "/",
  });
}

export async function clearCaptchaPass(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}
