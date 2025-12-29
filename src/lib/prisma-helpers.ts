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
 * Execute a transaction with proper error handling, connection recovery, and timeout
 * Use this wrapper for critical transactions to prevent connection issues and timeouts
 * 
 * @param transactionFn - The transaction function to execute
 * @param maxWait - Maximum time (ms) to wait for a connection from the pool (default: 10000ms)
 * @param timeout - Maximum time (ms) for the entire transaction to complete (default: 30000ms)
 */
export async function withTransaction<T>(
  transactionFn: (tx: any) => Promise<T>,
  maxWait: number = 10000, // Maximum time to wait for a connection from the pool
  timeout: number = 30000  // Maximum time for the entire transaction
): Promise<T> {
  try {
    // Check connection health before transaction
    const isHealthy = await checkConnectionHealth();
    if (!isHealthy) {
      throw new Error('Database connection is not available');
    }

    // Wrap transaction in a timeout
    const transactionPromise = prisma.$transaction(transactionFn, {
      maxWait, // Maximum time to wait for a connection from the pool
      timeout, // Maximum time for the transaction to complete
    });

    // Race against timeout
    return await Promise.race([
      transactionPromise,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Transaction timed out after ${timeout}ms`)),
          timeout
        )
      ),
    ]);
  } catch (error: any) {
    // Log transaction errors for debugging
    console.error(`[${new Date().toISOString()}] [PRISMA] Transaction error:`, {
      message: error.message,
      code: error.code,
      timeout: error.message?.includes('timeout'),
    });
    
    // If it's a connection error, try to reconnect and retry once
    if (error.code === 'P1001' || error.code === 'P1008' || error.message?.includes('connection')) {
      console.log(`[${new Date().toISOString()}] [PRISMA] Attempting to recover from connection error...`);
      const recovered = await checkConnectionHealth();
      if (recovered) {
        // Retry once after recovery with same timeout
        try {
          const retryPromise = prisma.$transaction(transactionFn, {
            maxWait,
            timeout,
          });
          
          return await Promise.race([
            retryPromise,
            new Promise<T>((_, reject) =>
              setTimeout(
                () => reject(new Error(`Transaction retry timed out after ${timeout}ms`)),
                timeout
              )
            ),
          ]);
        } catch (retryError) {
          console.error(`[${new Date().toISOString()}] [PRISMA] Transaction retry failed:`, retryError);
          throw retryError;
        }
      }
    }
    throw error;
  }
}

