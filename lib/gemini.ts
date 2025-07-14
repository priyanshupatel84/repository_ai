import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

import Groq from "groq-sdk";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // Make sure to set this in your environment
  });

// const model = genAI.getGenerativeModel({
//   model: "gemini-2.0-flash",
// });
// const model1 = genAI.getGenerativeModel({
//   model: "gemini-2.0-flash",
// });

// export const aiSummariseCommits = async (diff: string, retries = 3): Promise<string> => {
//   try {
//     // Truncate diff to avoid exceeding model input limits
//     const truncatedDiff = diff.length > 100000 ? diff.substring(0, 100000) + "\n... (diff truncated)" : diff;

//     const response = await model.generateContent([
//       `You are an expert programmer, and you are trying to summarize a git diff.
//       Reminders about the git diff format:
//       for every file, there are a few metadata lines (for example):
//       \`\`\`
//       diff --git a/lib/index.js b/lib/index.js
//       index aadf691..bfef603 100644
//       --- a/lib/index.js
//       +++ b/lib/index.js
//       \`\`\`
//       This means that \`lib/index.js\` was modified in this commit. Note this that this is only an example.
//       Then there is a specifier of the lines that were modified.
//       A line starting with \`+\` means that line was added.
//       A line that starts with \`-\` means that line was removed.
//       A line that starts with neither \`-\` nor \`+\` is code given for context and better understanding.
//       It is not part of the diff.
//       [...]
//       EXAMPLE SUMMARY COMMENTS:
//       \`\`\`
//       * Raised the amount of returned recordings from \`10\` to \`100\` [packages/server/recordings_api.ts], [packages/server/constants.ts]
//       * Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
//       * Moved the \`octokit\` initialization to a separate file [src/octokit.ts], [src/index.ts]
//       * Added an OpenAI API for completions [packages/utils/apis/openai.ts]
//       * Lowered numeric tolerance for test files
//       \`\`\`
//       Most commits will have less comments than this examples list.
//       The last comment does not include the file names,
//       because there were more than two relevant files in the hypothetical commit.
//       Do not include parts of the example in your summary.
//       It is given only as an example of appropriate comments.`,
//       `Please summarise the following diff file: \n\n${truncatedDiff}`,
//     ]);

//     return response.response.text();
//   } catch (error: unknown) {
//     if (retries > 0) {
//       const errorMessage = (error as Error)?.message?.toLowerCase() || "";
//       if (errorMessage.includes("rate limit") || errorMessage.includes("service unavailable") || errorMessage.includes("503")) {
//         const delay = (4 - retries) * 2000;
//         console.log(`AI summary failed, retrying in ${delay}ms...`);
//         await new Promise((resolve) => setTimeout(resolve, delay));
//         return aiSummariseCommits(diff, retries - 1);
//       }
//     }
//     console.error("Error in aiSummariseCommits after retries:", error);
//     throw error;
//   }
// };

// export const summariesCode = async (doc: Document) => {
//   try {
//     console.log("get the summary for : ", doc.metadata.source);

//     // Intelligent code processing instead of simple truncation
//     const code = doc.pageContent;
//     const maxTokens = 30000; // Gemini 1.5 Flash can handle more content
    
//     let processedCode = code;
//     if (code.length > maxTokens) {
//       // For very large files, prioritize important sections
//       const lines = code.split('\n');
//       const importantSections = [];
      
//       // Keep imports, exports, class/function definitions, and comments
//       for (let i = 0; i < lines.length; i++) {
//         const line = lines[i].trim();
//         if (
//           line.startsWith('import ') ||
//           line.startsWith('export ') ||
//           line.startsWith('class ') ||
//           line.startsWith('function ') ||
//           line.startsWith('const ') ||
//           line.startsWith('let ') ||
//           line.startsWith('var ') ||
//           line.startsWith('interface ') ||
//           line.startsWith('type ') ||
//           line.startsWith('//') ||
//           line.startsWith('/*') ||
//           line.startsWith('*') ||
//           line.includes('async ') ||
//           line.includes('=>')
//         ) {
//           importantSections.push(lines[i]);
//         }
//       }
      
//       // If still too long, take first portion + important sections
//       const combinedContent = importantSections.join('\n');
//       if (combinedContent.length > maxTokens) {
//         processedCode = code.substring(0, maxTokens * 0.7) + '\n\n// ... (file continues with more implementation details)\n\n' + combinedContent.substring(0, maxTokens * 0.3);
//       } else {
//         processedCode = combinedContent;
//       }
//     }

//     const response = await model1.generateContent([
//       `You are an intelligent senior software engineer who specializes in onboarding junior software engineers onto projects.
//       You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file.
      
//       Here is the code:
//       ---
//       ${processedCode}
//       ---
      
//       Provide a comprehensive summary (no more than 1000 words) that covers:
//       - Main purpose and functionality of this file
//       - Key components, functions, and classes
//       - How it fits into the larger application architecture
//       - Important implementation details
//       - Dependencies and interactions with other parts of the system
      
//       Focus on helping a junior developer understand what this code does and why it's structured this way.`,
//     ]);

//     return response.response.text();
//   } catch (error) {
//     console.error("Error in summariesCode:", error);
//     throw new Error("Failed to summarize code");
//   }
// };


