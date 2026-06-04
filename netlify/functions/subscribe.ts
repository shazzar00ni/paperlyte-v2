import type { Handler, HandlerEvent, HandlerResponse } from "@netlify/functions";
import { z } from "zod";
import { validateEmail } from "../../src/utils/validation";

// In-memory rate limit store (resets on cold start)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_REQUESTS = 3;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_STORE_SIZE = 1000;

interface SubscribeRequest {
  email?: unknown;
}

const ConvertKitResponseSchema = z.object({
  subscription: z.object({
    id: z.number(),
  }),
});

export type ConvertKitResponse = z.infer<typeof ConvertKitResponseSchema>;

// --- Rate limiting ---

/**
 * Removes expired entries from the rate limit store, then evicts the oldest
 * entry via FIFO if the store is still at or above MAX_STORE_SIZE.
 * @param now - Current timestamp in milliseconds
 */
function evictForCapacity(now: number): void {
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

/**
 * Enforces the per-IP rate limit and updates the in-memory store.
 * Evicts expired or oldest entries when the store is at capacity.
 * @param ip - Client IP address used as the rate-limiting key
 * @returns `true` if the request is within the limit, `false` if exceeded
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  const record = rateLimitStore.get(ip);
  if (record && now > record.resetTime) {
    rateLimitStore.delete(ip);
  }

  const freshRecord = rateLimitStore.get(ip);
  if (!freshRecord) {
    if (rateLimitStore.size >= MAX_STORE_SIZE) {
      evictForCapacity(now);
    }
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (freshRecord.count >= RATE_LIMIT_REQUESTS) {
    return false;
  }

  freshRecord.count++;
  return true;
}

// --- ConvertKit ---

type ConvertKitBody = { api_key: string; email: string; tags?: string[] };

/**
 * Builds the JSON body for the ConvertKit subscribe API request.
 * Appends CONVERTKIT_TAG_ID to the tags array when configured.
 * @param apiKey - ConvertKit API key
 * @param email - Subscriber's email address
 */
function buildConvertKitBody(apiKey: string, email: string): ConvertKitBody {
  const body: ConvertKitBody = { api_key: apiKey, email };
  const tagId = process.env.CONVERTKIT_TAG_ID;
  if (tagId) {
    body.tags = [tagId];
  }
  return body;
}

/**
 * Parses and validates the ConvertKit API response against the expected schema.
 * @param response - The raw fetch Response from the ConvertKit API
 * @returns The validated ConvertKit response object
 * @throws If the response body is not valid JSON or does not match the schema
 */
async function parseConvertKitResponse(
  response: Response
): Promise<ConvertKitResponse> {
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    console.error("Failed to parse ConvertKit response as JSON");
    throw new Error("Invalid response from email service");
  }

  try {
    return ConvertKitResponseSchema.parse(data);
  } catch (error) {
    console.error(
      "ConvertKit response validation failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw new Error("Invalid response from email service", { cause: error });
  }
}

/**
 * Subscribes an email address to the configured ConvertKit form.
 * Uses a 10-second abort timeout to guard against hung requests.
 * @param email - The subscriber's email address
 * @returns The validated ConvertKit response containing the subscription ID
 * @throws If API credentials are missing, the request fails, or the response is invalid
 */
async function subscribeToConvertKit(
  email: string
): Promise<ConvertKitResponse> {
  const apiKey = process.env.CONVERTKIT_API_KEY;
  const formId = process.env.CONVERTKIT_FORM_ID;

  if (!apiKey || !formId) {
    throw new Error("ConvertKit API credentials not configured");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(
      `https://api.convertkit.com/v3/forms/${formId}/subscribe`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildConvertKitBody(apiKey, email)),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      console.error("ConvertKit API error: HTTP", response.status);
      throw new Error("Failed to subscribe email");
    }

    return parseConvertKitResponse(response);
  } finally {
    clearTimeout(timeoutId);
  }
}

// --- Handler helpers ---

/**
 * Extracts the Origin header value from request headers, case-insensitively.
 * Returns an empty string if neither `origin` nor `Origin` is present.
 * @param headers - The incoming request headers
 */
function getOriginHeader(headers: HandlerEvent["headers"]): string {
  return headers["origin"] || headers["Origin"] || "";
}

/**
 * Builds CORS response headers, conditionally setting Access-Control-Allow-Origin
 * only when the request origin matches ALLOWED_ORIGIN.
 * @param origin - The Origin header value from the incoming request
 */
function getCorsHeaders(origin: string): Record<string, string> {
  const allowedOrigin = process.env.ALLOWED_ORIGIN ?? "https://paperlyte.com";
  return {
    ...(origin === allowedOrigin && {
      "Access-Control-Allow-Origin": allowedOrigin,
    }),
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
    Vary: "Origin",
  };
}

/**
 * Extracts the client IP address from request headers.
 * Prefers the first value in x-forwarded-for, falls back to client-ip, then "unknown".
 * @param headers - The incoming request headers
 */
function getClientIp(headers: HandlerEvent["headers"]): string {
  return (
    headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    headers["client-ip"]?.trim() ||
    "unknown"
  );
}

/**
 * Parses the raw request body string as JSON.
 * @param raw - The raw request body, or null if absent
 * @returns The parsed SubscribeRequest, or null if the body is invalid JSON
 */
function parseRequestBody(raw: string | null): SubscribeRequest | null {
  try {
    const parsed: unknown = JSON.parse(raw ?? "{}");
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return null;
    }
    return parsed as SubscribeRequest;
  } catch {
    return null;
  }
}

/**
 * Validates and normalises an email field from the request body.
 * @param email - The raw email value (may be any type)
 * @returns An object with `normalizedEmail` on success, or `error` on failure
 */
function validateEmailInput(
  email: unknown
): { error: string } | { normalizedEmail: string } {
  if (!email || typeof email !== "string") {
    return { error: "Email is required" };
  }
  const normalizedEmail = email.trim().toLowerCase();
  const validation = validateEmail(normalizedEmail); // NOSONAR - EMAIL_REGEX (validation.ts) has disjoint alternation branches; no ReDoS risk
  if (!validation.isValid) {
    return { error: validation.error ?? "Invalid email address" };
  }
  return { normalizedEmail };
}

// --- Handler ---

/**
 * Processes a validated POST subscription request: enforces rate-limiting,
 * parses the body, validates the email, and calls ConvertKit.
 * @param event - The incoming Netlify handler event
 * @param headers - Pre-built CORS response headers to include in all responses
 */
async function processSubscription(
  event: HandlerEvent,
  headers: Record<string, string>
): Promise<HandlerResponse> {
  const ip = getClientIp(event.headers);
  if (!checkRateLimit(ip)) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({
        error: "Too many requests. Please try again in a minute.",
      }),
    };
  }

  const body = parseRequestBody(event.body);
  if (!body) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid request body" }),
    };
  }

  const emailResult = validateEmailInput(body.email);
  if ("error" in emailResult) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: emailResult.error }),
    };
  }

  const result = await subscribeToConvertKit(emailResult.normalizedEmail);
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
}

/** Netlify serverless function handler for newsletter subscription requests. */
export const handler: Handler = async (event: HandlerEvent) => {
  const origin = getOriginHeader(event.headers);
  const headers = getCorsHeaders(origin);

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    return await processSubscription(event, headers);
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
