// import { pineconeIndex } from "@/lib/pinecone";
// import { embed } from "ai";
// import { google } from "@ai-sdk/google";

// export async function generateEmbedding(text: string) {
//   const { embedding } = await embed({
//     model: google.textEmbeddingModel("genai-embedding-001"),
//     value: text,
//   });
//   return embedding;
// }

// export async function indexCodebase(
//   repoId: string,
//   files: { path: string; content: string }[],
// ) {
//   const vectors: {
//     id: string;
//     values: number[];
//     metadata: { repoId: string; path: string; content: string };
//   }[] = [];

//   for (const file of files) {
//     const content = `File: ${file.path}\n\n${file.content}`;
//     const truncatedContent = content.slice(0, 8000);
//     try {
//       const embedding = await generateEmbedding(truncatedContent);
//       vectors.push({
//         id: `${repoId}-${file.path.replace(/\//g, "-")}`,
//         values: embedding as number[], // ✅ cast to number[]
//         metadata: {
//           repoId,
//           path: file.path,
//           content: truncatedContent,
//         },
//       });
//     } catch (error) {
//       console.error(`Error generating embedding for file ${file.path}:`, error);
//     }
//   }

//   if (vectors.length > 0) {
//     const batchSize = 100;
//     for (let i = 0; i < vectors.length; i += batchSize) {
//       const batch = vectors.slice(i, i + batchSize);
//       await pineconeIndex.upsert({ records: batch }); // ✅ wrap in { records }
//     }
//   }

//   console.log("indexing completed");
// }

// export async function retriveContext(
//   query: string,
//   repoId: string,
//   topK: number = 5,
// ) {
//   const embedding = await generateEmbedding(query);
//   const results = await pineconeIndex.query({
//     vector: embedding as number[], // ✅ cast to number[]
//     filter: { repoId },
//     topK,
//     includeMetadata: true,
//   });
//   return results.matches
//     .map((match) => match.metadata?.content as string)
//     .filter(Boolean);
// }

import { pineconeIndex } from "@/lib/pinecone";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: {
      outputDimensionality: 768,
    },
  });

  if (!result.embeddings || result.embeddings.length === 0) {
    throw new Error("No embeddings returned from Google GenAI");
  }

  return result.embeddings[0].values as number[];
}

// indexCodebase and retriveContext stay exactly the same ✅
export async function indexCodebase(
  repoId: string,
  files: { path: string; content: string }[],
) {
  const vectors: {
    id: string;
    values: number[];
    metadata: { repoId: string; path: string; content: string };
  }[] = [];

  for (const file of files) {
    const content = `File: ${file.path}\n\n${file.content}`;
    const truncatedContent = content.slice(0, 8000);
    try {
      const embedding = await generateEmbedding(truncatedContent);
      vectors.push({
        id: `${repoId}-${file.path.replace(/\//g, "-")}`,
        values: embedding,
        metadata: {
          repoId,
          path: file.path,
          content: truncatedContent,
        },
      });
    } catch (error) {
      console.error(`Error generating embedding for file ${file.path}:`, error);
    }
  }

  if (vectors.length > 0) {
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await pineconeIndex.upsert({ records: batch });
    }
  }

  console.log("indexing completed");
}

export async function retriveContext(
  query: string,
  repoId: string,
  topK: number = 5,
) {
  const embedding = await generateEmbedding(query);
  const results = await pineconeIndex.query({
    vector: embedding,
    filter: { repoId },
    topK,
    includeMetadata: true,
  });
  return results.matches
    .map((match) => match.metadata?.content as string)
    .filter(Boolean);
}