export const aiSummariseCommits = async (diff: string, retries = 3): Promise<string> => {
  try {
    // Truncate diff to avoid exceeding model input limits
    // Llama models can handle good context, but let's be conservative
    const truncatedDiff = diff.length > 80000 ? diff.substring(0, 80000) + "\n... (diff truncated)" : diff;

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert programmer, and you are trying to summarize a git diff.
          Reminders about the git diff format:
          for every file, there are a few metadata lines (for example):
          \`\`\`
          diff --git a/lib/index.js b/lib/index.js
          index aadf691..bfef603 100644
          --- a/lib/index.js
          +++ b/lib/index.js
          \`\`\`
          This means that \`lib/index.js\` was modified in this commit. Note this that this is only an example.
          Then there is a specifier of the lines that were modified.
          A line starting with \`+\` means that line was added.
          A line that starts with \`-\` means that line was removed.
          A line that starts with neither \`-\` nor \`+\` is code given for context and better understanding.
          It is not part of the diff.
          [...]
          EXAMPLE SUMMARY COMMENTS:
          \`\`\`
          * Raised the amount of returned recordings from \`10\` to \`100\` [packages/server/recordings_api.ts], [packages/server/constants.ts]
          * Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
          * Moved the \`octokit\` initialization to a separate file [src/octokit.ts], [src/index.ts]
          * Added an OpenAI API for completions [packages/utils/apis/openai.ts]
          * Lowered numeric tolerance for test files
          \`\`\`
          Most commits will have less comments than this examples list.
          The last comment does not include the file names,
          because there were more than two relevant files in the hypothetical commit.
          Do not include parts of the example in your summary.
          It is given only as an example of appropriate comments.`
        },
        {
          role: "user",
          content: `Please summarise the following diff file: \n\n${truncatedDiff}`
        }
      ],
      model: "llama-3.3-70b-versatile", // You can also use "llama-3.1-405b-reasoning" for more complex analysis
      temperature: 0.3, // Lower temperature for more focused, consistent summaries
      max_tokens: 1000, // Reasonable limit for commit summaries
      top_p: 0.9,
      stream: false
    });

    const summary = response.choices[0]?.message?.content;
    if (!summary) {
      throw new Error("No summary generated from Groq API");
    }

    return summary;
  } catch (error: unknown) {
    if (retries > 0) {
      const errorMessage = (error as Error)?.message?.toLowerCase() || "";
      
      // Handle Groq-specific rate limiting and errors
      if (
        errorMessage.includes("rate limit") || 
        errorMessage.includes("service unavailable") || 
        errorMessage.includes("503") ||
        errorMessage.includes("429") ||
        errorMessage.includes("quota")
      ) {
        const delay = (4 - retries) * 2000;
        console.log(`AI summary failed, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return aiSummariseCommits(diff, retries - 1);
      }
    }
    console.error("Error in aiSummariseCommits after retries:", error);
    throw error;
  }
};

export const generateEmbedding = async (summary: string) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "text-embedding-004",
    });

    const result = await model.embedContent(summary);
    const embedding = result.embedding;
    return embedding.values;
  } catch (error) {
    console.error("Error in generateEmbedding:", error);
    throw new Error("Failed to generate embedding");
  }
};

// Initialize Groq client
export const summariesCode = async (doc: Document) => {
  try {
    console.log("get the groq summary for : ", doc.metadata.source);

    // Intelligent code processing instead of simple truncation
    const code = doc.pageContent;
    const maxTokens = 25000; // Llama models have good context length, but let's be conservative
    
    let processedCode = code;
    if (code.length > maxTokens) {
      // For very large files, prioritize important sections
      const lines = code.split('\n');
      const importantSections = [];
      
      // Keep imports, exports, class/function definitions, and comments
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (
          line.startsWith('import ') ||
          line.startsWith('export ') ||
          line.startsWith('class ') ||
          line.startsWith('function ') ||
          line.startsWith('const ') ||
          line.startsWith('let ') ||
          line.startsWith('var ') ||
          line.startsWith('interface ') ||
          line.startsWith('type ') ||
          line.startsWith('//') ||
          line.startsWith('/*') ||
          line.startsWith('*') ||
          line.includes('async ') ||
          line.includes('=>')
        ) {
          importantSections.push(lines[i]);
        }
      }
      
      // If still too long, take first portion + important sections
      const combinedContent = importantSections.join('\n');
      if (combinedContent.length > maxTokens) {
        processedCode = code.substring(0, maxTokens * 0.7) + '\n\n// ... (file continues with more implementation details)\n\n' + combinedContent.substring(0, maxTokens * 0.3);
      } else {
        processedCode = combinedContent;
      }
    }

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an intelligent senior software engineer who specializes in onboarding junior software engineers onto projects. You provide clear, comprehensive explanations of code structure and functionality."
        },
        {
          role: "user",
          content: `You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file.
          
          Here is the code:
          ---
          ${processedCode}
          ---
          
          Provide a comprehensive summary (no more than 1000 words) that covers:
          - Main purpose and functionality of this file
          - Key components, functions, and classes
          - How it fits into the larger application architecture
          - Important implementation details
          - Dependencies and interactions with other parts of the system
          
          Focus on helping a junior developer understand what this code does and why it's structured this way.`
        }
      ],
      model: "llama-3.3-70b-versatile", // You can also use "llama-3.1-405b-reasoning" for more complex analysis
      temperature: 0.3,
      max_tokens: 1500,
      top_p: 0.9,
      stream: false
    });

    return response.choices[0]?.message?.content || "Unable to generate summary";
  } catch (error) {
    console.error("Error in summariesCode:", error);
    throw new Error("Failed to summarize code");
  }
};