# Nginx Configuration for Next.js API Timeouts on AWS

## Problem
POST, PUT, DELETE methods are timing out with 504 Gateway Timeout errors in production while GET requests work fine.

## Solution
Configure nginx to allow longer timeouts for API routes, especially for POST/PUT/DELETE operations.

## Nginx Configuration

Add or update these settings in your nginx configuration file (usually `/etc/nginx/sites-available/your-site` or `/etc/nginx/nginx.conf`):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Increase client body size for file uploads
    client_max_body_size 50M;
    
    # Increase timeout values
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
    send_timeout 300s;
    
    # Buffer settings
    proxy_buffering on;
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;

    location / {
        proxy_pass http://localhost:3000;  # Adjust port if different
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Apply timeout settings to all requests
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
    
    # Specific configuration for API routes if needed
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Longer timeouts for API routes
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        
        # Disable buffering for API routes to allow streaming responses
        proxy_buffering off;
    }
}
```

## Steps to Apply Configuration

1. **Edit nginx configuration:**
   ```bash
   sudo nano /etc/nginx/sites-available/your-site
   # or
   sudo nano /etc/nginx/nginx.conf
   ```

2. **Test nginx configuration:**
   ```bash
   sudo nginx -t
   ```

3. **Reload nginx:**
   ```bash
   sudo systemctl reload nginx
   # or
   sudo service nginx reload
   ```

## Important Notes

1. **Timeout Values:** The values above (300 seconds = 5 minutes) are generous. Adjust based on your actual API route `maxDuration` settings:
   - Routes with `maxDuration = 30` need at least 30s timeout
   - Routes with `maxDuration = 60` need at least 60s timeout  
   - Routes with `maxDuration = 120` need at least 120s timeout

2. **AWS Load Balancer:** If you're using an AWS Application Load Balancer (ALB) or Elastic Load Balancer (ELB), you may also need to configure timeouts there:
   - ALB idle timeout: Default is 60s, increase to 300s
   - ALB target group health check timeout: Ensure it's sufficient

3. **Security Considerations:**
   - Very long timeouts can make your server vulnerable to slow HTTP attacks
   - Consider implementing rate limiting
   - Monitor for long-running requests

4. **Database Connection Pool:** Ensure your database connection pool settings in `DATABASE_URL` are appropriate:
   ```
   DATABASE_URL="postgresql://user:password@host:port/database?connection_limit=10&pool_timeout=20&connect_timeout=10"
   ```

## Alternative: AWS-Specific Configuration

If using AWS with Application Load Balancer, you might need to configure:

1. **ALB Target Group Settings:**
   - Increase health check timeout
   - Increase deregistration delay

2. **EC2 Instance:** Ensure the Next.js app is running with sufficient resources

3. **CloudWatch:** Monitor for timeout errors and adjust accordingly

## Testing

After applying the configuration, test your POST/PUT/DELETE endpoints:

```bash
# Test POST endpoint
curl -X POST https://your-domain.com/api/your-endpoint \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  -v

# Test PUT endpoint
curl -X PUT https://your-domain.com/api/your-endpoint \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  -v
```

## Troubleshooting

1. **Check nginx error logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Check Next.js logs:**
   ```bash
   # Wherever your Next.js app logs are
   pm2 logs
   # or
   journalctl -u your-nextjs-service -f
   ```

3. **Verify nginx is using the new config:**
   ```bash
   sudo nginx -T | grep -i timeout
   ```

