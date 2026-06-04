import { PrismaClient, Prisma } from '@prisma/client';

function buildLogLevels(): Prisma.LogLevel[] {
  if (process.env.NODE_ENV === 'development') {
    return ['query', 'info', 'warn', 'error'];
  }
  return ['warn', 'error'];
}

const prisma = new PrismaClient({
  log: buildLogLevels().map(level => ({ emit: 'event', level })) as Prisma.LogDefinition[],
});

if (process.env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (event: Prisma.QueryEvent) => {
    if (event.duration > 500) {
      console.warn(`[Prisma SLOW QUERY] ${event.duration}ms — ${event.query}`);
    }
  });
}

prisma.$on('warn' as never, (event: Prisma.LogEvent) => {
  console.warn('[Prisma WARN]', event.message);
});

prisma.$on('error' as never, (event: Prisma.LogEvent) => {
  console.error('[Prisma ERROR]', event.message);
});

export default prisma;
