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
async function generateText(model: any, prompt: string): Promise<string> {
  const { textStream } = streamText({ model, prompt });
  let result = '';
  for await (const delta of textStream) {
    result += delta;
  }
  return result;
}

export const askQuestion = async (question: string, projectId: string) => {
  const stream = createStreamableValue();

  try {
    // Step 1: Understand/rewrite question using AI
    const understoodQuestion = await generateText(
      google("gemini-2.0-flash"),
      `Rewrite the following question to be more effective for code retrieval. 
      Preserve technical terms while removing conversational fluff. Output ONLY the rewritten question.
      
      Original Question: ${question}
      Rewritten Question:`
    ).catch(error => {
      console.error("Question rewrite failed, using original:", error);
      return question; // Fallback to original
    });

    // Step 2: Generate embedding for understood question
    const queryVector = await generateEmbedding(understoodQuestion).catch((error) => {
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

    // Generate AI response function
    const generateResponse = async (hasContext: boolean, context?: string) => {
      try {
        const prompt = hasContext
          ? `You are an AI code assistant who answers questions about the codebase. Your target audience is a technical intern with basic programming knowledge.

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

Answer in markdown syntax, with code snippets if needed. Be as detailed as possible when answering, breaking down complex concepts into clear, understandable explanations.`
          : `You are a helpful AI assistant with expertise in software development and programming. 
Answer the following question to the best of your ability. Provide clear, informative responses with examples when appropriate.
Use markdown formatting for better readability.

Question: ${question}`;

        const { textStream } = streamText({
          model: google("gemini-2.0-flash"),
          prompt,
        });

        for await (const delta of textStream) {
          if (delta) {
            stream.update(delta);
          }
        }
      } finally {
        stream.done();
      }
    };

    if (!result.length) {
      await generateResponse(false);
      return {
        output: stream.value,
        fileReferences: [],
        error: "NO_RELEVANT_FILES",
      };
    }

    // Build context from relevant files
    let context = "";
    for (const doc of result) {
      context += `source:${doc.fileName}\ncode content:${doc.sourceCode}\nsummary : ${doc.summary}\n\n`;
    }

    await generateResponse(true, context);
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
        model: google("gemini-2.0-flash"),
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
