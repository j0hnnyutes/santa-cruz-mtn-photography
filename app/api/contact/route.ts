import { NextRequest, NextResponse } from "next/server";
import { sendContactNotification } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE_LENGTH = 4000;

const SUBJECT_OPTIONS = new Set([
  "General question",
  "Print inquiry",
  "Booking — event or drone work",
  "Press / collaboration",
]);

// In-memory per-IP rate limit — resets on deploy/cold start, which is fine
// for a low-traffic contact form. Same lightweight approach as the admin
// login limiter in the tree-site project, just scoped to this one route.
const submissions = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (submissions.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  submissions.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX;
}

// Same fail-open approach as the tree-site project's lead form: a missing
// or failed Turnstile check is logged, not blocked. A real inquiry should
// never get lost because a CAPTCHA widget hiccuped or a visitor's browser
// blocked the script — the honeypot + rate limit above still apply either
// way, so this is a second layer, not the only one.
async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("TURNSTILE_SECRET_KEY not set — skipping verification");
    return true;
  }

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
    });
    const data = await res.json();
    if (!data.success) {
      console.warn("Turnstile verification returned success=false", data["error-codes"]);
    }
    return Boolean(data.success);
  } catch (err) {
    console.error("Turnstile verification threw:", err);
    return true; // fail open — don't drop a real inquiry over a network blip
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot — a field real visitors never see or fill in. Any value here
  // means a bot filled out every field it could find; pretend success so
  // it doesn't learn to look for a different tell.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
  if (turnstileToken) {
    const turnstileValid = await verifyTurnstile(turnstileToken);
    if (!turnstileValid) {
      console.warn("Turnstile verification failed — processing submission anyway.");
    }
  } else {
    console.warn("No Turnstile token provided — processing submission without CAPTCHA.");
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || name.length > 200) {
    return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!SUBJECT_OPTIONS.has(subject)) {
    return NextResponse.json({ error: "Choose what this is about." }, { status: 400 });
  }
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: message ? "Message is too long." : "Enter a message." },
      { status: 400 }
    );
  }

  const delivered = await sendContactNotification({ name, email, subject, message });

  if (!delivered) {
    // Email failed to send (or isn't configured yet) — still tell the
    // visitor their message went through only if it actually did. Better
    // to surface the failure than silently drop a real inquiry.
    return NextResponse.json(
      { error: "Something went wrong sending your message. Please email law138@santacruzmtnphotography.com directly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
