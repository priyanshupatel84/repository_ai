// import useSWR from "swr"
// import axios from "axios"
// import { memoryCache } from "@/lib/cache"

// interface Project {
//   id: string
//   projectName: string
//   githubUrl: string
//   branchName?: string | null
//   status: "loading" | "ready" | "error"
//   createdAt: string
//   updatedAt: string
// }

// const fetcher = async (url: string): Promise<Project[]> => {
//   // Check memory cache first
//   const cached = memoryCache.get(url)
//   if (cached) {
//     return cached
//   }

//   const response = await axios.get(url)
//   const data = response.data

//   // Cache the result
//   memoryCache.set(url, data, 30000) // 30 seconds

//   return data
// }

// export default function useOptimizedProjects() {
//   const { data, error, isLoading, mutate } = useSWR<Project[]>(
//     "/api/getProjects", 
//     fetcher,
//     {
//       refreshInterval: (data) => {
//         // Only refresh if there are loading projects
//         const hasLoadingProjects = data?.some(p => p.status === "loading")
//         return hasLoadingProjects ? 5000 : 0
//       },
//       revalidateOnFocus: true,
//       revalidateIfStale: false
