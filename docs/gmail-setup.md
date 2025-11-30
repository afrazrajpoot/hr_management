# Gmail Email Configuration Guide

## Current Issues

1. **Missing `SENDER_EMAIL`**: This environment variable is not set.
2. **Invalid Refresh Token**: The error "Could not refresh access token" means the refresh token is expired or invalid.

## Solution

Add the following to your `.env` file:

```env
SENDER_EMAIL=roshnistore1@gmail.com
GOOGLE_REFRESH_TOKEN=<NEW_REFRESH_TOKEN>
```

## How to Get a New Refresh Token

1. Go to [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)

2. Click the **Settings** icon (⚙️) in the top right

3. Check **"Use your own OAuth credentials"**
   - Enter your `GOOGLE_CLIENT_ID`
   - Enter your `GOOGLE_CLIENT_SECRET`

4. In the left panel under **"Select & authorize APIs"**:
   - Scroll down to **"Gmail API v1"**
   - Check: `https://mail.google.com/`
   - Click **"Authorize APIs"**

5. Sign in with the Gmail account: `roshnistore1@gmail.com`

6. Click **"Exchange authorization code for tokens"**

7. Copy the **"Refresh token"** and add it to your `.env` file

## Test the Configuration

After updating your `.env` file, run:

```bash
npx tsx scripts/test-email.ts
```

You should see: `Email sent successfully!`
