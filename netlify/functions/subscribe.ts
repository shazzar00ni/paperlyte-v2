import type { Handler, HandlerEvent } from "@netlify/functions";

// Rate limiting store (in-memory, resets on cold start)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
let requestCounter = 0;

// Rate limit: 3 requests per minute per IP
const RATE_LIMIT_REQUESTS = 3;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const CLEANUP_INTERVAL = 50; // Clean up every 50 requests
const MAX_STORE_SIZE = 1000; // Prevent unbounded growth

interface SubscribeRequest {
  email: string;
}

interface ConvertKitResponse {
  subscription: {
    id: number;
    state: string;
    created_at: string;
    subscriber: {
      id: number;
    };
  };
}

/**
 * Clean up expired rate limit entries to prevent memory leak
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}

/**
 * Check rate limit for IP address
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Deterministic cleanup every N requests to prevent memory leak
  requestCounter++;
  if (requestCounter % CLEANUP_INTERVAL === 0) {
    cleanupExpiredEntries();
  }

  // Enforce maximum store size as additional safeguard
  if (rateLimitStore.size >= MAX_STORE_SIZE) {
    cleanupExpiredEntries();
  }

  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    // New window - remove old entry if it exists
    if (record) {
      rateLimitStore.delete(ip);
    }
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (record.count >= RATE_LIMIT_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Subscribe email to ConvertKit
 */
async function subscribeToConvertKit(email: string): Promise<ConvertKitResponse> {
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

  const response = await fetch(
    `https://api.convertkit.com/v3/forms/${formId}/subscribe`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    // Log error without PII (don't log full error response which may contain email)
    console.error("ConvertKit API error: HTTP", response.status);
    throw new Error("Failed to subscribe email");
  }

  // Parse and validate response structure
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    console.error("Failed to parse ConvertKit response as JSON");
    throw new Error("Invalid response from email service");
  }

  // Validate response structure
  if (
    !data ||
    typeof data !== "object" ||
    !("subscription" in data) ||
    typeof data.subscription !== "object" ||
    data.subscription === null ||
    !("id" in data.subscription) ||
    typeof data.subscription.id !== "number"
  ) {
    console.error("ConvertKit response missing required fields");
    throw new Error("Invalid response from email service");
  }

  return data as ConvertKitResponse;
}

/**
 * Netlify serverless function handler
 */
export const handler: Handler = async (event: HandlerEvent) => {
  // CORS headers - restrict to allowed origin for security
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "https://paperlyte.com";
  const origin = event.headers.origin || event.headers.Origin || "";
  const corsOrigin = origin === allowedOrigin ? allowedOrigin : "null";

  const headers = {
    "Access-Control-Allow-Origin": corsOrigin,
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

    // Defensive check for response structure
    if (!result?.subscription?.id) {
      console.error("Invalid ConvertKit response structure");
      throw new Error("Invalid response from email service");
    }

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
    console.error("Subscription error:", error instanceof Error ? error.message : "Unknown error");

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
