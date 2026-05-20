// import { betterAuth } from "better-auth";
// import {
//   polar,
//   checkout,
//   portal,
//   usage,
//   webhooks,
// } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";

export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: "sandbox",
});

// const auth = betterAuth({
//   // ... Better Auth config
//   plugins: [
//     polar({
//       client: polarClient,
//       createCustomerOnSignUp: true,
//       use: [
//         checkout({
//           products: [
//             {
//               productId: "16b3bb9e-46b2-4923-aa1e-e8a4da75da0a",
//               slug: "clairprismx", // Custom slug for easy reference in Checkout URL, e.g. /checkout/clairprismx
//             },
//           ],
//           successUrl: process.env.POLAR_SUCCESS_URL,
//           authenticatedUsersOnly: true,
//         }),
//       ],
//     }),
//   ],
// });
