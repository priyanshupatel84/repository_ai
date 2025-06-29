import { z } from "zod"

// Project validation schemas
export const createProjectSchema = z.object({
  projectName: z.string().min(1, "Project name is required").max(50, "Project name must be less than 50 characters").trim(),
  repoUrl: z
    .string()
    .url("Please enter a valid GitHub URL")
    .refine((url) => url.includes("github.com"), "URL must be a GitHub repository"),
  githubToken: z.string().optional().refine((token) => {
    if (!token) return true; // Optional field
    return token.trim().length >= 20 && (
      token.startsWith('ghp_') || 
      token.startsWith('github_pat_') || 
      token.startsWith('gho_') ||
      token.startsWith('ghu_') ||
      token.startsWith('ghs_') ||
      token.startsWith('ghr_')
    )
  }, "Invalid GitHub token format"),
  branchName: z.string(),
})

// Question validation schema
export const askQuestionSchema = z.object({
  question: z.string().min(1, "Question is required").max(1000, "Question is too long").trim(),
  projectId: z.string().cuid("Invalid project ID"),
})

// Save answer validation schema
export const saveAnswerSchema = z.object({
  projectId: z.string().cuid("Invalid project ID"),
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  filesReferences: z.array(
    z.object({
      fileName: z.string(),
      sourceCode: z.string(),
      summary: z.string(),
    }),
  ),
})

// Environment validation
export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url().optional(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GEMINI_API_KEY: z.string(),
  GITHUB_TOKEN: z.string().optional(),
})

// Validate environment variables
export function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    console.error("❌ Invalid environment variables:", error)
    throw new Error("Invalid environment variables")
  }
}
