import { Octokit } from "octokit";
import db from "@/lib/db";  // Changed from "@/server/db" to match old import
import { aiSummariseCommits } from "./gemini";


interface CommitResponse {
  commitHashes: Response[];
  totalCommits?: number;  // Made optional to maintain backward compatibility
}

interface GitHubRepository {
  owner: string;
  repo: string;
}

type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

const parseGitHubUrl = (githubUrl: string): GitHubRepository => {
  const cleanUrl = githubUrl.replace(/\.git$/, "").replace(/\/$/, "");
  let owner: string, repo: string;

  if (cleanUrl.includes("github.com")) {
    const parts = cleanUrl.split("github.com/")[1]?.split("/");
    if (!parts || parts.length < 2) throw new Error("Invalid GitHub URL");
    [owner, repo] = parts;
  } else if (cleanUrl.includes("git@github.com")) {
    const match = cleanUrl.match(/git@github\.com:([^/]+)\/([^/]+)/);
    if (!match) throw new Error("Invalid GitHub SSH URL");
    [, owner, repo] = match;
  } else {
    throw new Error("Unsupported GitHub URL format");
  }

  return { owner, repo };
};

export const getCommitHashes = async (
  githubUrl: string,
  pageNo: number,
  finalGithubToken?: string
): Promise<CommitResponse> => {
  try {
    const { owner, repo } = parseGitHubUrl(githubUrl);
    const client = new Octokit({ auth: finalGithubToken || process.env.GITHUB_TOKEN });
    const perPage = 10;

    // Fetch only the specific page needed
    const { data } = await client.rest.repos.listCommits({
      owner,
      repo,
      per_page: perPage,
      page: pageNo,
      order: "desc",
    });

    return {
      commitHashes: data.map((commit) => ({
        commitHash: commit.sha,
        commitMessage: commit.commit.message,
        commitAuthorName: commit.commit.author?.name ?? "",
        commitAuthorAvatar: commit.author?.avatar_url ?? "",
        commitDate: commit.commit.author?.date ?? "",
      }))
    };
  } catch (error) {
    console.error("Error fetching commits:", error);
    throw new Error("Failed to fetch repository commits");
  }
};

export const pollCommits = async (
  projectId: string, 
  pageNo: number, 
  finalGithubToken?: string
) => {
  try {
    const { githubUrl } = await fetchProjectGithubUrl(projectId);
    
    // Get commits for the specific page only
    const { commitHashes } = await getCommitHashes(
      githubUrl,
      pageNo,
      finalGithubToken
    );

    const unprocessedCommits = await filterUnprocessedCommits(
      projectId,
      commitHashes
    );

    if (unprocessedCommits.length === 0) {
      return; // No new commits to process
    }

    const summaryResponses = await Promise.allSettled(
      unprocessedCommits.map((commit) =>
        summariseCommit(githubUrl, commit.commitHash, finalGithubToken)
      )
    );

    const summaries = summaryResponses.map((response) =>
      response.status === "fulfilled" ? response.value : "Summary unavailable"
    );

    const commitData = unprocessedCommits.map((commit: Response, index: number) => ({
      projectId,
      commitHash: commit.commitHash,
      commitMessage: commit.commitMessage,
      commitAuthorName: commit.commitAuthorName,
      commitAuthorAvatar: commit.commitAuthorAvatar,
      commitDate: commit.commitDate,
      summary: summaries[index],
    }));

    return db.commit.createMany({
      data: commitData,
      skipDuplicates: true,
    });
  } catch (error) {
    console.error(`Failed to poll commits for project ${projectId}:`, error);
    throw error; // Re-throw so API can handle it
  }
};

async function summariseCommit(githubUrl: string, commitHash: string, finalGithubToken?: string) {
  try {
    const { owner, repo } = parseGitHubUrl(githubUrl);
    const client = new Octokit({ auth: finalGithubToken || process.env.GITHUB_TOKEN });
    const { data } = await client.rest.repos.getCommit({
      owner,
      repo,
      ref: commitHash,
    });

    if (!data.files?.length) {
      return "No changes found in this commit";
    }

    const diff = data.files
      .map((file) => `File: ${file.filename}\n${file.patch ?? ""}`)
      .join("\n\n");

    if (!diff) {
      return "No diff content available";
    }

    console.log("generating summary for commit:", commitHash);
    const summary = await aiSummariseCommits(diff);
    return summary || "Unable to generate summary";

  } catch (error) {
    console.error(`Error summarizing commit ${commitHash}:`, error);
    return "Error generating summary";
  }
}

async function fetchProjectGithubUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      githubUrl: true,
    },
  });

  if (!project?.githubUrl) {
    throw new Error("Project GitHub URL not found");
  }

  return { project, githubUrl: project.githubUrl };
}

async function filterUnprocessedCommits(
  projectId: string,
  commits: Response[]
) {
  interface ExistingCommit {
    commitHash: string;
  }

  const existingHashes: string[] = (
    await db.commit.findMany({
      where: { projectId },
      select: { commitHash: true },
    })
  ).map((c: ExistingCommit) => c.commitHash);

  return commits.filter(
    (commit) => !existingHashes.includes(commit.commitHash)
  );
}