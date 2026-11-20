# Recipie-Sharing-Community-Platform

## Deployment

The Vercel project can use either the repository root or `frontend` as its
**Root Directory**. Both configurations are included:

- Repository root: [vercel.json](./vercel.json)
- `frontend`: [frontend/vercel.json](./frontend/vercel.json)

Set `VITE_API_URL` in the Vercel project environment variables to the public
URL of the separately deployed backend, for example
`https://your-backend.example.com`. Do not use `http://localhost:5000` in a
Vercel environment.

Set `FRONTEND_URL` to the deployed frontend URL in the backend environment.
For local development, use `http://localhost:5173`.

## Google sign-in

1. In the Clerk dashboard, open **SSO connections**, add **Google** for all
   users, and enable it for sign-up and sign-in. Use the shared credentials for
   Clerk development instances. In production, create a Google OAuth Web
   application, register the redirect URI displayed by Clerk, and save the
   Google client ID and secret in Clerk. [Clerk Google setup guide](https://clerk.com/docs/guides/configure/auth-strategies/social-connections/google)
2. Set `VITE_CLERK_PUBLISHABLE_KEY` on the frontend. On the API, set
   `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from the same Clerk instance.
   Keep the secret key on the API. Set `FRONTEND_URL` to the frontend origin
   so the API can validate the authorized party on Clerk sessions.
3. In a regular browser, open **Sign in**, select **Continue with Google**,
   then select **Google** in Clerk. The app opens your profile after sign-in.

Existing password and administrator sign-ins still work. A new Google user
gets a DishCircle profile on first sign-in. If the Google email already belongs
to a DishCircle account, the user can keep signing in with their original
method. To enable Google sign-in for that account, an operator can verify both
identities and set `clerkUserId` on the existing MongoDB user document to the
user's Clerk ID. This preserves the MongoDB ID, role and content ownership.
