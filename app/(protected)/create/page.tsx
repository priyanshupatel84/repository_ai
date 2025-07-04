"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import useProjects from "@/hooks/use-project";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  Info,
  ExternalLink,
  LayoutDashboard,
  ArrowLeft,
} from "lucide-react";
import * as z from "zod";
import { useSession } from "next-auth/react";
import { SignOut } from "@/components/sign-out";
import { UserAvatar } from "@/components/userAvatar";
import GithubLogo from "@/components/ui/github-logo";
import { ThemeToggle } from "@/components/theme-toggle";

const formSchema = z.object({
  projectName: z
    .string()
    .min(1, "Project name is required")
    .max(50, "Project name must be less than 50 characters"),
  repoUrl: z
    .string()
    .url("Please enter a valid GitHub URL")
    .refine(
      (url) => url.includes("github.com"),
      "URL must be a GitHub repository"
    ),
  githubToken: z.string().optional(),
  branchName: z.string().optional(),
});

type FormInput = z.infer<typeof formSchema>;

const CreatePage = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      repoUrl: "",
      githubToken: "",
      branchName: "",
    },
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [showLargeRepoDialog, setShowLargeRepoDialog] = useState(false);

  const router = useRouter();
  const { mutate } = useProjects();
  const { data: session } = useSession();

  const watchedValues = watch();

  const onSubmit = async (data: FormInput) => {
    const sessionGithubToken = session?.user?.githubAccessToken;

    // Clean and validate the token
    const providedToken = data.githubToken?.trim();
    const finalToken = providedToken || sessionGithubToken;

    setIsProcessing(true);

    try {
      const res = await axios.post("/api/createProject", {
        projectName: data.projectName.trim(),
        repoUrl: data.repoUrl.trim(),
        githubToken: finalToken,
        branchName: data.branchName?.trim() || "main",
      });

      if (res.status === 200) {
        await mutate();
        toast.success("Project created successfully!");
        router.push(`/dashboard`);
      }
    } catch (error) {
      console.error("Error creating project:", error);

      // Robust 413 error handling for all Axios error shapes
      let isLargeRepoError = false;
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.error || error.message || "Failed to create project";
        const statusText = error.response?.statusText || "";
        const code = error.code;

        // Check for 413 by status, statusText, code, or error message
        if (status === 413 ||
            statusText.toLowerCase().includes("payload too large") ||
            (code === "ERR_BAD_REQUEST" && (errorMessage.includes("413") || statusText.includes("413"))) ||
            errorMessage.toLowerCase().includes("payload too large") ||
            errorMessage.toLowerCase().includes("repository is too large") ||
            errorMessage.toLowerCase().includes("more than 50 files")
        ) {
          isLargeRepoError = true;
        }

        if (isLargeRepoError) {
          setShowLargeRepoDialog(true);
        } else if (status === 429) {
          setShowTokenDialog(true);
        } else if (
          errorMessage.toLowerCase().includes("github api rate limit hit") ||
          errorMessage.toLowerCase().includes("rate limit")
        ) {
          // Additional rate limit check based on error message
          setShowTokenDialog(true);
        } else {
          // Other errors - show toast
          toast.error(errorMessage);
        }
      } else {
        // Non-axios errors
        toast.error("Failed to create project");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    reset();
    setIsProcessing(false);
  };

  const handleDashboardClick = () => {
    if (!isProcessing) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="flex items-center justify-between h-14 px-6">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="w-px h-4 bg-border"></div>
            <GithubLogo className="h-4 w-4 " />
            <span className="font-medium text-sm">Repository AI</span>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDashboardClick}
              disabled={isProcessing}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <ThemeToggle />

            <UserAvatar className="h-2 w-2" />

            <div className="flex justify-center">
              <SignOut />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium mb-2">Create New Project</h1>
          <p className="text-sm text-muted-foreground">
            Add a GitHub repository to analyze with AI
          </p>
        </div>

        {/* Main Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Repository Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Processing Status UI removed as requested */}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
              {/* Large Repo Dialog */}
              <Dialog
                open={showLargeRepoDialog}
                onOpenChange={setShowLargeRepoDialog}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <span>Repository Too Large</span>
                    </DialogTitle>
                    <DialogDescription>
                      This repository has more than 50 files. Please select a
                      smaller repository.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowLargeRepoDialog(false)}
                    >
                      Close
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Project Name */}
                <div className="space-y-2">
                  <Label htmlFor="projectName">
                    Project Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="projectName"
                    {...register("projectName")}
                    placeholder="My Project"
                    disabled={isProcessing}
                    className={
                      errors.projectName
                        ? "border-red-500 text-gray-900 dark:text-white"
                        : "text-gray-900 dark:text-white"
                    }
                  />
                  {errors.projectName && (
                    <p className="text-sm text-red-500">
                      {errors.projectName.message}
                    </p>
                  )}
                </div>

                {/* Branch Name */}
                <div className="space-y-2">
                  <Label htmlFor="branchName">Branch Name</Label>
                  <Input
                    id="branchName"
                    {...register("branchName")}
                    placeholder="main"
                    disabled={isProcessing}
                    className="text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Repository URL */}
              <div className="space-y-2">
                <Label htmlFor="repoUrl">
                  GitHub Repository URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="repoUrl"
                  {...register("repoUrl")}
                  placeholder="https://github.com/username/repository"
                  disabled={isProcessing}
                  className={
                    errors.repoUrl
                      ? "border-red-500 text-gray-900 dark:text-white"
                      : "text-gray-900 dark:text-white"
                  }
                />
                {errors.repoUrl && (
                  <p className="text-sm text-red-500">
                    {errors.repoUrl.message}
                  </p>
                )}
              </div>

              {/* GitHub Token */}
              <div className="space-y-2">
                <Label htmlFor="githubToken">GitHub Token (Optional)</Label>
                <Input
                  id="githubToken"
                  {...register("githubToken")}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  type="password"
                  disabled={isProcessing}
                  className="text-gray-900 dark:text-white"
                />
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="flex items-start space-x-2">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700">
                      <span className="font-medium">Recommended:</span> Avoids
                      rate limits and enables private repos.{" "}
                      <a
                        href="https://github.com/settings/tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:underline"
                      >
                        Create token
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  disabled={
                    isProcessing ||
                    !watchedValues.projectName ||
                    !watchedValues.repoUrl
                  }
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Create Project"
                  )}
                </Button>

                {!isProcessing && (
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                )}
              </div>
            </form>

            {/* Help Text */}
            <div className="text-center pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Processing takes 2-5 minutes • Your data is processed securely
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showLargeRepoDialog} onOpenChange={setShowLargeRepoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span>Repository Too Large</span>
            </DialogTitle>
            <DialogDescription>
              This repository contains more than 50 files and cannot be
              processed. Our AI analysis is optimized for smaller repositories
              to ensure quality and performance.
            </DialogDescription>
          </DialogHeader>

          {/* Move the complex content outside DialogDescription */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
            <p className="text-sm font-medium text-yellow-800 mb-2">
              Suggestions:
            </p>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>
                Try a smaller repository or a specific branch with fewer files
              </li>
              <li>
                Consider creating a separate repository with just the core files
              </li>
              <li>Use a fork with only the essential components</li>
            </ul>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setShowLargeRepoDialog(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Rate Limit Dialog */}
      <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span>Rate Limit Reached</span>
            </DialogTitle>
            <DialogDescription>
              GitHub API rate limit reached. Please provide a GitHub Personal
              Access Token to continue.
            </DialogDescription>
          </DialogHeader>

          {/* Move the complex content outside DialogDescription */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
            <p className="text-sm font-medium text-yellow-800 mb-2">
              Quick setup:
            </p>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Go to GitHub Settings → Developer settings</li>
              <li>Create new Personal Access Token</li>
              <li>Select &apos;repo&apos; permissions</li>
              <li>Copy token to the form above</li>
            </ol>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowTokenDialog(false)}>
              Cancel
            </Button>
            <Button asChild>
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
              >
                Create Token
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreatePage;
