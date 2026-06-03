# Secure Portal Deployment

This portfolio now includes a premium authentication gate and Vercel serverless API scaffold for:

- Google Identity Services authentication
- Email OTP fallback with 6-character codes
- Redis-backed OTP TTL, cooldown, rate limiting, failed-attempt lockout, and sessions
- Google Sheets visitor logging
- 60-second signed URLs for protected resume and intro video access
- Security headers through `vercel.json`

## Important Hosting Note

GitHub Pages can only host static files. It cannot run Redis, Google OAuth verification, Resend email, Google Sheets API calls, or protected asset routes.

Deploy this version to Vercel for the secure portal features:

```bash
npm run build
```

Set `VITE_BASE_PATH=/` in Vercel so the app is served from the domain root.

## Required Vercel Environment Variables

Copy `.env.example` into Vercel project environment variables and fill in the values:

- `VITE_GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_SHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `RESEND_API_KEY`
- `OTP_FROM_EMAIL`
- `SESSION_SECRET`
- `ASSET_SIGNING_SECRET`
- `PROTECTED_RESUME_URL`
- `PROTECTED_INTRO_VIDEO_URL`

## Google Sheet Columns

Use these columns in the configured sheet:

```text
Timestamp | Name | Email | Authentication Method | Country | Device | Browser | IP Address | Visit Count | Verification Status
```

## Security Reality Check

The client UI blocks unauthenticated viewing, casual copying, right-click, dragging, and direct button access. True server-side protection for portfolio content requires moving all sensitive files out of `public/` and serving them only through `/api/assets/file` after authentication.
