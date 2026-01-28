import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

if (process.env.NODE_ENV === "development") globalForPrisma.prisma = prisma;

export { prisma };
