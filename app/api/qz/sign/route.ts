import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin) {
      const host = new URL(origin).hostname;
      const allowed =
        host === "syponcafe.shop" ||
        host === "www.syponcafe.shop" ||
        host.endsWith(".syponcafe.shop") ||
        host.endsWith(".pages.dev") ||
        host.endsWith(".workers.dev");
      if (!allowed) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    const body = (await request.json()) as { request?: unknown };
    if (typeof body.request !== "string" || body.request.length === 0 || body.request.length > 100_000) {
      return new NextResponse("Invalid signing request", { status: 400 });
    }

    const privateKeyPem = process.env.QZ_PRIVATE_KEY;
    if (!privateKeyPem || !privateKeyPem.includes("BEGIN PRIVATE KEY")) {
      return new NextResponse("QZ signing key is not configured", { status: 503 });
    }

    const key = await crypto.subtle.importKey(
      "pkcs8",
      pemToArrayBuffer(privateKeyPem),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-512" },
      false,
      ["sign"],
    );
    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      key,
      new TextEncoder().encode(body.request),
    );
    let binary = "";
    for (const byte of new Uint8Array(signature)) binary += String.fromCharCode(byte);

    return new NextResponse(btoa(binary), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Unable to sign QZ request. Check that QZ_PRIVATE_KEY is a valid PKCS#8 PEM key.", {
      status: 500,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
