import type { Handler, HandlerEvent } from "@netlify/functions";
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

// Rate limiting store (in-memory, resets on cold start)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit: 3 requests per minute per IP
const RATE_LIMIT_REQUESTS = 3;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_STORE_SIZE = 1000; // Prevent unbounded growth

interface SubscribeRequest {
  email: string;
}

/**
 * Enforces the per-IP rate limit and updates the in-memory store.
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  const record = rateLimitStore.get(ip);
  if (record && now > record.resetTime) {
    rateLimitStore.delete(ip);
  }
  const freshRecord = rateLimitStore.get(ip);
  const willAddNewEntry = !freshRecord;

  if (willAddNewEntry && rateLimitStore.size >= MAX_STORE_SIZE) {
    for (const [key, rec] of rateLimitStore.entries()) {
      if (now > rec.resetTime) {
        rateLimitStore.delete(key);
      }
    }
    if (rateLimitStore.size >= MAX_STORE_SIZE) {
      const firstKey = rateLimitStore.keys().next().value;
      if (firstKey !== undefined) {
        rateLimitStore.delete(firstKey);
      }
    }
  }

  if (!freshRecord) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (freshRecord.count >= RATE_LIMIT_REQUESTS) {
    return false;
  }

  freshRecord.count++;
  return true;
}

/**
 * One-way hash of the client IP for privacy-preserving deduplication.
 * We never store the raw IP address.
 */
function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

/**
 * Inserts the email into the Neon waitlist table.
 * Returns { alreadyExists: true } if the email is already registered.
 */
async function saveToWaitlist(
  email: string,
  ipHash: string
): Promise<{ alreadyExists: boolean }> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not configured");
  }

  const sql = neon(databaseUrl);

  // Upsert — do nothing on conflict so we can detect duplicates
  const rows = await sql`
    INSERT INTO waitlist (email, ip_hash, source)
    VALUES (${email}, ${ipHash}, 'website')
    ON CONFLICT (email) DO NOTHING
    RETURNING id
  `;

  return { alreadyExists: rows.length === 0 };
}

/**
 * Netlify serverless function handler for waitlist sign-ups.
 */
export const handler: Handler = async (event: HandlerEvent) => {
  // CORS headers — restrict to allowed origin
  const allowedOrigin = process.env.ALLOWED_ORIGIN ?? "https://paperlyte.com";
  const origin = event.headers.origin ?? event.headers.Origin ?? "";
  const isAllowedOrigin = origin === allowedOrigin;

  const headers = {
    ...(isAllowedOrigin && { "Access-Control-Allow-Origin": allowedOrigin }),
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  // Only POST allowed
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Rate limiting
    const ip =
      event.headers["x-forwarded-for"]?.split(",")[0]?.trim() ??
      event.headers["client-ip"] ??
      "unknown";

    if (!checkRateLimit(ip)) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({
          error: "Too many requests. Please try again in a minute.",
        }),
      };
    }

    // Parse body
    let body: SubscribeRequest;
    try {
      body = JSON.parse(event.body ?? "{}");
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid request body" }),
      };
    }

    const { email } = body;

    // Validate email presence and type
    if (!email || typeof email !== "string") {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Email is required" }),
      };
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid email address" }),
      };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const ipHash = hashIp(ip);

    const { alreadyExists } = await saveToWaitlist(normalizedEmail, ipHash);

    if (alreadyExists) {
      // Return success so we don't leak which emails are registered
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: "You're already on the waitlist!",
        }),
      };
    }

    console.log("New waitlist signup recorded");

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "You're on the waitlist! We'll be in touch.",
      }),
    };
  } catch (error) {
    console.error(
      "Subscription error:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to process subscription. Please try again later.",
      }),
    };
  }
};
