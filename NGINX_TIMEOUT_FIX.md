# Fix for 504 Gateway Timeout from Nginx

## Problem
You're getting `504 Gateway Time-out` from nginx, which means:
- Your Next.js API is taking longer than nginx's default timeout (usually 60 seconds)
- nginx is cutting off the connection before the API responds

## Solution: Increase Nginx Timeout

### Step 1: Find Your Nginx Configuration

Your nginx config is usually in one of these locations:
- `/etc/nginx/sites-available/your-site`
- `/etc/nginx/nginx.conf`
- `/etc/nginx/conf.d/default.conf`

### Step 2: Add/Update Timeout Settings

Add or update these settings in your nginx server block:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Increase timeouts for Next.js API routes
    proxy_read_timeout 300s;        # 5 minutes (300 seconds)
    proxy_connect_timeout 300s;      # 5 minutes
    proxy_send_timeout 300s;         # 5 minutes
    
    # Increase buffer sizes for large requests
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;

    location / {
        proxy_pass http://localhost:3000;  # Your Next.js port
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Apply timeouts to this location
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }

    # Specific timeout for API routes (if needed)
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Longer timeout for API routes
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

### Step 3: Test and Reload Nginx

```bash
# Test nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
# or
sudo service nginx reload
```

## Alternative: Quick Fix (If You Can't Edit Config)

If you can't edit nginx config right now, you can temporarily increase timeout in nginx.conf:

```bash
# Edit main nginx config
sudo nano /etc/nginx/nginx.conf

# Add these in the http block:
http {
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    
    # ... rest of config
}

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

## Why This Happens

1. **Default nginx timeout is 60 seconds**
2. **Your API routes have `maxDuration = 60` or `120`**
3. **If API takes 61+ seconds, nginx times out first**
4. **Connection pool issues can make APIs slower**

## Recommended Timeout Values

- **For most APIs**: `300s` (5 minutes) - safe default
- **For file uploads/parsing**: `600s` (10 minutes) - if you have long operations
- **For quick APIs**: `120s` (2 minutes) - if you want faster failure

## After Fixing Nginx

1. **Deploy your code fixes** (connection pool, transactions)
2. **Update nginx timeout** (this file)
3. **Restart nginx**
4. **Test your APIs**

## Verify It's Working

```bash
# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check if timeout errors are gone
# You should see fewer 504 errors
```

## Important Notes

- **Nginx timeout should be > Next.js maxDuration**
- If your API has `maxDuration = 120`, nginx should be at least `180s` (3 minutes)
- **Don't set nginx timeout too high** (like 1 hour) - it can cause other issues
- **300s (5 minutes) is a good balance** for most applications

