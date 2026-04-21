import { Octokit } from "octokit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { tr } from "date-fns/locale";

/**
 * Getting github access token for the current user
 *
 */

export const getGithubAccessToken = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("User is not authenticated");
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github",
    },
  });
  if (!account?.accessToken) {
    throw new Error("GitHub account not found");
  }
  return account.accessToken;
};

export async function fetchUserContribution(token: string, username: string) {
  const octokit = new Octokit({ auth: token });
  // ✅ Fixed
  const query = `
    query($username: String!) {
        user(login: $username) {
            contributionsCollection {
                contributionCalendar {
                    totalContributions
                    weeks {
                        contributionDays {
                            date
                            contributionCount
                            color
                        }
                    }
                }
            }
        }
    }
`;
  interface contributiondata {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: {
            contributionDays: {
              date: string;
              contributionCount: number;
              color: string;
            }[];
          }[];
        };
      };
    };
  }
  try {
    const response: contributiondata = await octokit.graphql(query, {
      username,
    });
    return response.user.contributionsCollection.contributionCalendar;
  } catch (error) {
    console.error("Error fetching user contributions:", error);
    throw error;
  }
}

export const getRepositories = async (
  page: number = 1,
  perPage: number = 10,
) => {
  const token = await getGithubAccessToken();
  const octokit = new Octokit({ auth: token });
  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    direction: "desc",
    visibility: "all",
    affiliation: "owner,collaborator,organization_member",
    per_page: perPage,
    page: page,
  });
  return data;
};

export const createWebhook = async (owner: string, repo: string) => {
  const token = await getGithubAccessToken();
  const octokit = new Octokit({ auth: token });
  const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/github`;
  const { data } = await octokit.rest.repos.listWebhooks({
    owner,
    repo,
  });
  const existingWebhook = data.find(
    (webhook) => webhook.config.url === webhookUrl,
  );
  if (existingWebhook) {
    return existingWebhook;
  }
  const { data: webhook } = await octokit.rest.repos.createWebhook({
    owner,
    repo,
    config: {
      url: webhookUrl,
      content_type: "json",
    },
    events: ["pull_request"],
  });
  return webhook;
};

export const deleteWebhook = async (owner: string, repo: string) => {
  const token = await getGithubAccessToken();
  const octokit = new Octokit({ auth: token });
  const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/github`;
  try {
    const { data: webhooks } = await octokit.rest.repos.listWebhooks({
      owner,
      repo,
    });
    const webhookToDelete = webhooks.find(
      (webhook) => webhook.config.url === webhookUrl,
    );
    if (webhookToDelete) {
      await octokit.rest.repos.deleteWebhook({
        owner,
        repo,
        hook_id: webhookToDelete.id,
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting webhook:", error);
    throw error;
    return false;
  }
};
