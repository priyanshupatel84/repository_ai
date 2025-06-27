import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github"
import type { Document } from "@langchain/core/documents"
import { generateEmbedding, summariesCode } from "./gemini"
import db from "@/lib/db"
import { Octokit } from "octokit"

// const octokit = new Octokit({
//   auth: process.env.GITHUB_TOKEN,
// })

// Enhanced GitHub URL parser with better validation
const parseGitHubUrl = (url: string) => {
  try {
    const cleanedUrl = url.replace(/\.git$/, "").replace(/\/$/, "")

    // Handle both HTTPS and SSH URLs
    let match
    if (cleanedUrl.includes("github.com/")) {
      match = cleanedUrl.match(/github\.com[/:]([^/]+)\/([^/#?]+)/)
    } else {
      throw new Error("Invalid GitHub URL format")
    }

    if (!match) throw new Error("Invalid GitHub URL format")

    const owner = match[1]
    const repo = match[2].split("/tree/")[0] // Remove tree/branch part if present

    // Validate owner and repo names
    if (!owner || !repo || owner.length === 0 || repo.length === 0) {
      throw new Error("Invalid repository owner or name")
    }

    return { owner, repo }
  } catch (error) {
    console.error("Error parsing GitHub URL:", error)
    throw new Error("Invalid GitHub URL format. Please use: https://github.com/username/repository")
  }
}

// Enhanced repository loader with better error handling
export const loadGithubRepo = async (githubUrl: string, githubToken?: string, branchName?: string) => {
  try {
    const { owner, repo } = parseGitHubUrl(githubUrl)
    console.log("Loading repository:", { owner, repo, branch: branchName })
    // Create Octokit instance with provided token or default
    const client = new Octokit({ auth: githubToken })

    // Verify repository exists and get default branch if needed
    try {
      const { data } = await client.rest.repos.get({ owner, repo })

      // If no branch specified, use default branch
      if (!branchName) {
        branchName = data.default_branch
        console.log("Using default branch:", branchName)
      }
      
    } catch (repoError: any) {
      if (repoError.status === 404) {
        throw new Error(
          "Repository not found. Please check the URL and ensure the repository exists and is accessible.",
        )
      } else if (repoError.status === 403) {
        throw new Error("Access denied. The repository may be private or require authentication.")
      } else {
        throw new Error(`Failed to access repository: ${repoError.message}`)
      }
    }

    // Verify branch exists
    if (branchName) {
      try {
        await client.rest.repos.getBranch({ owner, repo, branch: branchName })
      } catch (branchError: any) {
        if (branchError.status === 404) {
          throw new Error(`Branch '${branchName}' not found. Available branches can be checked on the repository page.`)
        }
        console.warn("Branch verification failed, proceeding anyway:", branchError.message)
      }
    }

    // Load repository with enhanced configuration
    const loader = new GithubRepoLoader(`https://github.com/${owner}/${repo}`, {
      accessToken: githubToken || process.env.GITHUB_TOKEN || "",
      branch: branchName,
      ignoreFiles: [
        "package-lock.json",
        "yarn.lock",
        "pnpm-lock.json",
        "bun.lockb",
        "node_modules",
        ".git",
        ".gitignore",
        "*.log",
        "*.tmp",
        "*.cache",
        "dist",
        "build",
        ".next",
        "coverage",
        ".nyc_output",
        "*.min.js",
        "*.min.css",
        "LICENSE",
        
      ],
      recursive: true,
      processSubmodules: false, // Disable submodules for better performance
      unknown: "warn",
      maxConcurrency: 3, // Reduced for better rate limiting
    })

    const docs = await loader.load()

    if (!docs || docs.length === 0) {
      throw new Error("No files found in the repository or all files were filtered out.")
    }
    console.log(`Successfully loaded ${docs.length} files from repository`)

    return docs

  } catch (error) {
    console.error("Error loading GitHub repo:", error)

    if (error instanceof Error) {
      throw error // Re-throw with original message
    }

    throw new Error(`Failed to load GitHub repository: ${githubUrl}`)
  }
}

// Enhanced indexing with better error handling and progress tracking
export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
  branchName?: string,
) => {
  try {
    console.log("Starting repository indexing:", { projectId, githubUrl, branchName })

    // Load repository documents
    const docs = await loadGithubRepo(githubUrl, githubToken, branchName)

    if (!docs || docs.length === 0) {
      throw new Error("No documents loaded from repository")
    }

    console.log(`Processing ${docs.length} documents for embeddings`)

    // Generate embeddings with enhanced error handling
    const allEmbeddings = await generateEmbeddings(docs)

    if (!allEmbeddings || allEmbeddings.length === 0) {
      throw new Error("No embeddings generated from documents")
    }

    console.log(`Generated ${allEmbeddings.length} embeddings, saving to database`)

    // Save embeddings to database with transaction
    let savedCount = 0
    for (const [index, embedding] of allEmbeddings.entries()) {
      if (!embedding || !embedding.embedding) {
        console.warn(`Skipping embedding ${index} - invalid data`)
        continue
      }

      try {
        const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
          data: {
            summary: embedding.summary || "No summary available",
            sourceCode: embedding.sourceCode || "",
            fileName: embedding.fileName || `file_${index}`,
            projectId,
          },
        })

        // Update with vector embedding
        await db.$executeRaw`
          UPDATE "SourceCodeEmbedding"
          SET "summaryEmbedding" = ${embedding.embedding}::vector
          WHERE "id" = ${sourceCodeEmbedding.id}
        `
        savedCount++

        // Add delay every 5 items to prevent rate limiting
        if (index % 5 === 0 && index > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      } catch (dbError) {
        console.error(`Error saving embedding ${index}:`, dbError)
        // Continue with other embeddings instead of failing completely
      }
    }

    console.log(`Successfully indexed ${savedCount} files for project ${projectId}`)

    if (savedCount === 0) {
      throw new Error("No files were successfully indexed")
    }

    return { success: true, indexedFiles: savedCount }

  } catch (error) {
    console.error("Error indexing GitHub repo:", error)
    throw error
  }
}

// Enhanced embedding generation with retry logic and rate limiting
const generateEmbeddings = async (docs: Document[]) => {
  const results = []
  let retryCount = 0
  const MAX_RETRIES = 3
  const BASE_DELAY = 2000
  const MAX_FILE_SIZE = 10000

  console.log(`Starting embedding generation for ${docs.length} documents`)

  for (let i = 0; i < docs.length; i++) {
    try {
      const doc = docs[i]

      // Skip very large files
      if (doc.pageContent.length > MAX_FILE_SIZE) {
        console.log(`Skipping large file: ${doc.metadata.source} (${doc.pageContent.length} chars)`)
        continue
      }

      // Skip binary or non-text files
      if (isBinaryFile(doc.metadata.source || "")) {
        console.log(`Skipping binary file: ${doc.metadata.source}`)
        continue
      }

      console.log(`Processing file ${i + 1}/${docs.length}: ${doc.metadata.source}`)

      const summary = await rateLimitedSummariesCode(doc)
      const embedding = await rateLimitedGenerateEmbedding(summary)

      results.push({
        summary,
        embedding,
        sourceCode: doc.pageContent,
        fileName: doc.metadata.source || `unknown_file_${i}`,
      })

      retryCount = 0 // Reset retry counter on success

      // Add delay between successful operations
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`Error processing document ${i}:`, error)

      if (retryCount < MAX_RETRIES) {
        retryCount++
        i-- // Retry same document
        const delay = BASE_DELAY * Math.pow(2, retryCount)
        console.log(`Retrying in ${delay}ms (attempt ${retryCount}/${MAX_RETRIES})`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        console.error(`Skipping document after ${MAX_RETRIES} failures:`, docs[i]?.metadata?.source)
        retryCount = 0
      }
    }
  }

  console.log(`Generated ${results.length} embeddings from ${docs.length} documents`)
  return results
}

// Helper function to detect binary files
const isBinaryFile = (filename: string): boolean => {
  const binaryExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".svg",
    ".ico",
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".zip",
    ".tar",
    ".gz",
    ".rar",
    ".7z",
    ".exe",
    ".dll",
    ".so",
    ".dylib",
    ".mp3",
    ".mp4",
    ".avi",
    ".mov",
    ".wav",
    ".ttf",
    ".otf",
    ".woff",
    ".woff2",
    ".bin",
    ".dat",
    ".db",
  ]

  const ext = filename.toLowerCase().split(".").pop()
  return ext ? binaryExtensions.includes(`.${ext}`) : false
}

// Enhanced rate-limited API calls with exponential backoff
const rateLimitedSummariesCode = async (doc: Document, retries = 3): Promise<string> => {
  try {
    return await summariesCode(doc)
  } catch (error: any) {
    if (retries > 0 && (error.status === 429 || error.message?.includes("rate limit"))) {
      const delay = (4 - retries) * 2000 // Exponential backoff
      console.log(`Rate limited, retrying in ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return rateLimitedSummariesCode(doc, retries - 1)
    }
    throw error
  }
}

const rateLimitedGenerateEmbedding = async (summary: string, retries = 3): Promise<number[]> => {
  try {
    return await generateEmbedding(summary)
  } catch (error: any) {
    if (retries > 0 && (error.status === 429 || error.message?.includes("rate limit"))) {
      const delay = (4 - retries) * 2000 // Exponential backoff
      console.log(`Rate limited, retrying in ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return rateLimitedGenerateEmbedding(summary, retries - 1)
    }
    throw error
  }
}
