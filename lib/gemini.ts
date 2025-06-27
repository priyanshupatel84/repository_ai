import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});
const model1 = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

export const aiSummariseCommits = async (diff: string) => {
  const response = await model.generateContent([
    `You are an expert programmer, and you are trying to summarize a git diff.
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
    A line that starts with \`-\` means that line was added.
    A line that starts with \`-\` nor \`+\` is code given for context and bvetter understanding.
    It is not part of the diff.
    [...]
    EXAMPLE SUMMARY COMMENTS:
    \`\`\`
    * Raised the amount of returned recordings from \`10\` to \`100\` [packages/serer/recordings_api.ts], [packages/server/constants.ts]
    * Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
    * Moved the \`octokit\` initialization to a separate file [src/cotokit.ts], [src/index.ts]
    * Added an OpenAI API for completions [packages/utils/apis/openai.ts]
    * Lowered numeric tolerance for test files
    \`\`\`
    Most commits will have less comments than this examples list.
    The last comment does not include the file names,
    because there were more than two relevant files in the hypothetical commit.
    Do not include parts of the example in your summary.
    It is given only as an example of appropriate comments.`,
    `Please summarise the following diff file: \n\n${diff}`,
  ]);

  return response.response.text();
};


export const summariesCode = async (doc: Document) => {
  try {
    console.log("get the summary for : ", doc.metadata.source);

    const code = doc.pageContent

    const response = await model1.generateContent([
      `You are an intelligent senior software engineer who specializes in onboarding junior software engineers onto projects.
      You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file
    Here is the code:
    ---
    ${code}
    ---
    Give me the summary no more than 1000 words of the above code.`,
    ]);

    return response.response.text();

  } catch (error) {
    console.error("Error in summariesCode:", error);
    throw new Error("Failed to summarize code");
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
