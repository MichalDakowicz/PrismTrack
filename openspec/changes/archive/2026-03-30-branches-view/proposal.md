## Why

The `/branches` route currently displays a placeholder. Users need visibility into repository branches to track development progress, identify stale branches, and quickly access related pull requests. This fills a functional gap and makes the app feel complete.

## What Changes

- Add new `/branches` view with branch listing and filtering
- Create `/api/github/branches` endpoint to fetch branches from linked repositories
- Display branch metadata (name, last commit date, author, protection status)
- Highlight stale branches (no activity in 14+ days)
- Show PR status for branches with open/merged PRs
- Quick actions: view PR, create PR, delete branch (for own branches)

## Capabilities

### New Capabilities
- `branches-view`: Display and manage GitHub repository branches within project scope

### Modified Capabilities
- (none)

## Impact

- **New files**: `src/views/Branches.tsx`, `src/types.ts` (Branch type)
- **New API**: `/api/github/branches` endpoint in `server.ts`
- **Modified files**: `src/App.tsx` (update route to use Branches component)
