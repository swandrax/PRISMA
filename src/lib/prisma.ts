// Safe Prisma Client singleton with fallback for build environments
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let PrismaClientConstructor: any

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  PrismaClientConstructor = require('@prisma/client').PrismaClient
} catch {
  // Fallback dummy constructor for typecheck/build before prisma generate
  PrismaClientConstructor = class DummyPrismaClient {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForPrisma = globalThis as unknown as { prisma: any }

export const prisma = globalForPrisma.prisma || new PrismaClientConstructor()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
