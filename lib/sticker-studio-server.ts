
import "server-only";

import { createClient } from "@supabase/supabase-js";
import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "syp_sticker_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing server environment variable: ${name}`);
  }

  return value;
}

export function getAdminSupabase() {
  return createClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

function sign(value: string) {
  return createHmac(
    "sha256",
    requiredEnv("STICKER_STUDIO_SESSION_SECRET")
  )
    .update(value)
    .digest("hex");
}

export function verifyPassword(password: string) {
  const expected = requiredEnv("STICKER_STUDIO_ACCESS_PASSWORD");

  const a = Buffer.from(password);
  const b = Buffer.from(expected);

  return a.length === b.length && timingSafeEqual(a, b);
}

export function createSessionToken() {
  const expiresAt = Math.floor(Date.now() / 1000) +
    SESSION_TTL_SECONDS;

  const payload = String(expiresAt);

  return `${payload}.${sign(payload)}`;
}

export async function setStickerSession() {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearStickerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function hasStickerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  if (!/^\d+$/.test(payload)) return false;

  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);

  if (
    expected.length !== actual.length ||
    !timingSafeEqual(expected, actual)
  ) {
    return false;
  }

  return Number(payload) > Math.floor(Date.now() / 1000);
}
