import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Production-optimized Prisma client configuration for AWS
const createPrismaClient = () => {
  const url = process.env.DATABASE_URL || '';
  
  // AWS-specific optimizations
  // Connection pool configuration to prevent exhaustion
  const connectionParams = [
    'connection_limit=10',      // Limit concurrent connections (critical for preventing pool exhaustion)
    'pool_timeout=20',          // Max time to wait for a connection from the pool
    'connect_timeout=10',       // Max time to establish a new connection
    'statement_timeout=30000',  // 30s query timeout (increased for complex queries)
    'idle_in_transaction_session_timeout=15000', // Prevent idle transactions from holding connections
  ].join('&');

  // Only add params if they're not already in the URL
  const finalUrl = url.includes('?') 
    ? (url.includes('connection_limit') ? url : `${url}&${connectionParams}`)
    : `${url}?${connectionParams}`;

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
    
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
 */
export async function checkConnectionHealth(): Promise<boolean> {
  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] [PRISMA] Connection health check failed:`, error.message);
    
    // Try to reconnect if connection is lost
    if (error.code === 'P1001' || error.code === 'P1008' || error.message?.includes('connection')) {
      try {
        await prisma.$disconnect();
        await prisma.$connect();
        console.log(`[${new Date().toISOString()}] [PRISMA] Reconnected successfully`);
        return true;
      } catch (reconnectError) {
        console.error(`[${new Date().toISOString()}] [PRISMA] Reconnection failed:`, reconnectError);
        return false;
      }
    }
    
    return false;
  }
}

// Connection health monitoring (runs every 5 minutes in production)
// Store interval ID to allow cleanup on shutdown
let healthCheckIntervalId: NodeJS.Timeout | null = null;

if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
  const healthCheckInterval = 5 * 60 * 1000; // 5 minutes
  
  if (!(globalThis as any).__prismaHealthCheckRunning) {
    healthCheckIntervalId = setInterval(async () => {
      const isHealthy = await checkConnectionHealth();
      if (!isHealthy) {
        console.warn(`[${new Date().toISOString()}] [PRISMA] Connection health check failed - monitoring...`);
      }
    }, healthCheckInterval);
    
    (globalThis as any).__prismaHealthCheckRunning = true;
    (globalThis as any).__prismaHealthCheckIntervalId = healthCheckIntervalId;
    console.log('[PRISMA] Connection health monitoring started');
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