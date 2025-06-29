import useSWR from "swr"
import { useLocalStorage } from "usehooks-ts"
import axios from "axios"

interface Project {
  id: string
  projectName: string
  githubUrl: string
  branchName?: string | null
  status: "loading" | "ready" | "error"
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

export default function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<Project[]>("/api/getProjects", fetcher, {
    // refreshInterval: 5000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      // Don't retry on 404
      if (error.status === 404) return

      // Don't retry more than 3 times
      if (retryCount >= 3) return

      // Retry after 5 seconds
      setTimeout(() => revalidate({ retryCount }), 5000)
    },
  })

  const [projectId, setSelectedProjectId] = useLocalStorage("projectId", "")

  // Filter projects by status
  const allProjects = data || []
  const loadingProjects = allProjects.filter((p) => p.status === "loading")
  const readyProjects = allProjects.filter((p) => p.status === "ready")
  const errorProjects = allProjects.filter((p) => p.status === "error")

  // Get current project
  const project = allProjects.find((p) => p.id === projectId)

  // Auto-select first ready project if none selected
  if (!project && readyProjects.length > 0 && !projectId) {
    setSelectedProjectId(readyProjects[0].id)
  }

  return {
    allProjects,
    loadingProjects,
    readyProjects,
    errorProjects,
    project,
    projectId,
    setSelectedProjectId,
    isLoading,
    error,
    mutate,
  }
}
