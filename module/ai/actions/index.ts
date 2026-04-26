"use server";

import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { getPullRequestDiff } from "@/module/github/lib/github";
import { success } from "better-auth";
import { get } from "http";

export async function reviewPullRequest(
  owner: string,
  repo: string,
  prNumber: number,
) {
  try {
    const repository = await prisma.repository.findFirst({
      where: {
        owner,
        name: repo,
      },
      include: {
        user: {
          include: {
            accounts: {
              where: {
                providerId: "github",
              },
            },
          },
        },
      },
    });

    if (!repository) {
      throw new Error("Repository not found");
    }
    const githubAccount = repository.user.accounts[0];
    if (!githubAccount) {
      throw new Error("GitHub account not found");
    }
    if (!githubAccount.accessToken) {
      throw new Error("GitHub access token not found");
    }
    const token = githubAccount.accessToken;
    const { title } = await getPullRequestDiff(token, owner, repo, prNumber);
    await inngest.send({
      name: "pr_review_requested",
      data: {
        owner,
        repo,
        prNumber,
        userId: repository.userId,
      },
    });
    return { success: true, message: "review Queued" };
  } catch (error) {
    try {
      const repository = await prisma.repository.findFirst({
        where: {
          owner,
          name: repo,
        },
      });
      if (repository) {
        await prisma.review.create({
          data: {
            repositoryId: repository.id,
            prNumber,
            prTitle: "failed to fetch PR title",
            prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
            review: `Error ${error instanceof Error ? error.message : "Unknown error occurred while fetching PR details."}`,
            status: "failed",
          },
        });
      }
    } catch (dberror) {
      console.error("Error sending failure event to Inngest:", dberror);
    }
  }
}
