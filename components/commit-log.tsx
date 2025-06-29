"use client";
import React, { useEffect, useState } from "react";
import { PaginationPage } from "./pagination";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import useProjects from "@/hooks/use-project";
import { useSession } from "next-auth/react";

interface Commit {
  id: string;
  commitAuthorAvatar: string;
  commitAuthorName: string;
  commitMessage: string;
  summary: string;
  commitHash: string;
  commitDate: string;
}

interface ApiResponse {
  commits: Commit[];
  totalCommits: number;
  totalPages: number;
  currentPage: number;
}

const CommitLog = () => {
  const [pageNo, setPageNo] = useState(1);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCommits, setTotalCommits] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { projectId } = useProjects();
  const { data: session } = useSession();

  const githubToken = session?.user?.githubAccessToken;

  useEffect(() => {
    const fetchCommits = async () => {
      if (!projectId) return;

      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.post<ApiResponse>("/api/getCommits", {
          projectId,
          pageNo,
          githubToken: githubToken,
        });

        setCommits(response.data.commits);
        setTotalPages(response.data.totalPages);
        setTotalCommits(response.data.totalCommits);
      } catch (error) {
        console.error("Failed to fetch commits:", error);
        setError("Failed to load commits. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommits();
  }, [projectId, pageNo, githubToken]);

  return (
    <>
      {error && (
        <div className="flex h-64 items-center justify-center">
          <p className="text-red-500 font-semibold">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 font-semibold">Fetching Commits...</p>
            <p className="text-sm text-gray-400 mt-2">
              Page {pageNo} of {totalPages || '?'}
            </p>
          </div>
        </div>
      )}

      {!isLoading && !error && commits.length === 0 && (
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-500 font-semibold">No commits found</p>
        </div>
      )}

      {!isLoading && !error && commits.length > 0 && (
        <>
          <div className="mb-4 text-sm text-gray-500">
            Showing {commits.length} of {totalCommits} commits (Page {pageNo} of {totalPages})
          </div>
          
          <ul className="space-y-6">
            {commits.map((commit) => (
              <li key={commit.id} className="relative flex gap-x-4">
                <div className="flex-none w-10">
                  <img
                    src={commit.commitAuthorAvatar}
                    alt={commit.commitAuthorName}
                    className="h-10 w-10 rounded-full bg-gray-100"
                  />
                </div>
                <div className="flex-auto">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-semibold">
                      {commit.commitAuthorName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(commit.commitDate).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="mt-1 text-sm font-semibold">
                    {commit.commitMessage}
                  </p>
                  {commit.summary && (
                    <p className="mt-2 text-sm text-gray-600">
                      {commit.summary}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400 font-mono">
                    {commit.commitHash.substring(0, 8)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <Separator className="mt-6 h-1" />
          <div className="mt-8">
            <PaginationPage
              page={pageNo}
              setPage={setPageNo}
              totalPages={totalPages}
            />
          </div>
        </>
      )}
    </>
  );
};

export default CommitLog;