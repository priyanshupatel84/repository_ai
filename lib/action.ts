"use server";

import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateEmbedding } from "@/lib/gemini";
import db from "@/lib/db";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// Helper function to generate text without streaming

export const askQuestion = async (question: string, projectId: string) => {
  const stream = createStreamableValue();

  try {
    // Step 2: Generate embedding for understood question
    const queryVector = await generateEmbedding(question).catch((error) => {
      throw new Error(
        `Failed to generate embedding: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    });

    const vectorQuery = `[${queryVector.join(",")}]`;

    // Query database
    const result = (await db.$queryRaw`
        SELECT "fileName", "sourceCode", "summary",
        1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
        FROM "SourceCodeEmbedding"
        WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > .5
        AND "projectId" = ${projectId}
        ORDER BY similarity DESC 
        LIMIT 10`) as {
      fileName: string;
      sourceCode: string;
      summary: string;
    }[];

     if (!result.length) {
    throw new Error("No relevant code files found for your question");
  }

  let context = "";
  for (const doc of result) {
    context += `source:${doc.fileName}\ncode content:${doc.sourceCode}\nsummary : ${doc.summary}\n\n`;
  }

    // Generate AI response function
    (async () => {
    const { textStream } = await streamText({
      model: google("gemini-2.0-flash"),
      prompt: `
You are an AI code assistant who answers questions about the codebase. Your target audience is a technical intern with basic programming knowledge.

AI assistant is a brand new, powerful, human-like artificial intelligence.

The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.

AI is a well-behaved and well-mannered individual.

AI is always friendly, kind, and inspiring, and is eager to provide vivid and thoughtful responses to the user.

AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in software development and programming.

If the question is asking about code or a specific file, AI will provide the detailed answer, giving step by step instructions and explanations with relevant code examples.

START CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK

START QUESTION
${question}
END OF QUESTION

AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.

If the context does not provide the answer to question, the AI assistant will say "I don't have enough information in the provided context to answer this question."

AI assistant will not apologize for previous responses, but instead will indicate when new information was gained.

AI assistant will not invent anything that is not drawn directly from the context.

Answer in markdown syntax, with code snippets if needed. Be as detailed as possible when answering, breaking down complex concepts into clear, understandable explanations.
`,
    });
    for await (const delta of textStream) {
      await stream.update(delta);
    }
    stream.done();
  })();

    return {
      output: stream.value,
      fileReferences: result,
      error: null,
    };

  } catch (error) {
    console.error("Error in askQuestion:", error);

    // Generate error response through AI
    try {
      const { textStream } = streamText({
        model: google("gemini-1.5-flash"),
        prompt: `There was an error processing the request. Please provide a helpful response explaining that there was a technical issue and suggest the user try again or rephrase their question. Keep it friendly and professional.

Original question: ${question}`,
      });

      for await (const delta of textStream) {
        if (delta) {
          stream.update(delta);
        }
      }

      stream.done();

      return {
        output: stream.value,
        fileReferences: [],
        error: "SERVER_ERROR",
      };
    } catch (aiError) {
      console.error("Error generating AI error response:", aiError);
      stream.update(
        "Sorry, there was an error processing your request. Please try again."
      );
      stream.done();

      return {
        output: stream.value,
        fileReferences: [],
        error: "SERVER_ERROR",
      };
    }
  }
};
