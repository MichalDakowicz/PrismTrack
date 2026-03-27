<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/4a98160b-a70b-46a5-b1ef-97a39863d2b6

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Configure MongoDB in `.env.local`:
    - `MONGODB_URI=mongodb://localhost:27017`
    - `MONGODB_DB_NAME=prismtrack`
    - Optional rollback toggle: `USE_IN_MEMORY_PROJECT_REPO=true`
    - Optional fallback behavior: `ALLOW_IN_MEMORY_PROJECT_REPO_FALLBACK=true`
3. Run the app:
   `npm run dev`

## MongoDB Preflight Checklist

- Ensure `MONGODB_URI` and `MONGODB_DB_NAME` are set for target environment.
- Verify database connectivity from the runtime host before deployment.
- Check health endpoint after boot: `GET /api/health`.
- Use `USE_IN_MEMORY_PROJECT_REPO=true` only for emergency fallback, not normal production operation.
