"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plus, GitBranch, Loader2, AlertCircle, ExternalLink, Calendar } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import useProjects from "@/hooks/use-project"
import { formatDistanceToNow } from "date-fns"
import { ErrorBoundary } from "@/components/error-boundary"
import GithubLogo from "@/components/ui/github-logo"



interface Project {
  id: string
  projectName: string
  githubUrl: string
  createdAt: string | Date
  branchName?: string | null
  status: "ready" | "loading" | "error"
}

import { useRouter } from "next/navigation"
function ProjectCard(project : Project) {
  const getRepoName = (githubUrl: string) => {
    try {
      const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
      return match ? `${match[1]}/${match[2]}` : githubUrl
    } catch {
      return githubUrl
    }
  }
  const router = useRouter();
  const { setSelectedProjectId } = useProjects()

  const handleOpenProject = (selectedProjectId: string) => {
    setSelectedProjectId(selectedProjectId);
    router.push(`/dashboard/${selectedProjectId}`);
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-medium truncate">{project.projectName}</CardTitle>

            <div className="flex items-center text-sm text-muted-foreground mt-1 min-w-0 w-full">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full flex-shrink-0 h-8"
                style={{ width: "100%" }}
              >
                <Link
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span className="w-auto truncate text-xs">{getRepoName(project.githubUrl)}</span>
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Processing Progress */}
        {project.status === "loading" && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Processing...</span>
              <span>~3 min</span>
            </div>
            <Progress value={65} className="h-1" />
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center min-w-0">
            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">
              {formatDistanceToNow(new Date(project.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          {project.branchName && (
            <div className="flex items-center min-w-0 ml-2">
              <GitBranch className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate max-w-16">{project.branchName}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {project.status === "ready" ? (
            <Button asChild size="sm" className="flex-1 cursor-pointer" onClick={() => handleOpenProject(project.id)}>
              <span>Open Project</span>
            </Button>
          ) : project.status === "loading" ? (
            <Button disabled size="sm" className="flex-1 cursor-pointer">
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Processing
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="flex-1 cursor-pointer" disabled>
              <AlertCircle className="mr-2 h-3 w-3" />
              Error
            </Button>
          )}
        </div>


      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const { allProjects, loadingProjects, errorProjects, isLoading } = useProjects()

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your repository analysis projects</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/create">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-3 bg-muted rounded"></div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="h-8 bg-muted rounded flex-1"></div>
                  <div className="h-8 bg-muted rounded w-full sm:w-10"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : allProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <GithubLogo className="h-12 w-12 text-muted-foreground mb-4 lucide lucide-github-icon" />
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Create your first project to start analyzing GitHub repositories with AI.
            </p>
            <Button asChild>
              <Link href="/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allProjects.map((project) => (
              <ErrorBoundary key={project.id}>
                <ProjectCard {...project} />
              </ErrorBoundary>
            ))}
          </div>

          {/* Status Messages */}
          {loadingProjects.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
              <CardContent className="pt-4">
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 text-yellow-600 animate-spin mr-3" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      {loadingProjects.length} project
                      {loadingProjects.length > 1 ? "s" : ""} processing
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">Usually takes 2-5 minutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {errorProjects.length > 0 && (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <CardContent className="pt-4">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      {errorProjects.length} project
                      {errorProjects.length > 1 ? "s" : ""} failed
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300">Try creating them again</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
