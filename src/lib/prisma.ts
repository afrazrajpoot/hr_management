import { PrismaClient } from "@prisma/client";
import 'server-only';

// Global fix for BigInt serialization errors (e.g., Prisma raw queries returning bigint)
if (typeof BigInt !== 'undefined' && typeof (BigInt.prototype as any).toJSON !== 'function') {
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Production-optimized Prisma client configuration for AWS
const createPrismaClient = () => {
  const url = process.env.DATABASE_URL || '';
  
  // AWS-specific optimizations
  // Connection pool configuration to prevent exhaustion
  // Reduced connection_limit to 5 for better resource management in production
  const connectionParams = [
    'connection_limit=5',       // Reduced from 10 to prevent pool exhaustion (critical for preventing hangs)
    'pool_timeout=15',          // Reduced from 20s - max time to wait for a connection from the pool
    'connect_timeout=8',        // Reduced from 10s - max time to establish a new connection
    'statement_timeout=25000',  // 25s query timeout (reduced from 30s)
    'idle_in_transaction_session_timeout=10000', // Reduced from 15s - prevent idle transactions from holding connections
  ].join('&');

  // Only add params if they're not already in the URL
  const finalUrl = url.includes('?') 
    ? (url.includes('connection_limit') ? url : `${url}&${connectionParams}`)
    : `${url}?${connectionParams}`;

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error', 'warn', 'info', 'query'], // Log queries in production for monitoring
    
    datasources: {
      db: {
        url: finalUrl,
      },
    },
    
    // Serverless optimizations
    errorFormat: 'minimal',
    
    // Tighter timeouts for AWS Lambda/serverless
    transactionOptions: {
      maxWait: 10000,   // 10s max wait for connection from pool
      timeout: 30000,   // 30s transaction timeout
    },
  });
};

// Global instance with connection pooling
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Optional: Add middleware for logging and monitoring
prisma.$use(async (params, next) => {
  const start = Date.now();
  const result = await next(params);
  const duration = Date.now() - start;
  
  // Log slow queries (adjust threshold as needed)
  if (duration > 5000) {
    console.warn(`[PRISMA] Slow query (${duration}ms):`, {
      model: params.model,
      action: params.action,
      duration: `${duration}ms`,
    });
  }
  
  return result;
});

/**
 * Check database connection health
 * Returns true if connection is healthy, false otherwise
 * Uses a lightweight query with timeout to avoid holding connections
 */
export async function checkConnectionHealth(): Promise<boolean> {
  try {
    // Use a lightweight query with explicit timeout to avoid holding connections
    // This query should complete in < 1 second
    await Promise.race([
      prisma.$queryRaw`SELECT 1 as health_check`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Health check timeout')), 3000)
      ),
    ]);
    return true;
  } catch (error: any) {
    // Don't log timeout errors as they're expected if pool is busy
    if (!error.message?.includes('timeout')) {
      console.error(`[${new Date().toISOString()}] [PRISMA] Connection health check failed:`, error.message);
    }
    
    // Try to reconnect if connection is lost (but don't hold connection during reconnect)
    if (error.code === 'P1001' || error.code === 'P1008' || error.message?.includes('connection')) {
      try {
        // Use timeout for reconnect to avoid hanging
        await Promise.race([
          (async () => {
            await prisma.$disconnect();
            await prisma.$connect();
          })(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Reconnect timeout')), 5000)
          ),
        ]);
        console.log(`[${new Date().toISOString()}] [PRISMA] Reconnected successfully`);
        return true;
      } catch (reconnectError: any) {
        if (!reconnectError.message?.includes('timeout')) {
          console.error(`[${new Date().toISOString()}] [PRISMA] Reconnection failed:`, reconnectError);
        }
        return false;
      }
    }
    
    return false;
  }
}

// Connection health monitoring (runs every 10 minutes in production)
// Store interval ID to allow cleanup on shutdown
// Increased interval to reduce connection usage
let healthCheckIntervalId: NodeJS.Timeout | null = null;

if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
  const healthCheckInterval = 10 * 60 * 1000; // 10 minutes (increased from 5 to reduce connection usage)
  
  if (!(globalThis as any).__prismaHealthCheckRunning) {
    healthCheckIntervalId = setInterval(async () => {
      try {
        const isHealthy = await checkConnectionHealth();
        if (!isHealthy) {
          console.warn(`[${new Date().toISOString()}] [PRISMA] Connection health check failed - monitoring...`);
        }
      } catch (error) {
        // Silently handle errors to prevent health check from causing issues
        // Health check failures are logged in checkConnectionHealth
      }
    }, healthCheckInterval);
    
    (globalThis as any).__prismaHealthCheckRunning = true;
    (globalThis as any).__prismaHealthCheckIntervalId = healthCheckIntervalId;
    console.log('[PRISMA] Connection health monitoring started (every 10 minutes)');
  }
}

// Graceful shutdown handler
if (typeof process !== 'undefined') {
  const shutdownHandler = async () => {
    console.log('[PRISMA] Shutting down gracefully...');
    
    // Clear health check interval to prevent memory leak
    if (healthCheckIntervalId) {
      clearInterval(healthCheckIntervalId);
      healthCheckIntervalId = null;
      console.log('[PRISMA] Health check interval cleared');
    }
    
    // Also clear from global if it exists
    const globalIntervalId = (globalThis as any).__prismaHealthCheckIntervalId;
    if (globalIntervalId) {
      clearInterval(globalIntervalId);
      (globalThis as any).__prismaHealthCheckIntervalId = null;
    }
    
    try {
      await prisma.$disconnect();
      console.log('[PRISMA] Disconnected successfully');
    } catch (error) {
      console.error('[PRISMA] Error during shutdown:', error);
    }
  };

  // Register once
  if (!(globalThis as any).__prismaHandlersRegistered) {
    process.on('beforeExit', shutdownHandler);
    process.on('SIGTERM', shutdownHandler);
    process.on('SIGINT', shutdownHandler);
    (globalThis as any).__prismaHandlersRegistered = true;
  }
}

export default prisma;