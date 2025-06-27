// import { unstable_cache } from "next/cache"

// // Cache configuration
// const CACHE_TAGS = {
//   PROJECTS: "projects",
//   COMMITS: "commits",
//   QUESTIONS: "questions",
// } as const

// // Cache durations (in seconds)
// const CACHE_DURATIONS = {
//   SHORT: 60, // 1 minute
//   MEDIUM: 300, // 5 minutes
//   LONG: 3600, // 1 hour
// } as const

// // Cached project fetching
// export const getCachedProjects = unstable_cache(
//   async (userId: string) => {
//     const { default: db } = await import("@/lib/db")

//     return db.project.findMany({
//       where: {
//         userToProjects: {
//           some: {
//             userId,
//           },
//         },
//         deletedAt: null,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//       select: {
//         id: true,
//         projectName: true,
//         githubUrl: true,
//         branchName: true,
//         status: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     })
//   },
//   ["projects"],
//   {
//     tags: [CACHE_TAGS.PROJECTS],
//     revalidate: CACHE_DURATIONS.SHORT,
//   },
// )

// // Cached commits fetching
// export const getCachedCommits = unstable_cache(
//   async (projectId: string, page: number, limit = 10) => {
//     const { default: db } = await import("@/lib/db")

//     const [commits, totalCommits] = await Promise.all([
//       db.commit.findMany({
//         where: { projectId },
//         orderBy: { commitDate: "desc" },
//         skip: (page - 1) * limit,
//         take: limit,
//         select: {
//           id: true,
//           commitHash: true,
//           commitMessage: true,
//           commitAuthorName: true,
//           commitAuthorAvatar: true,
//           commitDate: true,
//           summary: true,
//         },
//       }),
//       db.commit.count({
//         where: { projectId },
//       }),
//     ])

//     return {
//       commits,
//       totalCommits,
//       totalPages: Math.ceil(totalCommits / limit),
//       currentPage: page,
//     }
//   },
//   ["commits"],
//   {
//     tags: [CACHE_TAGS.COMMITS],
//     revalidate: CACHE_DURATIONS.MEDIUM,
//   },
// )

// // Cache invalidation helpers
// export async function invalidateProjectsCache() {
//   const { revalidateTag } = await import("next/cache")
//   revalidateTag(CACHE_TAGS.PROJECTS)
// }

// export async function invalidateCommitsCache() {
//   const { revalidateTag } = await import("next/cache")
//   revalidateTag(CACHE_TAGS.COMMITS)
// }

// export async function invalidateQuestionsCache() {
//   const { revalidateTag } = await import("next/cache")
//   revalidateTag(CACHE_TAGS.QUESTIONS)
// }

// // Memory cache for client-side caching
// class MemoryCache {
//   private cache = new Map<string, { data: any; expires: number }>()

//   set(key: string, data: any, ttl = 300000) {
//     // 5 minutes default
//     this.cache.set(key, {
//       data,
//       expires: Date.now() + ttl,
//     })
//   }

//   get(key: string) {
//     const item = this.cache.get(key)
//     if (!item) return null

//     if (Date.now() > item.expires) {
//       this.cache.delete(key)
//       return null
//     }

//     return item.data
//   }

//   delete(key: string) {
//     this.cache.delete(key)
//   }

//   clear() {
//     this.cache.clear()
//   }

//   // Clean expired entries
//   cleanup() {
//     const now = Date.now()
//     for (const [key, item] of this.cache.entries()) {
//       if (now > item.expires) {
//         this.cache.delete(key)
//       }
//     }
//   }
// }

// export const memoryCache = new MemoryCache()

// // Clean up expired entries every 5 minutes
// if (typeof window !== "undefined") {
//   setInterval(() => memoryCache.cleanup(), 5 * 60 * 1000)
// }
