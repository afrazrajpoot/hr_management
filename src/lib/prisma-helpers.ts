import { prisma, checkConnectionHealth } from './prisma';

/**
 * Execute a Prisma operation with connection health check and timeout
 * This helps prevent 504 timeouts by ensuring connections are healthy
 */
export async function withPrismaHealthCheck<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 30000 // 30 seconds default timeout
): Promise<T> {
  // Check connection health before operation
  const isHealthy = await checkConnectionHealth();
  if (!isHealthy) {
    throw new Error('Database connection is not available');
  }

  // Execute with timeout
  return Promise.race([
    operation(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

/**
 * Execute a transaction with proper error handling and connection recovery
 * Use this wrapper for critical transactions to prevent connection issues
 * 
 * Note: Prisma transactions don't have a built-in timeout parameter.
 * Timeouts are controlled by the connection pool settings in DATABASE_URL.
 */
export async function withTransaction<T>(
  transactionFn: (tx: any) => Promise<T>,
  maxWait: number = 5000 // Maximum time (ms) to wait for a connection from the pool
): Promise<T> {
  try {
    // Check connection health before transaction
    const isHealthy = await checkConnectionHealth();
    if (!isHealthy) {
      throw new Error('Database connection is not available');
    }

    return await prisma.$transaction(transactionFn, {
      maxWait, // Maximum time to wait for a connection from the pool
    });
  } catch (error: any) {
    // Log transaction errors for debugging
    console.error(`[${new Date().toISOString()}] [PRISMA] Transaction error:`, error);
    
    // If it's a connection error, try to reconnect and retry once
    if (error.code === 'P1001' || error.code === 'P1008' || error.message?.includes('connection')) {
      console.log(`[${new Date().toISOString()}] [PRISMA] Attempting to recover from connection error...`);
      const recovered = await checkConnectionHealth();
      if (recovered) {
        // Retry once after recovery
        try {
          return await prisma.$transaction(transactionFn, {
            maxWait,
          });
        } catch (retryError) {
          console.error(`[${new Date().toISOString()}] [PRISMA] Transaction retry failed:`, retryError);
          throw retryError;
        }
      }
    }
    throw error;
  }
}

