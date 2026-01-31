import {PrismaClient} from '@prisma/client'
import {PrismaLibSql} from '@prisma/adapter-libsql'

const connectionConfig = {
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db"
}

const adapter = new PrismaLibSql(connectionConfig)

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma || new PrismaClient({adapter})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db