import React, { useState } from 'react';
import { Plus, GitBranch, Loader2, AlertCircle, ExternalLink, Calendar, CheckCircle, MoreVertical, Github } from 'lucide-react';

// --- Mock Data and Types ---

// Mocking formatDistanceToNow for standalone execution
const formatDistanceToNow = (date: Date | string) => {
  // In a real app, use date-fns. Here's a simple mock.
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

type ProjectStatus = "ready" | "loading" | "error";

interface Project {
  id: string;
  projectName: string;
  githubUrl: string;
  createdAt: string | Date;
  branchName?: string | null;
  status: ProjectStatus;
}

const mockProjects: Project[] = [
  {
    id: "1",
    projectName: "Frontend Performance Optimization",
    githubUrl: "https://github.com/acme-corp/frontend-v2",
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    branchName: "main",
    status: "ready",
  },
  {
    id: "2",
    projectName: "API Service Migration",
    githubUrl: "https://github.com/acme-corp/api-migration",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    branchName: "feature/new-db-schema",
    status: "loading",
  },
  {
    id: "3",
    projectName: "Legacy System Refactor",
    githubUrl: "https://github.com/acme-corp/legacy-sys",
    createdAt: new Date(Date.now() - 86400000 * 10), // 10 days ago
    branchName: "master",
    status: "error",
  },
    {
    id: "4",
    projectName: "Mobile App Launch Prep",
    githubUrl: "https://github.com/acme-corp/mobile-app",
    createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
    branchName: "release/v1.0",
    status: "ready",
  },
];

// --- UI Primitives (Simulating shadcn/ui) ---

const Button = ({ children, className = '', variant = 'default', size = 'default', disabled = false, onClick }: { children: React.ReactNode, className?: string, variant?: 'default' | 'outline' | 'secondary' | 'ghost', size?: 'default' | 'sm' | 'lg' | 'icon', disabled?: boolean, onClick?: (e: React.MouseEvent) => void }) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variantStyles = {
        default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
        outline: "border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:hover:bg-gray-800 dark:text-gray-100",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-700",
        ghost: "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50",
    };

    const sizeStyles = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        >
            {children}
        </button>
    );
};

// --- Components ---

function StatusBadge({ status }: { status: ProjectStatus }) {
  const statusConfig = {
    ready: {
      label: "Active",
      color: "text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-400",
      dotColor: "bg-green-500",
    },
    loading: {
      label: "Processing",
      color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-400",
      dotColor: "bg-yellow-500",
    },
    error: {
      label: "Failed",
      color: "text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-400",
      dotColor: "bg-red-500",
    }
  }

  const config = statusConfig[status];

  // A clean, pill-shaped badge design with a status dot.
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <span className={`w-2 h-2 mr-2 rounded-full ${config.dotColor} ${status === 'loading' ? 'animate-pulse' : ''}`}></span>
      {config.label}
    </div>
  );
}

const getRepoName = (githubUrl: string) => {
  try {
    // Simple regex to extract owner/repo from GitHub URL
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    return match ? `${match[1]}/${match[2].replace('.git', '')}` : githubUrl;
  } catch {
    return githubUrl;
  }
};

function ProjectCard(project: Project) {
  const repoName = getRepoName(project.githubUrl);

  const handleOpenProject = () => {
    if (project.status === 'ready') {
        console.log(`Navigating to project: ${project.id}`);
        // In a real app: router.push(`/dashboard/${project.id}`);
    }
  };

  const handleViewGithub = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking the link
    console.log(`Opening GitHub: ${project.githubUrl}`);
    // window.open(project.githubUrl, '_blank');
  };

  const handleMoreOptions = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    console.log(`Opening options for project: ${project.id}`);
  };

  // Determine if the card should be clickable
  const isClickable = project.status === 'ready';

  return (
    <div
      // The entire card is the primary CTA when ready (Better UX)
      onClick={handleOpenProject}
      className={`
        group flex flex-col h-full bg-white dark:bg-gray-800 border 
        shadow-sm transition-all duration-300 rounded-xl overflow-hidden
        ${isClickable
          ? 'hover:shadow-lg cursor-pointer border-gray-200 hover:border-blue-400 dark:border-gray-700 dark:hover:border-blue-500'
          : 'cursor-default border-gray-200 dark:border-gray-700'
        }
      `}
    >
      {/* Main Content */}
      <div className="p-5 flex flex-col gap-4 flex-grow">
        
        {/* Header Row: Status and Options */}
        <div className="flex items-center justify-between">
          <StatusBadge status={project.status} />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            onClick={handleMoreOptions}
          >
             <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        {/* Project Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate" title={project.projectName}>
            {project.projectName}
          </h3>
          
          {/* GitHub Link */}
          <div
            className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            onClick={handleViewGithub}
            title={`View ${repoName} on GitHub`}
          >
            <Github className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate font-medium">{repoName}</span>
            <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Loading State Indication (if applicable) */}
        {project.status === 'loading' && (
            <div className='mt-auto pt-2'>
                <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                    {/* Simulating progress */}
                    <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{ width: "45%" }}></div>
                </div>
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>Analyzing repository...</p>
            </div>
        )}

        {/* Error State Indication (if applicable) */}
        {project.status === 'error' && (
            <div className='mt-auto pt-2 flex items-center text-red-600 dark:text-red-400'>
                <AlertCircle className='w-4 h-4 mr-2'/>
                <p className='text-xs'>Processing failed. Click options to retry.</p>
            </div>
        )}

      </div>

      {/* Footer (Metadata) */}
      <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">

          {/* Branch */}
          {project.branchName && (
            <div className="flex items-center min-w-0 max-w-[50%]">
              <GitBranch className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
              <span className="truncate font-mono text-xs" title={project.branchName}>{project.branchName}</span>
            </div>
          )}

          {/* Created At */}
          <div className="flex items-center ml-4 flex-shrink-0">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400 dark:text-gray-500" />
            <span>
              {formatDistanceToNow(project.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Dashboard Page ---

const ProjectsDashboard = () => {
  const [projects] = useState<Project[]>(mockProjects);

  const statusCounts = {
    ready: projects.filter(p => p.status === 'ready').length,
    loading: projects.filter(p => p.status === 'loading').length,
    error: projects.filter(p => p.status === 'error').length,
    total: projects.length
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage and analyze your connected repositories.
            </p>
          </div>
          <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Project
          </Button>
        </div>

        {/* Status Summary Bar */}
        <div className="mb-6 flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 shadow-sm p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
                <span className="font-semibold mr-2">Total Projects:</span> {statusCounts.total}
            </div>
            <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircle className='w-4 h-4 mr-2'/>
                <span className="font-semibold mr-2">Active:</span> {statusCounts.ready}
            </div>
            {statusCounts.loading > 0 && (
                 <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                    <Loader2 className='w-4 h-4 mr-2 animate-spin'/>
                    <span className="font-semibold mr-2">Processing:</span> {statusCounts.loading}
                </div>
            )}
             {statusCounts.error > 0 && (
                 <div className="flex items-center text-red-600 dark:text-red-400">
                    <AlertCircle className='w-4 h-4 mr-2'/>
                    <span className="font-semibold mr-2">Failed:</span> {statusCounts.error}
                </div>
            )}
        </div>


        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
             <Github className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Get started by creating a new project.</p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsDashboard;