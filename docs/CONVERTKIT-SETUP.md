# ConvertKit API Integration Setup Guide

This guide will help you set up ConvertKit integration for email capture on your Paperlyte landing page.

## Prerequisites

- ConvertKit account ([Sign up here](https://convertkit.com))
- Netlify account for deploying serverless functions
- Basic familiarity with environment variables

---

## Step 1: Create a ConvertKit Form

1. Log in to your ConvertKit account
2. Navigate to **Forms** in the left sidebar
3. Click **Create New Form**
4. Choose **Inline** form type
5. Give it a name (e.g., "Paperlyte Waitlist")
6. Click **Create**
7. **Note the Form ID** from the URL (e.g., `https://app.convertkit.com/forms/123456` → Form ID is `123456`)

---

## Step 2: Get Your API Key

1. In ConvertKit, click your profile icon (top right)
2. Go to **Settings** → **Advanced**
3. Scroll to **API Secret** section
4. Copy your **API Secret** (this is your API key)
5. **Keep this secure!** Never commit it to your repository

---

## Step 3: Create a Tag (Optional but Recommended)

1. Navigate to **Subscribers** → **Tags**
2. Click **Create Tag**
3. Name it "Paperlyte Waitlist" or similar
4. **Note the Tag ID** from the URL after creation

---

## Step 4: Configure Environment Variables

### For Local Development

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Fill in your ConvertKit credentials:

   ```bash
   CONVERTKIT_API_KEY=your_actual_api_key_here
   CONVERTKIT_FORM_ID=123456
   CONVERTKIT_TAG_ID=789012  # Optional
   ```

3. **Never commit `.env` to Git!** It's already in `.gitignore`

### For Netlify Production

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site Settings** → **Environment Variables**
4. Add the following variables:
   - `CONVERTKIT_API_KEY` → Your API Secret
   - `CONVERTKIT_FORM_ID` → Your Form ID
   - `CONVERTKIT_TAG_ID` → Your Tag ID (optional)

5. Click **Save**
6. Redeploy your site for changes to take effect

---

## Step 5: Test the Integration

### Local Testing with Netlify CLI

1. Install Netlify CLI globally:

   ```bash
   npm install -g netlify-cli
   ```

2. Start the dev server with functions:

   ```bash
   netlify dev
   ```

3. Open [http://localhost:8888](http://localhost:8888) (Netlify Dev uses port 8888 by default)
   - If port 8888 is unavailable, Netlify Dev will automatically select the next available port and print the served URL in the console output. Check your terminal for the correct local URL to open in your browser.

4. Try submitting your email in the form

5. Check your ConvertKit dashboard to verify the subscriber was added

**Port Conflicts:**
If port 8888 is already in use, you have several options:

1. **Use a different port:**

   ```bash
   netlify dev --port 3000
   ```

2. **Find and kill the process using port 8888:**

   ```bash
   # macOS/Linux
   lsof -ti:8888 | xargs kill -9

   # Windows (PowerShell)
   Get-Process -Id (Get-NetTCPConnection -LocalPort 8888).OwningProcess | Stop-Process -Force
   ```

3. **Let Netlify CLI auto-assign a port:**
   - Netlify Dev will automatically try the next available port if 8888 is taken
   - Check the terminal output for the actual port being used

### Testing Rate Limiting

The API enforces rate limiting: **3 requests per minute per IP address**

**How Rate Limiting Works:**

- Uses a **fixed 1-minute window** (not sliding)
- Each IP address gets 3 requests per window
- Window starts on your first request
- After 60 seconds, the window resets and you get 3 new requests

**To Test:**

1. Submit 3 requests quickly - all should succeed
2. Submit a 4th request - should fail with:
   ```
   "Too many requests. Please try again in a minute."
   ```
3. Wait 60 seconds from your first request
4. Submit again - should succeed (new window)

**Resetting Rate Limit During Development:**

- Rate limits are stored in-memory (serverless function)
- Simply restart `netlify dev` to clear all rate limits
- Or wait 60 seconds for the window to reset naturally

---

## Step 6: Verify Email Flow

1. Submit a test email
2. Check your inbox for ConvertKit's confirmation email
3. Click the confirmation link
4. Verify the subscriber appears in your ConvertKit dashboard
5. Confirm they have the correct tag (if using tags)

---

## API Endpoint Details

### Endpoint

```
POST /.netlify/functions/subscribe
```

### Request Body

```json
{
  "email": "user@example.com"
}
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Successfully subscribed! Please check your email to confirm.",
  "subscriptionId": 12345
}
```

### Error Responses

**400 - Invalid Email**

```json
{
  "error": "Invalid email address"
}
```

**429 - Rate Limited**

```json
{
  "error": "Too many requests. Please try again in a minute."
}
```

**500 - Server Error**

```json
{
  "error": "Failed to process subscription. Please try again later."
}
```

---

## Security Features

### CORS (Cross-Origin Resource Sharing)

- **Default Whitelisted Domains:**
  - Development: `http://localhost:8888` (Netlify Dev), or your Vite dev server (e.g., `http://localhost:5173`)
  - Staging: `https://staging.paperlyte.com` (or your staging domain)
  - Production: `https://paperlyte.com` (your live domain)

- **How to Configure CORS per Environment:**
  - **Development:** Set `ALLOWED_ORIGIN=http://localhost:8888` (or your dev port) in your `.env` or Netlify environment variables.
  - **Staging:** Set `ALLOWED_ORIGIN=https://staging.paperlyte.com` in your Netlify environment variables.
  - **Production:** Set `ALLOWED_ORIGIN=https://paperlyte.com` in your Netlify environment variables.

- **Where CORS Is Configured:**
  - CORS is enforced in the serverless function at [`netlify/functions/subscribe.ts`](../../netlify/functions/subscribe.ts) using the `ALLOWED_ORIGIN` environment variable. See the code for details on how allowed origins are checked and headers are set.

✅ **Rate Limiting**: 3 requests per minute per IP
✅ **Honeypot Field**: Catches spam bots
✅ **Email Validation**: Client-side and server-side
✅ **CORS Protection**: Configured via `ALLOWED_ORIGIN` environment variable (see [CORS Configuration](#cors-errors) below)
✅ **Error Masking**: Internal errors not exposed to users

### CORS Configuration Details

The serverless function implements Cross-Origin Resource Sharing (CORS) to prevent unauthorized domains from submitting requests.

**Default Configuration:**

- **Allowed Origin**: `https://paperlyte.com` (production domain)
- **Allowed Methods**: `POST, OPTIONS`
- **Allowed Headers**: `Content-Type`

**Environment Variables:**

- `ALLOWED_ORIGIN` - Set to your production domain (e.g., `https://yourdomain.com`)
  - **Development**: Use `http://localhost:5173` for Vite dev server
  - **Netlify Dev**: Use `http://localhost:8888`
  - **Production**: Use your full domain with HTTPS (e.g., `https://paperlyte.com`)
  - **Multiple Origins**: Not supported by default (security best practice)

**Setting in Netlify:**

1. Go to Site settings → Environment variables
2. Add `ALLOWED_ORIGIN` with your domain value
3. For local development, add to `.env`:
   ```
   ALLOWED_ORIGIN=http://localhost:5173
   ```

**Important Notes:**

- Always use HTTPS in production (HTTP will be blocked by browsers)
- Do not use wildcards (`*`) for `ALLOWED_ORIGIN` in production (security risk)
- The function will return a 403 Forbidden if origin doesn't match
- Browser will show CORS error in console if origin is misconfigured

---

## Troubleshooting

### "ConvertKit API credentials not configured"

- Check that environment variables are set correctly
- In Netlify, verify variables are saved and site is redeployed
- Make sure variable names match exactly (case-sensitive)

### Subscribers not appearing in ConvertKit

- Check the Form ID is correct
- Verify the API key has proper permissions
- Look at Netlify Function logs for errors
- Check ConvertKit's Activity feed for failed subscriptions

### CORS Errors

**How CORS is Configured:**

The subscribe function restricts requests to a specific origin for security. By default, it only accepts requests from `https://paperlyte.com`.

**Environment Variable:**

- `ALLOWED_ORIGIN` - Set this to your domain (default: `https://paperlyte.com`)

**Configuration Examples:**

1. **Production (Netlify):**

   ```bash
   ALLOWED_ORIGIN=https://yourdomain.com
   ```

2. **Staging/Preview:**

   ```bash
   ALLOWED_ORIGIN=https://preview.yourdomain.com
   ```

3. **Development (using Netlify Dev):**
   - No configuration needed
   - `netlify dev` proxies requests correctly
   - **Important:** Use `netlify dev`, NOT `npm run dev`

**Troubleshooting CORS Issues:**

- **Error:** "CORS policy: No 'Access-Control-Allow-Origin' header"
  - **Cause:** Request coming from unauthorized origin
  - **Fix:** Add your domain to `ALLOWED_ORIGIN` environment variable

- **Multiple Domains:**
  - The function currently supports one origin
  - To support multiple domains, modify `netlify/functions/subscribe.ts` to check against an array of allowed origins

- **Development Issues:**
  - Always use `netlify dev` for local testing
  - Direct Vite dev server (`npm run dev`) won't work with serverless functions

### Rate Limiting Too Strict

To adjust rate limits, edit `netlify/functions/subscribe.ts`:

```typescript
const RATE_LIMIT_REQUESTS = 5; // Increase from 3
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
```

---

## Production Checklist

Before going live, verify:

- [ ] ConvertKit form is published and active
- [ ] Environment variables set in Netlify
- [ ] Test submission works on production URL
- [ ] Confirmation emails are being sent
- [ ] Subscribers appear in correct ConvertKit list
- [ ] Tags are being applied correctly
- [ ] Rate limiting is working
- [ ] Error messages are user-friendly
- [ ] Success message appears correctly
- [ ] Analytics tracking (if configured) is working

---

## Monitoring

### ConvertKit Dashboard

Monitor your subscribers in real-time:

- Total subscribers
- Growth rate
- Confirmation rate
- Tag distribution

### Netlify Function Logs

View function logs in Netlify:

1. Go to **Functions** tab in Netlify dashboard
2. Click on `subscribe` function
3. View logs for each invocation
4. Check for errors or unusual patterns

---

## Next Steps

- Set up automated welcome email sequence in ConvertKit
- Create lead magnet or incentive for signups
- A/B test different CTA copy
- Add conversion tracking in Google Analytics
- Set up email nurture campaign

---

## Support

- **ConvertKit Support**: [https://help.convertkit.com/](https://help.convertkit.com/)
- **Netlify Functions Docs**: [https://docs.netlify.com/functions/overview/](https://docs.netlify.com/functions/overview/)
- **Project Issues**: Check your repository's issue tracker for project-specific support
- **Project Issues**: Check your repository's issue tracker for project-specific support

---

**Last Updated**: November 28, 2025
