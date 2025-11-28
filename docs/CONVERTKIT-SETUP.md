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

3. Open http://localhost:8888 (Netlify Dev uses port 8888 by default)

4. Try submitting your email in the form

5. Check your ConvertKit dashboard to verify the subscriber was added

### Testing Rate Limiting

The API enforces rate limiting: **3 requests per minute per IP address**

Try submitting 4 times quickly - the 4th should fail with:
```
"Too many requests. Please try again in a minute."
```

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

✅ **Rate Limiting**: 3 requests per minute per IP
✅ **Honeypot Field**: Catches spam bots
✅ **Email Validation**: Client-side and server-side
✅ **CORS Protection**: Configured for your domain
✅ **Error Masking**: Internal errors not exposed to users

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

- The serverless function includes CORS headers
- If using a custom domain, no changes needed
- For localhost testing, use `netlify dev` instead of `npm run dev`

### Rate Limiting Too Strict

To adjust rate limits, edit `netlify/functions/subscribe.ts`:
```typescript
const RATE_LIMIT_REQUESTS = 5;  // Increase from 3
const RATE_LIMIT_WINDOW = 60 * 1000;  // 1 minute
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

- **ConvertKit Support**: https://help.convertkit.com/
- **Netlify Functions Docs**: https://docs.netlify.com/functions/overview/
- **Project Issues**: [Create an issue on GitHub](https://github.com/shazzar00ni/paperlyte-v2/issues)

---

**Last Updated**: November 28, 2025
