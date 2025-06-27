import { Octokit } from "octokit";
import db from "@/lib/db";
import { aiSummariseCommits } from "./gemini";

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    avatar_url: string;
  } | null;
}

interface CommitResponse {
  commitHashes: Response[];
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
  githubToken?: string
): Promise<CommitResponse> => {
  try {
    const { owner, repo } = parseGitHubUrl(githubUrl);
    const client = new Octokit({ auth: githubToken });
    const perPage = 10;

    const { data } = await client.rest.repos.listCommits({
      owner,
      repo,
      per_page: perPage,
      page: pageNo,
      order: "desc",
    });

    return {
      commitHashes: (data as GitHubCommit[]).map((commit) => ({
        commitHash: commit.sha,
        commitMessage: commit.commit.message,
        commitAuthorName: commit.commit.author.name,
        commitAuthorAvatar: commit.author?.avatar_url ?? "",
        commitDate: commit.commit.author.date,
      })),
    };
  } catch (error) {
    console.error("Error fetching commits:", error);
    throw new Error("Failed to fetch repository commits");
  }
};

export const pollCommits = async (projectId: string, pageNo: number, githubToken?: string) => {
  const { githubUrl } = await fetchProjectGithubUrl(projectId);
  const { commitHashes } = await getCommitHashes(
    githubUrl,
    pageNo,
    githubToken
  );

  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes
  );

  const summaryResponses = await Promise.allSettled(
    unprocessedCommits.map((commit) =>
      summariseCommit(githubUrl, commit.commitHash, githubToken)
    )
  );

  const summaries = summaryResponses.map((response) =>
    response.status === "fulfilled" ? response.value : "Summary unavailable"
  );

  return db.$transaction(async (tx) => {
    return tx.commit.createMany({
      data: unprocessedCommits.map((commit, index) => ({
        projectId,
        commitHash: commit.commitHash,
        commitMessage: commit.commitMessage,
        commitAuthorName: commit.commitAuthorName,
        commitAuthorAvatar: commit.commitAuthorAvatar,
        commitDate: commit.commitDate,
        summary: summaries[index],
      })),
      skipDuplicates: true,
    });
  });
};

async function summariseCommit(githubUrl: string, commitHash: string, githubToken?: string) {
  try {
    const { owner, repo } = parseGitHubUrl(githubUrl);
    const client = new Octokit({ auth: githubToken|| process.env.GITHUB_TOKEN });
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
  const existingHashes = (
    await db.commit.findMany({
      where: { projectId },
      select: { commitHash: true },
    })
  ).map((c) => c.commitHash);

  return commits.filter(
    (commit) => !existingHashes.includes(commit.commitHash)
  );
}
