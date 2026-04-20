import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL  // ← must be NEXT_PUBLIC_ for client-side
});

// Named exports that are safe to destructure (non-hook functions)
export const { signIn, signUp, signOut } = authClient;