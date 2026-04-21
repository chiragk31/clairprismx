"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { success } from "better-auth";
import { url } from "inspector";
import { deleteWebhook } from "@/module/github/lib/github";
export async function getUserProfile() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session || !session.user) {
      throw new Error("User not authenticated");
    }
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Failed to fetch user profile");
  }
}

export async function updateUserProfile(data: {
  name?: string;
  email?: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session || !session.user) {
      throw new Error("User not authenticated");
    }
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: data.name,
        email: data.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });
    revalidatePath("/dashboard/settings", "page");
    return {
      success: true,
      user: updatedUser,
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Failed to update user profile");
  }
}

export async function getConnectedGithubRepositories() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      throw new Error("User is not authenticated");
    }
    const repositories = await prisma.repository.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        fullName: true,
        url: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return repositories;
  } catch (error) {
    console.error("Error fetching connected GitHub repositories:", error);
    throw new Error("Failed to fetch connected GitHub repositories");
    return [];
  }
}

export async function disconnectGithubRepository(repoId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      throw new Error("User is not authenticated");
    }
    const repository = await prisma.repository.findUnique({
      where: {
        id: repoId,
        userId: session.user.id,
      },
    });
    if (!repository) {
      throw new Error("Repository not found");
    }
    await deleteWebhook(repository.owner, repository.name);
    await prisma.repository.delete({
      where: {
        id: repoId,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/settings", "page");
    revalidatePath("/dashboard/repository", "page");

    return { success: true };
  } catch (error) {
    console.error("Error disconnecting GitHub repository:", error);
    throw new Error("Failed to disconnect GitHub repository");
  }
}

export async function disconnectAllGithubRepositories() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      throw new Error("User is not authenticated");
    }
    const repositories = await prisma.repository.findMany({
      where: {
        userId: session.user.id,
      },
    });
    for (const repository of repositories) {
      await deleteWebhook(repository.owner, repository.name);
    }
    await prisma.repository.deleteMany({
      where: {
        userId: session.user.id,
      },
    });
    revalidatePath("/dashboard/settings", "page");
    revalidatePath("/dashboard/repository", "page");
    return { success: true };
  } catch (error) {
    console.error("Error disconnecting all GitHub repositories:", error);
    throw new Error("Failed to disconnect all GitHub repositories");
  }
}
