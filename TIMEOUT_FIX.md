# Fix for Next.js POST API Timeout Issues on AWS

## Problem Summary
Your Next.js POST API routes were working after server restart but timing out after some time in production on AWS. This was caused by:

1. **Missing `checkConnectionHealth` function** - The helper functions were trying to import a function that didn't exist
2. **Missing `connection_limit` parameter** - Connection pool could grow unbounded, leading to exhaustion
3. **Insufficient transaction timeout handling** - Transactions could hang indefinitely
4. **No automatic connection recovery** - Lost connections weren't being detected and recovered

## Fixes Applied

### 1. ✅ Added Missing `checkConnectionHealth` Function
- Added connection health checking function to `src/lib/prisma.ts`
- Automatically attempts reconnection if connection is lost
- Returns boolean status for connection health

### 2. ✅ Added Connection Pool Limit
- Added `connection_limit=10` to connection parameters
- Prevents connection pool exhaustion
- Adjust based on your database plan (see below)

### 3. ✅ Improved Transaction Timeout Handling
- Enhanced `withTransaction` helper in `src/lib/prisma-helpers.ts`
- Added explicit timeout parameter (default: 30 seconds)
- Wraps transactions in Promise.race with timeout
- Automatic retry on connection errors

### 4. ✅ Added Connection Health Monitoring
- Automatic health checks every 5 minutes in production
- Logs connection status for monitoring
- Proactive connection recovery

### 5. ✅ Updated Critical POST Routes
- Updated `employe-profile/route.ts` to use improved transaction helper
- Updated `hr-api/company/route.ts` to use improved transaction helper
- Other routes can be updated similarly as needed

## Required Actions

### Step 1: Update DATABASE_URL (CRITICAL)

Update your `DATABASE_URL` environment variable on AWS to include connection pool parameters:

```bash
# Add these parameters to your existing DATABASE_URL:
# connection_limit=10&pool_timeout=20&connect_timeout=10

# Example:
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=10"
```
 
**Where to update:**
- **AWS EC2/PM2**: Update in your `.env` file or PM2 ecosystem file
- **AWS Elastic Beanstalk**: Update in Environment Variables
- **AWS ECS/Fargate**: Update in task definition environment variables
- **Docker**: Update in `docker-compose.yml` or `.env` file

**Connection Pool Sizing:**
- **Small apps (< 100 concurrent users)**: `connection_limit=5-10`
- **Medium apps (100-500 users)**: `connection_limit=10-20`
- **Large apps (500+ users)**: `connection_limit=20-50`
- **Important**: Keep `connection_limit` below your database's `max_connections` setting

### Step 2: Check AWS Load Balancer/nginx Timeout

If you're using AWS Application Load Balancer or nginx, ensure timeouts are sufficient:

**AWS ALB:**
- Go to Target Group → Health checks
- Set "Idle timeout" to at least **300 seconds (5 minutes)**
- Default is 60 seconds, which may be too short

**nginx:**
```nginx
proxy_read_timeout 300s;
proxy_connect_timeout 300s;
proxy_send_timeout 300s;
```

### Step 3: Deploy and Restart

After deploying these changes:

```bash
# If using PM2
pm2 restart your-app-name

# If using Docker
docker-compose restart

# If using systemd
sudo systemctl restart your-service

# If using AWS Elastic Beanstalk
eb deploy
```

### Step 4: Monitor Logs

Watch for these log messages to verify the fixes are working:

**Good signs:**
- `[PRISMA] Connection health monitoring started`
- `[PRISMA] Reconnected successfully` (if connection was lost)

**Warning signs:**
- `[PRISMA] Connection health check failed` - indicates connection issues
- `[PRISMA] Slow query` - queries taking > 5 seconds
- `Transaction timed out` - transaction timeout occurred

## Testing

1. **Immediate test** (after restart):
   ```bash
   curl -X POST https://your-domain.com/api/employe-profile \
     -H "Content-Type: application/json" \
     -H "Cookie: your-session-cookie" \
     -d '{"firstName":"Test","lastName":"User","email":"test@example.com"}'
   ```

2. **After 10+ minutes** (the problematic scenario):
   - Wait 10+ minutes without making requests
   - Make a POST request
   - Should work without timeout errors

3. **Monitor connection pool**:
   ```sql
   -- Check active connections
   SELECT count(*) FROM pg_stat_activity WHERE datname = 'your_database';
   
   -- Check for long-running queries
   SELECT pid, now() - query_start AS duration, query 
   FROM pg_stat_activity 
   WHERE state = 'active' AND now() - query_start > interval '5 minutes';
   ```

## Additional Optimizations (Optional)

### Update Other POST Routes

You can update other POST routes to use the improved transaction helper:

```typescript
// Before:
await prisma.$transaction(async (tx) => {
  // operations
});

// After:
import { withTransaction } from '@/lib/prisma-helpers';

await withTransaction(async (tx) => {
  // operations
}, 10000, 30000); // maxWait: 10s, timeout: 30s
```

### Adjust Timeouts Per Route

If you have routes that need longer timeouts, you can adjust:

```typescript
// For long-running operations (e.g., file processing)
await withTransaction(async (tx) => {
  // operations
}, 15000, 60000); // maxWait: 15s, timeout: 60s
```

## Troubleshooting

### Still Getting Timeouts?

1. **Check database connection limits:**
   ```sql
   SHOW max_connections;
   SELECT count(*) FROM pg_stat_activity;
   ```

2. **Increase connection pool timeout:**
   Update `DATABASE_URL` with higher `pool_timeout`:
   ```
   ?connection_limit=10&pool_timeout=30&connect_timeout=15
   ```

3. **Check for connection leaks:**
   ```sql
   SELECT pid, usename, application_name, client_addr, state, wait_event_type
   FROM pg_stat_activity 
   WHERE datname = 'your_database' AND state != 'idle';
   ```

4. **Review route `maxDuration`:**
   Ensure your route's `maxDuration` export matches expected operation time:
   ```typescript
   export const maxDuration = 60; // seconds
   ```

### Connection Pool Exhausted?

- Reduce `connection_limit` if your database has limited connections
- Optimize queries to run faster
- Consider using a connection pooler (PgBouncer, AWS RDS Proxy)

## Summary of Changes

**Files Modified:**
1. `src/lib/prisma.ts` - Added `checkConnectionHealth`, connection pool limit, health monitoring
2. `src/lib/prisma-helpers.ts` - Enhanced `withTransaction` with timeout support
3. `src/app/api/employe-profile/route.ts` - Updated to use improved transaction helper
4. `src/app/api/hr-api/company/route.ts` - Updated to use improved transaction helper

**Key Improvements:**
- ✅ Connection pool limit prevents exhaustion
- ✅ Automatic connection health monitoring and recovery
- ✅ Transaction timeouts prevent hanging operations
- ✅ Better error handling and logging
- ✅ Automatic reconnection on connection loss

These changes should resolve the timeout issues you were experiencing after the server runs for some time.

