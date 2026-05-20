import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";
import {
  polar,
  checkout,
  portal,
  usage,
  webhooks,
} from "@polar-sh/better-auth";

import { polarClient } from "@/module/payment/config/polar";
import { updateUserTier } from "@/module/payment/lib/subscription";
import { updatePolarCustomerId } from "../module/payment/lib/subscription";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      scope: ["repo"],
    },
  },
  trustedOrigins: ["http://localhost:3000"],
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "ca3368b9-fcb1-47a6-b8f6-fb040e108df4",
              slug: "Pro", // Custom slug for easy reference in Checkout URL, e.g. /checkout/clairprismx
            },
          ],
          successUrl:
            process.env.POLAR_SUCCESS_URL ||
            "/dashboard/subscription?success=true",
          authenticatedUsersOnly: true,
        }),
        portal({
          returnUrl:
            process.env.NEXT_PUBLIC_APP_URL ||
            "http://localhost:3000/dashboard",
        }),
        usage(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET!,
          onSubscriptionActive: async (payload) => {
            const customerId = payload.data.customerId;
            if (!customerId) return;

            const user = await prisma.user.findUnique({
              where: {
                polarCustomerId: customerId,
              },
            });
            if (!user) return;

            if (user) {
              await updateUserTier(user.id, "PRO", "ACTIVE", payload.data.id);
            }
            console.log("USER UPDATED TO PRO");
          },
          onSubscriptionCanceled: async (payload) => {
            const customerId = payload.data.customerId;

            const user = await prisma.user.findUnique({
              where: {
                polarCustomerId: customerId,
              },
            });

            if (user) {
              await updateUserTier(
                user.id,
                user.subscriptionTier as any,
                "CANCELED",
              );
            }
          },
          onSubscriptionRevoked: async (payload) => {
            const customerId = payload.data.customerId;

            const user = await prisma.user.findUnique({
              where: {
                polarCustomerId: customerId,
              },
            });

            if (user) {
              await updateUserTier(user.id, "FREE", "EXPIRED");
            }
          },
          onOrderPaid: async () => {},
          onCheckoutCreated: async (payload) => {
            const customerId = payload.data.customerId;

            if (!customerId) return;

            const email = payload.data.customerEmail;

            if (!email) return;

            const user = await prisma.user.findUnique({
              where: {
                email,
              },
            });

            if (!user) return;

            await updatePolarCustomerId(user.id, customerId);

            console.log("POLAR CUSTOMER ID SAVED");
          },
        }),
      ],
    }),
  ],
});
