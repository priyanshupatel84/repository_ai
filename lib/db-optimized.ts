// import { PrismaClient } from "@prisma/client"

// const prismaClientSingleton = () => {
//   return new PrismaClient({
//     log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
//     datasources: {
//       db: {
//         url: process.env.DATABASE_URL,
//       },
//     },
//   }).$extends({
//     query: {
//       // Add query optimization middleware
//       $allOperations({ operation, model, args, query }) {
//         const start = Date.now()
//         const result = query(args)

//         // Log slow queries in development
//         if (process.env.NODE_ENV === "development") {
//           result
//             .then(() => {
//               const duration = Date.now() - start
//               if (duration > 1000) {
//                 // Log queries taking more than 1 second
//                 console.warn(`Slow query detected: ${model}.${operation} took ${duration}ms`)
//               }
//             })
//             .catch(() => {})
//         }

//         return result
//       },
//     },
//   })
// }

// declare const globalThis: {
//   prismaGlobal: ReturnType<typeof prismaClientSingleton>
// } & typeof global

// const db = globalThis.prismaGlobal ?? prismaClientSingleton()

// export default db

// if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = db

// // Connection pool optimization
// export async function optimizeDatabase() {
//   try {
//     // Test connection
//     await db.$queryRaw`SELECT 1`
//     console.log("✅ Database connection established")

//     // Create indexes for better performance
//     await createOptimizedIndexes()
//   } catch (error) {
//     console.error("❌ Database connection failed:", error)
//     throw error
//   }
// }

// async function createOptimizedIndexes() {
//   try {
//     // Add composite indexes for better query performance
//     await db.$executeRaw`
//       CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_user_status 
//       ON "Project" ("deletedAt", "status") 
//       WHERE "deletedAt" IS NULL
//     `

//     await db.$executeRaw`
//       CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commits_project_date 
//       ON "Commit" ("projectId", "commitDate" DESC)
//     `

//     await db.$executeRaw`
//       CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_questions_project_user 
//       ON "Question" ("projectId", "userId", "createdAt" DESC)
//     `

//     await db.$executeRaw`
//       CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_source_code_project 
//       ON "SourceCodeEmbedding" ("projectId")
//     `

//     console.log("✅ Database indexes optimized")
//   } catch (error) {
//     // Indexes might already exist, which is fine
//     console.log("ℹ️ Database indexes already exist or creation skipped")
//   }
// }

// // Graceful shutdown
// process.on("beforeExit", async () => {
//   await db.$disconnect()
// })
