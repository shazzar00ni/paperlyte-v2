import type { Handler, HandlerEvent } from "@netlify/functions";
import { z } from "zod";

// Rate limiting store (in-memory, resets on cold start)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit: 3 requests per minute per IP
const RATE_LIMIT_REQUESTS = 3;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_STORE_SIZE = 1000; // Prevent unbounded growth

interface SubscribeRequest {
  email: string;
}

// Zod schema for runtime validation of only the fields actually used
const ConvertKitResponseSchema = z.object({
  subscription: z.object({
    id: z.number(),
  }),
});

// TypeScript type derived from Zod schema (ensures type/schema consistency)
export type ConvertKitResponse = z.infer<typeof ConvertKitResponseSchema>;

/**
 * Enforces the per-IP rate limit and updates the in-memory store for the given client IP.
 *
 * May evict expired entries or the oldest entry when the store is at capacity to make room for new IPs.
 *
 * @param ip - Client IP address used as the rate-limiting key
 * @returns `true` if the IP is under the limit and the request is allowed, `false` if the rate limit has been exceeded
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Remove expired entry on access
  const record = rateLimitStore.get(ip);
  if (record && now > record.resetTime) {
    rateLimitStore.delete(ip);
  }
  const freshRecord = rateLimitStore.get(ip);
  const willAddNewEntry = !freshRecord;

  // Size-based: enforce maximum store size before potentially adding new entry
  if (willAddNewEntry && rateLimitStore.size >= MAX_STORE_SIZE) {
    // Remove expired entries first (handled by periodic cleanup, but do again for safety)
    for (const [key, rec] of rateLimitStore.entries()) {
      if (now > rec.resetTime) {
        rateLimitStore.delete(key);
      }
    }
    // If still at capacity after cleanup, remove oldest entry (FIFO eviction)
    if (rateLimitStore.size >= MAX_STORE_SIZE) {
      const firstKey = rateLimitStore.keys().next().value;
      if (firstKey !== undefined) {
        rateLimitStore.delete(firstKey);
      }
    }
  }

  if (!freshRecord) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (freshRecord.count >= RATE_LIMIT_REQUESTS) {
    return false;
  }

  freshRecord.count++;
  return true;
}

/**
 * Subscribe an email address to a configured ConvertKit form.
 *
 * @param email - The subscriber's email address
 * @returns The validated ConvertKit response containing the `subscription` object with its `id`
 * @throws If ConvertKit API credentials (API key or form ID) are not configured
 * @throws If the ConvertKit API request fails (non-OK HTTP response)
 * @throws If the ConvertKit response is not valid JSON or does not match the expected schema
 */
async function subscribeToConvertKit(
  email: string
): Promise<ConvertKitResponse> {
  const apiKey = process.env.CONVERTKIT_API_KEY;
  const formId = process.env.CONVERTKIT_FORM_ID;

  if (!apiKey || !formId) {
    throw new Error("ConvertKit API credentials not configured");
  }

  const tagId = process.env.CONVERTKIT_TAG_ID;
  const requestBody: {
    api_key: string;
    email: string;
    tags?: string[];
  } = {
    api_key: apiKey,
    email: email,
  };

  // Only include tags if tag ID is configured
  if (tagId) {
    requestBody.tags = [tagId];
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  const response = await fetch(
    `https://api.convertkit.com/v3/forms/${formId}/subscribe`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    }
  ).finally(() => clearTimeout(timeoutId));

  if (!response.ok) {
    // Log error without PII (don't log full error response which may contain email)
    console.error("ConvertKit API error: HTTP", response.status);
    throw new Error("Failed to subscribe email");
  }

  // Parse and validate response structure with Zod
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    console.error("Failed to parse ConvertKit response as JSON");
    throw new Error("Invalid response from email service");
  }

  // Validate response structure using Zod schema
  try {
    return ConvertKitResponseSchema.parse(data);
  } catch (error) {
    console.error(
      "ConvertKit response validation failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw new Error("Invalid response from email service");
  }
}

/**
 * Netlify serverless function handler
 */
export const handler: Handler = async (event: HandlerEvent) => {
  // CORS headers - restrict to allowed origin for security
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "https://paperlyte.com";
  const origin = event.headers.origin || event.headers.Origin || "";
  const isAllowedOrigin = origin === allowedOrigin;

  const headers = {
    ...(isAllowedOrigin && { "Access-Control-Allow-Origin": allowedOrigin }),
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: "",
    };
  }

  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Get IP address for rate limiting
    const ip =
      event.headers["x-forwarded-for"]?.split(",")[0] ||
      event.headers["client-ip"] ||
      "unknown";

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({
          error: "Too many requests. Please try again in a minute.",
        }),
      };
    }

    // Parse request body
    let body: SubscribeRequest;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid request body" }),
      };
    }
    const { email } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Email is required" }),
      };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid email address" }),
      };
    }

    // Subscribe to ConvertKit
    const result = await subscribeToConvertKit(email);

    // Log success without PII (privacy-compliant)
    console.log("Successfully subscribed user to newsletter");

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Successfully subscribed! Please check your email to confirm.",
        subscriptionId: result.subscription.id,
      }),
    };
  } catch (error) {
    // Log error type without PII (don't log error object which may contain email)
    console.error(
      "Subscription error:",
      error instanceof Error ? error.message : "Unknown error"
    );

    // Don't expose internal errors to client
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to process subscription. Please try again later.",
      }),
    };
  }
};