import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Connection pool configuration
// These settings help prevent connection pool exhaustion and timeouts
const getConnectionUrl = () => {
  const url = process.env.DATABASE_URL || '';
  
  // If DATABASE_URL doesn't have connection pool parameters, add them
  // This prevents connection pool exhaustion and 10-minute timeout issues
  if (url && !url.includes('connection_limit') && !url.includes('pool_timeout')) {
    // Add connection pool parameters to prevent exhaustion
    // connection_limit: Maximum number of connections in the pool (adjust based on your DB plan)
    // pool_timeout: Maximum time (seconds) to wait for a connection from the pool
    // connect_timeout: Maximum time (seconds) to wait when establishing a connection
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}connection_limit=10&pool_timeout=20&connect_timeout=10`;
  }
  
  return url;
};

// Production-optimized Prisma client configuration
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
    datasources: {
      db: {
        url: getConnectionUrl(),
      },
    },
    // Additional configuration to handle connection issues
    errorFormat: 'minimal',
  });

// ALWAYS cache the prisma instance to prevent connection pool exhaustion
// This is critical for serverless/edge environments and prevents creating
// new connections on every request
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

// Connection health check and recovery
const checkConnectionHealth = async () => {
  try {
    // Simple query to test connection health
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] [PRISMA] Connection health check failed:`, error?.message || error);
    
    // Only attempt reconnect if it's a connection-related error
    // Prisma error codes: P1001 = Connection error, P1008 = Operations timed out
    if (error?.code === 'P1001' || error?.code === 'P1008') {
      try {
        // Try to reconnect (connect is idempotent - won't create new connection if already connected)
        await prisma.$connect();
        // Test the connection again
        await prisma.$queryRaw`SELECT 1`;
        console.log(`[${new Date().toISOString()}] [PRISMA] Reconnected successfully`);
        return true;
      } catch (reconnectError: any) {
        console.error(`[${new Date().toISOString()}] [PRISMA] Reconnection failed:`, reconnectError?.message || reconnectError);
        return false;
      }
    }
    
    // For other errors, assume connection is okay (might be query error, not connection)
    return false;
  }
};

// Only add graceful shutdown handlers once
if (typeof process !== 'undefined') {
  const globalForHandlers = globalThis as any;
  if (!globalForHandlers.__prismaHandlersRegistered) {
    // Periodic connection health check (every 5 minutes)
    const healthCheckInterval = setInterval(async () => {
      await checkConnectionHealth();
    }, 5 * 60 * 1000); // 5 minutes

    const shutdown = async () => {
      clearInterval(healthCheckInterval);
      console.log(`[${new Date().toISOString()}] [PRISMA] Shutting down...`);
      try {
        await prisma.$disconnect();
        console.log(`[${new Date().toISOString()}] [PRISMA] Disconnected`);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] [PRISMA] Error during shutdown:`, error);
      }
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('beforeExit', shutdown);
    
    globalForHandlers.__prismaHandlersRegistered = true;
  }
}

// Export connection health check function for use in API routes if needed
export { checkConnectionHealth };