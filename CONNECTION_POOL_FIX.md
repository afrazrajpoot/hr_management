# Fix for 504 Timeout Errors After 10 Minutes

## Problem
Your Next.js API routes (POST, PUT, DELETE) were experiencing 504 Gateway Timeout errors after approximately 10 minutes of operation. This was caused by Prisma connection pool exhaustion and database connection timeouts.

## Solution Applied

### 1. Enhanced Prisma Connection Pool Configuration

The Prisma client now automatically adds connection pool parameters to your `DATABASE_URL` if they're not already present:

- `connection_limit=10`: Limits the number of concurrent connections (adjust based on your database plan)
- `pool_timeout=20`: Maximum time to wait for a connection from the pool
- `connect_timeout=10`: Maximum time to establish a new connection

### 2. Connection Health Monitoring

- Automatic health checks every 5 minutes
- Automatic reconnection on connection loss
- Graceful shutdown handlers

### 3. Next.js Configuration

Added default timeout configuration for API routes.

## Required Actions

### Step 1: Update Your DATABASE_URL (Recommended)

While the code will add default connection pool parameters, it's better to explicitly configure them in your environment variables. Update your `.env` or AWS environment variables:

```bash
# Before (may cause connection issues):
DATABASE_URL="postgresql://postgres:root@localhost:5432/genius_factor?schema=public"

# After (recommended - updated with connection pool parameters):
DATABASE_URL="postgresql://postgres:root@localhost:5432/genius_factor?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=10"
```

**Your specific DATABASE_URL should be:**
```bash
DATABASE_URL="postgresql://postgres:root@localhost:5432/genius_factor?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=10"
```

**Where to update:**
- **Local development**: Update `.env` file in `hr_management/` directory
- **AWS Server**: Update environment variables in your deployment configuration (PM2, Docker, systemd, or AWS console)

**Connection Pool Sizing Guidelines:**
- **Small applications**: `connection_limit=5-10`
- **Medium applications**: `connection_limit=10-20`
- **Large applications**: `connection_limit=20-50` (check your database plan limits)

**Important:** The `connection_limit` should be less than your database's maximum connections to avoid exhausting the database.

### Step 2: Verify nginx/AWS Load Balancer Timeout Settings

If you're still experiencing timeouts, check your nginx or AWS Load Balancer configuration:

#### For nginx:
```nginx
proxy_read_timeout 300s;
proxy_connect_timeout 300s;
proxy_send_timeout 300s;
```

#### For AWS Application Load Balancer:
- Go to your ALB target group settings
- Set "Idle timeout" to at least 300 seconds (5 minutes)
- Default is 60 seconds, which may be too short

### Step 3: Monitor Connection Health

The application now logs connection health status. Check your logs for:
- `[PRISMA] Connection health check failed` - indicates connection issues
- `[PRISMA] Reconnected successfully` - automatic recovery working
- `[PRISMA] Reconnection failed` - requires manual intervention

### Step 4: Restart Your Application

After deploying these changes:

```bash
# If using PM2
pm2 restart your-app-name

# If using Docker
docker-compose restart

# If using systemd
sudo systemctl restart your-service
```

## Testing

1. **Test immediately after deployment:**
   ```bash
   curl -X POST https://your-domain.com/api/your-endpoint \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

2. **Test after 10+ minutes:**
   - Wait 10+ minutes
   - Make another POST/PUT/DELETE request
   - Should work without 504 errors

3. **Monitor logs:**
   - Watch for connection health check messages
   - Verify no connection pool exhaustion errors

## Additional Optimization (Optional)

For critical transactions, you can use the new helper functions:

```typescript
import { withTransaction } from '@/lib/prisma-helpers';

// Instead of:
await prisma.$transaction(async (tx) => {
  // your operations
});

// Use:
await withTransaction(async (tx) => {
  // your operations
}, 60000); // 60 second timeout
```

## Troubleshooting

### Still getting 504 errors?

1. **Check database connection limits:**
   ```sql
   -- PostgreSQL
   SHOW max_connections;
   SELECT count(*) FROM pg_stat_activity;
   ```

2. **Increase connection pool timeout:**
   Update `DATABASE_URL` with higher `pool_timeout`:
   ```
   ?connection_limit=10&pool_timeout=30&connect_timeout=15
   ```

3. **Check for long-running queries:**
   ```sql
   SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
   FROM pg_stat_activity 
   WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
   ```

4. **Review API route maxDuration:**
   Ensure your route's `maxDuration` export matches the expected operation time:
   ```typescript
   export const maxDuration = 60; // seconds
   ```

### Connection pool exhausted?

- Reduce `connection_limit` if your database has limited connections
- Optimize queries to run faster
- Add database connection pooling (PgBouncer, AWS RDS Proxy)

## Summary

The main fixes applied:
✅ Automatic connection pool configuration in Prisma client
✅ Connection health monitoring every 5 minutes with auto-recovery
✅ Proper connection cleanup on graceful shutdown
✅ Helper utilities for robust transaction handling (`withTransaction`, `withPrismaHealthCheck`)
✅ Better error handling and connection recovery

**Key Changes:**
1. **`src/lib/prisma.ts`**: Enhanced with automatic connection pool parameters, health checks, and recovery
2. **`src/lib/prisma-helpers.ts`**: New utility functions for safer transaction handling
3. **Connection Pool**: Automatically configured with reasonable defaults (can be overridden in DATABASE_URL)

These changes should resolve the 504 timeout issues you were experiencing after 10 minutes of operation by:
- Preventing connection pool exhaustion
- Automatically recovering from lost connections
- Monitoring connection health proactively
- Properly managing connection lifecycle

**Next Steps:**
1. Review and update your `DATABASE_URL` environment variable (see Step 1 above)
2. Deploy these changes to your AWS server
3. Restart your application
4. Monitor logs for connection health messages

