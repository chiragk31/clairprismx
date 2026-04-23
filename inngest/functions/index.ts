// src/inngest/functions.ts
import { getRepoFileContents } from "@/module/github/lib/github";
import { inngest } from "../client";
import prisma from "@/lib/db";
import { indexCodebase } from "@/module/ai/lib/rag";

export const indexRepo = inngest.createFunction(
  { id: "index-repo" },
  { event: "repository.connected" },

  async ({ event, step }) => {
    const { owner, repo, userId } = event.data;

    //files
    const files = await step.run("fetch-files", async () => {
      const account = await prisma.account.findFirst({
        where: {
          userId: userId,
          providerId: "github",
        },
      });
      if (!account) {
        throw new Error("GitHub account not found for user");
      }
      if (!account.accessToken) {
        throw new Error("GitHub access token not found");
      }
      return await getRepoFileContents(account.accessToken, owner, repo);
    });

    await step.run("index-codebase", async () => {
      await indexCodebase(`${owner}/${repo}`, files);
    });
    return { success: true, indexedFiles: files.length };
  },
);
