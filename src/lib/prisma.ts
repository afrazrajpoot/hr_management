import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Production-optimized Prisma client configuration
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
    // Connection pool configuration for production
    // Note: Connection pool settings should be configured in DATABASE_URL
    // Format: postgresql://user:pass@host:port/db?connection_limit=10&pool_timeout=20
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// ALWAYS cache the prisma instance to prevent connection pool exhaustion
// This is critical for serverless/edge environments and prevents creating
// new connections on every request
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

// Only add graceful shutdown handlers once
if (typeof process !== 'undefined') {
  const globalForHandlers = globalThis as any;
  if (!globalForHandlers.__prismaHandlersRegistered) {
    const shutdown = async () => {
      console.log(`[${new Date().toISOString()}] [PRISMA] Shutting down...`);
      await prisma.$disconnect();
      console.log(`[${new Date().toISOString()}] [PRISMA] Disconnected`);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    globalForHandlers.__prismaHandlersRegistered = true;
  }
}