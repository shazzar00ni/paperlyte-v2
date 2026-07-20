import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { HandlerEvent } from "@netlify/functions";

const upsertMock = vi.fn();
const fromMock = vi.fn(() => ({ upsert: upsertMock }));
const getSupabaseClientMock = vi.fn();

vi.mock("../utils/supabaseClient", () => ({
  getSupabaseClient: () => getSupabaseClientMock(),
}));

function buildEvent(body: unknown): HandlerEvent {
  return {
    httpMethod: "POST",
    headers: { origin: "https://paperlyte.com" },
    body: JSON.stringify(body),
    multiValueHeaders: {},
    isBase64Encoded: false,
    path: "/.netlify/functions/subscribe",
    httpMethodOriginalCase: "POST",
    rawUrl: "",
    rawQuery: "",
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
  } as unknown as HandlerEvent;
}

describe("subscribe handler", () => {
  const originalFetch = global.fetch;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    upsertMock.mockReset().mockResolvedValue({ error: null });
    fromMock.mockClear();
    getSupabaseClientMock.mockReset().mockReturnValue(null);
    process.env.ALLOWED_ORIGIN = "https://paperlyte.com";
    process.env.CONVERTKIT_API_KEY = "test-api-key";
    process.env.CONVERTKIT_FORM_ID = "12345";
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = { ...originalEnv };
  });

  async function mockConvertKitSuccess(): Promise<void> {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ subscription: { id: 1 } }),
    }) as unknown as typeof fetch;
  }

  it("rejects a request with no name", async () => {
    const { handler } = await import("../subscribe");
    const response = await handler(
      buildEvent({ email: "test@example.com" }),
      {} as never,
      undefined as never
    );
    expect(response?.statusCode).toBe(400);
    expect(JSON.parse(response?.body as string)).toEqual({ error: "Name is required" });
  });

  it("rejects a request with a too-short name", async () => {
    const { handler } = await import("../subscribe");
    const response = await handler(
      buildEvent({ name: "A", email: "test@example.com" }),
      {} as never,
      undefined as never
    );
    expect(response?.statusCode).toBe(400);
    expect(JSON.parse(response?.body as string).error).toMatch(/at least 2 characters/i);
  });

  it("rejects a request with an invalid email", async () => {
    const { handler } = await import("../subscribe");
    const response = await handler(
      buildEvent({ name: "Ada Lovelace", email: "not-an-email" }),
      {} as never,
      undefined as never
    );
    expect(response?.statusCode).toBe(400);
  });

  it("subscribes via ConvertKit and skips Supabase when it isn't configured", async () => {
    await mockConvertKitSuccess();
    getSupabaseClientMock.mockReturnValue(null);

    const { handler } = await import("../subscribe");
    const response = await handler(
      buildEvent({ name: "Ada Lovelace", email: "test@example.com" }),
      {} as never,
      undefined as never
    );

    expect(response?.statusCode).toBe(200);
    expect(JSON.parse(response?.body as string).success).toBe(true);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("persists the signup to Supabase when configured", async () => {
    await mockConvertKitSuccess();
    getSupabaseClientMock.mockReturnValue({ from: fromMock });

    const { handler } = await import("../subscribe");
    const response = await handler(
      buildEvent({ name: "  Ada Lovelace  ", email: "  Test@Example.com " }),
      {} as never,
      undefined as never
    );

    expect(response?.statusCode).toBe(200);
    expect(fromMock).toHaveBeenCalledWith("waitlist_signups");
    expect(upsertMock).toHaveBeenCalledWith(
      { name: "Ada Lovelace", email: "test@example.com" },
      { onConflict: "email", ignoreDuplicates: true }
    );
  });

  it("still returns success when the Supabase write fails", async () => {
    await mockConvertKitSuccess();
    upsertMock.mockResolvedValue({ error: { message: "boom" } });
    getSupabaseClientMock.mockReturnValue({ from: fromMock });

    const { handler } = await import("../subscribe");
    const response = await handler(
      buildEvent({ name: "Ada Lovelace", email: "test@example.com" }),
      {} as never,
      undefined as never
    );

    expect(response?.statusCode).toBe(200);
  });

  it("returns 500 when ConvertKit fails, without attempting the Supabase write", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;
    getSupabaseClientMock.mockReturnValue({ from: fromMock });

    const { handler } = await import("../subscribe");
    const response = await handler(
      buildEvent({ name: "Ada Lovelace", email: "test@example.com" }),
      {} as never,
      undefined as never
    );

    expect(response?.statusCode).toBe(500);
    expect(fromMock).not.toHaveBeenCalled();
  });
});
