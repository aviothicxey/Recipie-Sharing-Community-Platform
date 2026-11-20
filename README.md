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
