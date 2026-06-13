# Sentinel's Journal

## 2026-06-13 - Internal ID Leaked in Subscribe API Response
**Vulnerability:** `netlify/functions/subscribe.ts` returned `subscriptionId: result.subscription.id` in the 200 success response body, exposing the internal ConvertKit subscription database ID to every client that subscribes.
**Learning:** The ConvertKit Zod schema (`ConvertKitResponseSchema`) was validated and the ID extracted — but the ID was propagated all the way into the client-facing response body without serving any client-side purpose. Classic principle-of-minimization failure where a field is included "because it's available" rather than "because it's needed."
**Prevention:** Audit every serverless function response body: any field sourced from a third-party API response should be explicitly justified. If the client doesn't need it, drop it. ConvertKit subscription IDs are sequential integers; leaking them also leaks subscription volume estimates.
