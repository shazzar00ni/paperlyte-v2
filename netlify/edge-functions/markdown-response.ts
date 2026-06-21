import type { Config, Context } from "https://edge.netlify.com";

/**
 * Parses an Accept header and returns true if `text/markdown` is an accepted
 * media type (including wildcard `text/*` and `*\/*` forms).
 *
 * Handles quality values (q=0.9) and multiple comma-separated entries.
 */
function acceptsMarkdown(acceptHeader: string): boolean {
  // Split on comma and evaluate each media-range + quality pair.
  const types = acceptHeader.split(",").map((t) => t.trim().toLowerCase());
  for (const entry of types) {
    // Strip quality value and parameters (e.g. "; q=0.9")
    const mediaType = entry.split(";")[0].trim();
    if (
      mediaType === "text/markdown" ||
      mediaType === "text/*" ||
      mediaType === "*/*"
    ) {
      return true;
    }
  }
  return false;
}

export default async function markdownResponse(
  request: Request,
  context: Context,
): Promise<Response> {
  const accept = request.headers.get("accept") ?? "";

  if (!acceptsMarkdown(accept)) {
    return context.next();
  }

  try {
    // Use Netlify's URL env var (server-controlled deploy URL) as the fetch
    // base so the origin is never derived from the user-supplied request.url.
    // Falls back to the request origin only when the env var is absent (local dev).
    const deployUrl =
      // deno-lint-ignore no-explicit-any
      (globalThis as any).Deno?.env?.get("URL") ?? new URL(request.url).origin;
    const mdResponse = await fetch(`${deployUrl}/index.md`);

    if (!mdResponse.ok) {
      console.warn(
        `[markdown-response] Failed to fetch /index.md: ${mdResponse.status}`,
      );
      return context.next();
    }

    const body = await mdResponse.text();

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    console.warn("[markdown-response] Unexpected error fetching /index.md:", err);
    return context.next();
  }
}

export const config: Config = {
  path: "/",
};
