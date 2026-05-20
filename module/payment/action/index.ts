"use server";

import { auth } from "@/lib/auth";
import {
  getRemainingLimits,
  updateUserTier,
} from "@/module/payment/lib/subscription";
import { headers } from "next/headers";
import { polarClient } from "@/module/payment/config/polar";
import prisma from "@/lib/db";

export interface SubscriptionData {
  user: {
    id: string;
    name: string;
    email: string;
    subscriptionTier: string;
    subscriptionStatus: string | null;
    polarCustomerId: string | null;
    polarSubscriptionId: string | null;
  } | null;
  limits: {
    tier: "FREE" | "PRO";
    repositories: {
      current: number;
      limit: number | null;
      canAdd: boolean;
    };
    reviews: {
      [repositoryId: string]: {
        current: number;
        limit: number | null;
        canAdd: boolean;
      };
    };
  } | null;
}

export async function getSubscriptionData(): Promise<SubscriptionData> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { user: null, limits: null };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return { user: null, limits: null };
  }

  const limits = await getRemainingLimits(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      subscriptionTier: user.subscriptionTier || "FREE",
      subscriptionStatus: user.subscriptionStatus || null,
      polarCustomerId: user.polarCustomerId || null,
      polarSubscriptionId: user.polarSubscriptionId || null,
    },
    limits,
  };
}

// export async function syncSubscriptionStatus() {
//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });

//   if (!session?.user) {
//     throw new Error("Not authenticated");
//   }

//   const user = await prisma.user.findUnique({
//     where: { id: session.user.id },
//   });

//   if (!user || !user.polarCustomerId) {
//     return { success: false, message: "No Polar customer ID found" };
//   }

//   try {
//     // Fetch subscriptions from Polar
//     const result = await polarClient.subscriptions.list({
//       customerId: user.polarCustomerId,
//     });

//     const subscriptions = result.result?.items || [];

//     // Find the most relevant subscription (active or most recent)
//     const activeSub = subscriptions.find((sub: any) => sub.status === "active");
//     const latestSub = subscriptions[0]; // Assuming API returns sorted or we should sort

//     if (activeSub) {
//       await updateUserTier(user.id, "PRO", "ACTIVE", activeSub.id);
//       return { success: true, status: "ACTIVE" };
//     } else if (latestSub) {
//       // If latest is canceled/expired
//       const status = latestSub.status === "canceled" ? "CANCELED" : "EXPIRED";
//       // Only downgrade if we are sure it's not active
//       if (latestSub.status !== "active") {
//         await updateUserTier(user.id, "FREE", status, latestSub.id);
//       }
//       return { success: true, status };
//     }

//     return { success: true, status: "NO_SUBSCRIPTION" };
//   } catch (error) {
//     console.error("Failed to sync subscription:", error);
//     return { success: false, error: "Failed to sync with Polar" };
//   }
// }

export async function syncSubscriptionStatus() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return { success: false, message: "User not found" };
  }

  try {
    let polarCustomerId = user.polarCustomerId;

    // If no polarCustomerId, look up by email
    if (!polarCustomerId) {
      const customersResult = await polarClient.customers.list({
        email: user.email,
      });

      const customer = customersResult.result?.items?.[0];

      if (!customer) {
        return {
          success: false,
          message: "No Polar customer found for this email",
        };
      }

      polarCustomerId = customer.id;

      // Save it so we don't have to look it up next time
      await prisma.user.update({
        where: { id: user.id },
        data: { polarCustomerId },
      });
    }

    // Now fetch subscriptions
    const result = await polarClient.subscriptions.list({
      customerId: polarCustomerId,
    });

    const subscriptions = result.result?.items || [];
    const activeSub = subscriptions.find((sub: any) => sub.status === "active");
    const latestSub = subscriptions[0];

    if (activeSub) {
      await updateUserTier(user.id, "PRO", "ACTIVE", activeSub.id);
      return { success: true, status: "ACTIVE" };
    } else if (latestSub && latestSub.status !== "active") {
      const status = latestSub.status === "canceled" ? "CANCELED" : "EXPIRED";
      await updateUserTier(user.id, "FREE", status, latestSub.id);
      return { success: true, status };
    }

    return { success: true, status: "NO_SUBSCRIPTION" };
  } catch (error) {
    console.error("Failed to sync subscription:", error);
    return { success: false, error: "Failed to sync with Polar" };
  }
}
