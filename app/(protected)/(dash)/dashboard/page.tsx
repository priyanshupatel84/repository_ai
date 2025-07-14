"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  GitBranch,
  Loader2,
  AlertCircle,
  ExternalLink,
  Calendar,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import useProjects from "@/hooks/use-project";
import { formatDistanceToNow } from "date-fns";
import { ErrorBoundary } from "@/components/error-boundary";
import GithubLogo from "@/components/ui/github-logo";
import { useSession } from "next-auth/react";


interface Project {
  id: string;
  projectName: string;
  githubUrl: string;
  createdAt: string | Date;
  branchName?: string | null;
  status: "ready" | "loading" | "error";
}

import { useRouter } from "next/navigation";
import { DeleteButton } from "@/components/delete-button";

// Updated Status Badge Component with modern design
function StatusBadge({ status }: { status: Project["status"] }) {
  const statusConfig = {
    ready: {
      label: "Active",
      color:
        "text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-400",
      dotColor: "bg-green-500",
    },
    loading: {
      label: "Processing",
      color:
        "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-400",
      dotColor: "bg-yellow-500",
    },
    error: {
      label: "Failed",
      color: "text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-400",
      dotColor: "bg-red-500",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      <span
        className={`w-2 h-2 mr-2 rounded-full ${config.dotColor} ${
          status === "loading" ? "animate-pulse" : ""
        }`}
      ></span>
      {config.label}
    </div>
  );
}

function ProjectCard(project: Project) {
  const getRepoName = (githubUrl: string) => {
    try {
      const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      return match ? `${match[1]}/${match[2].replace(".git", "")}` : githubUrl;
    } catch {
      return githubUrl;
    }
  };

  const router = useRouter();
  const { setSelectedProjectId } = useProjects();
  const repoName = getRepoName(project.githubUrl);

  const handleOpenProject = () => {
    if (project.status === "ready") {
      setSelectedProjectId(project.id);
      router.push(`/dashboard/${project.id}`);
    }
  };

  const handleViewGithub = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(project.githubUrl, "_blank");
  };



  return (
    <div
      className={`
        group flex flex-col h-full bg-white dark:bg-gray-800 border 
        shadow-sm transition-all duration-300 rounded-xl overflow-hidden
        border-gray-200 hover:shadow-lg dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500
        
      `}
    >
      {/* Main Content */}
      <div className="p-5 flex flex-col gap-4 flex-grow">
        {/* Header Row: Status and Options */}
        <div className="flex items-center justify-between">
          <StatusBadge status={project.status} />

          <div className="w-4 h-3 mr-12">
            <DeleteButton />
          </div>
        </div>

        {/* Project Details */}
        <div>
          <h3
            className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate"
            title={project.projectName}
          >
            {project.projectName}
          </h3>

          {/* GitHub Link */}
          <div
            className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            onClick={handleViewGithub}
            title={`View ${repoName} on GitHub`}
          >
            <GithubLogo className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate font-medium">{repoName}</span>
            <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Loading State Indication */}
        {project.status === "loading" && (
          <div className="mt-auto pt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-1.5 rounded-full animate-pulse"
                style={{ width: "45%" }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Analyzing repository...
            </p>
          </div>
        )}

        {/* Error State Indication */}
        {project.status === "error" && (
          <div className="mt-auto pt-2 flex items-center text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 mr-2" />
            <p className="text-xs">
              Processing failed. Click options to retry.
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-auto pt-2">
          {project.status === "ready" ? (
            <Button
              size="sm"
              className="w-full cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenProject();
              }}
            >
              Open Project
            </Button>
          ) : project.status === "loading" ? (
            <Button disabled size="sm" className="w-full">
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Processing
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="w-full" disabled>
              <AlertCircle className="mr-2 h-3 w-3" />
              Error
            </Button>
          )}
        </div>
      </div>

      {/* Footer (Metadata) */}
      <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          {/* Branch */}
          {project.branchName && (
            <div className="flex items-center min-w-0 max-w-[50%]">
              <GitBranch className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
              <span
                className="truncate font-mono text-xs"
                title={project.branchName}
              >
                {project.branchName}
              </span>
            </div>
          )}

          {/* Created At */}
          <div className="flex items-center ml-4 flex-shrink-0">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400 dark:text-gray-500" />
            <span>
              {formatDistanceToNow(new Date(project.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { allProjects, loadingProjects, errorProjects, isLoading } =
    useProjects();
  const { data: session } = useSession();
  const isDemoUser = session?.user?.isDemoUser;

  // Calculate status counts
  const readyProjects = allProjects.filter((p) => p.status === "ready");
  const statusCounts = {
    ready: readyProjects.length,
    loading: loadingProjects.length,
    error: errorProjects.length,
    total: allProjects.length,
  };

  return (
    <div className="space-y-6">
      {/* Header with Status Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Projects</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-sm text-muted-foreground">
              {isDemoUser
                ? "Explore demo projects with full AI-powered analysis capabilities"
                : "Manage your repository analysis projects"}
            </p>
            {statusCounts.total > 0 && (
              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="font-semibold mr-2">Active:</span>{" "}
                  {statusCounts.ready}
                </div>
                {statusCounts.loading > 0 && (
                  <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="font-semibold mr-2">Processing:</span>{" "}
                    {statusCounts.loading}
                  </div>
                )}
                {statusCounts.error > 0 && (
                  <div className="flex items-center text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span className="font-semibold mr-2">Failed:</span>{" "}
                    {statusCounts.error}
                  </div>
                )}
              </div>
            )}
          </div>
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
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse h-[200px]">
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
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : allProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <GithubLogo className="h-12 w-12 text-muted-foreground mb-4 lucide lucide-github-icon" />
            <h3 className="text-lg font-medium mb-2">
              {isDemoUser ? "Demo Projects Loading" : "No projects yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {isDemoUser
                ? "Demo projects are being set up. Please refresh the page in a moment or run the demo data script."
                : "Create your first project to start analyzing GitHub repositories with AI."}
            </p>
            <Button asChild>
              <Link href="/create">
                <Plus className="mr-2 h-4 w-4" />
                {isDemoUser ? "Create Demo Project" : "Create Project"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      Usually takes 2-5 minutes
                    </p>
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
                    <p className="text-xs text-red-700 dark:text-red-300">
                      Try creating them again
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
