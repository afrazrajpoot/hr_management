# Complete Guide: Using maxDuration to Fix 504 Gateway Timeout

## What is maxDuration?

`maxDuration` is a Next.js configuration that tells the framework how long an API route is allowed to run before timing out. By default, Next.js has timeout limits that can cause 504 errors.

## How maxDuration Solves the Issue

### ✅ When maxDuration ALONE Can Solve It:

1. **Direct Next.js deployment** (no nginx/proxy in front)
2. **Serverless functions** (Vercel, Netlify, etc.)
3. **Docker/Kubernetes** with proper timeout settings
4. **When nginx timeout > maxDuration** (nginx already allows enough time)

### ⚠️ When maxDuration is NOT Enough:

1. **nginx timeout < maxDuration** - nginx will timeout first
2. **AWS Load Balancer timeout < maxDuration** - ALB/ELB times out first
3. **Reverse proxy timeouts** - Any proxy between client and Next.js

## How to Use maxDuration

### Basic Syntax

In any API route file, add at the top level (before any functions):

```typescript
// Set max duration for this route (in seconds)
export const maxDuration = 60; // 60 seconds

export async function POST(req: Request) {
  // Your route handler
}
```

### What We've Already Added

We've added `maxDuration` to all your API routes:

- **Short operations (30 seconds):** GET routes, simple updates
- **Medium operations (60 seconds):** POST with database operations
- **Long operations (120 seconds):** File uploads, batch processing

### Check Current maxDuration Settings

All your routes now have `maxDuration` configured. To verify:

```bash
cd hr_management
grep -r "export const maxDuration" src/app/api/
```

You should see something like:
```
src/app/api/internal/fastapi-token/route.ts:export const maxDuration = 60;
src/app/api/hr-api/hr-employee/route.ts:export const maxDuration = 60;
src/app/api/parse/route.ts:export const maxDuration = 120;
... etc
```

## Step-by-Step: Testing if maxDuration Solves Your Issue

### Step 1: Deploy Your Changes

```bash
# Build your Next.js app
cd hr_management
npm run build

# Deploy to your AWS server
# (use your deployment method - pm2, docker, etc.)
```

### Step 2: Test Without Changing nginx

Try a POST request that was timing out:

```bash
curl -X POST https://your-domain.com/api/internal/fastapi-token \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -v
```

**If it works:** maxDuration solved it! ✅  
**If you still get 504:** nginx timeout is the issue (go to Step 3)

### Step 3: Check nginx Configuration

If you still get 504 errors, nginx is timing out. Check current nginx timeout:

```bash
# SSH into your AWS server
ssh user@your-aws-server

# Check nginx timeout settings
sudo nginx -T 2>/dev/null | grep -i timeout
```

Look for values like:
- `proxy_read_timeout` (default: 60s)
- `proxy_connect_timeout` (default: 60s)
- `proxy_send_timeout` (default: 60s)

### Step 4: Configure nginx (If Needed)

If nginx timeout is less than your maxDuration values, update nginx:

```bash
# Edit nginx config
sudo nano /etc/nginx/sites-available/your-site
```

Add or update these in your `server` block:

```nginx
# Set nginx timeout HIGHER than your max Duration values
proxy_read_timeout 300s;      # 5 minutes (higher than max 120s)
proxy_connect_timeout 300s;
proxy_send_timeout 300s;
send_timeout 300s;
client_max_body_size 50M;     # For file uploads
```

Save and reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Understanding the Relationship

```
Client Request
    ↓
nginx (60s default timeout) ← If times out here → 504 Gateway Timeout
    ↓
Next.js API Route (maxDuration) ← If times out here → 500 Internal Server Error
    ↓
Your Code Execution
```

**Both need to be configured correctly!**

## Recommended Configuration

### For Your Use Case:

1. **Next.js (already done):**
   - Fast routes: `maxDuration = 30`
   - Normal routes: `maxDuration = 60`
   - File uploads: `maxDuration = 120`

2. **nginx (you need to add):**
   ```nginx
   proxy_read_timeout 300s;  # Higher than max maxDuration (120s)
   ```

3. **If using AWS ALB:**
   - Increase idle timeout to 300 seconds in AWS Console
   - ALB → Target Groups → Your Group → Attributes → Edit idle timeout

## Quick Verification Script

Create a test route to verify maxDuration is working:

```typescript
// src/app/api/test-timeout/route.ts
export const maxDuration = 10; // 10 seconds for testing

export async function POST() {
  console.log('Test route started at:', new Date().toISOString());
  
  // Simulate a 5-second operation
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  return Response.json({ 
    success: true, 
    message: 'This took 5 seconds',
    timestamp: new Date().toISOString()
  });
}
```

Test it:
```bash
time curl -X POST https://your-domain.com/api/test-timeout
```

If it completes in ~5 seconds: maxDuration is working! ✅

## Troubleshooting

### Still Getting 504 After Adding maxDuration?

1. **Check nginx logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Check Next.js logs:**
   ```bash
   # If using PM2
   pm2 logs
   
   # If using systemd
   journalctl -u your-service -f
   ```

3. **Verify maxDuration is in production:**
   ```bash
   # Check built files
   grep -r "maxDuration" .next/
   ```

### Common Issues:

- ❌ **504 from nginx:** Increase nginx timeout
- ❌ **500 from Next.js:** Check maxDuration is exported correctly
- ❌ **Still timing out:** Check AWS Load Balancer settings

## Summary

✅ **maxDuration is already added to all your routes**  
⚠️ **You still need to configure nginx timeout** (if using nginx)  
📝 **Follow Step 2-4 above to verify and fix**

The combination of both (maxDuration + nginx timeout) will solve your 504 issues!

