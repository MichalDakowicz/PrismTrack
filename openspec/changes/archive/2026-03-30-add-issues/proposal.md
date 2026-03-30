## Why

The current issue functionality is incomplete and unreliable. Users cannot properly create issues with labels, assignees, or proper error feedback. The existing POST endpoint lacks proper validation, error handling, and essential GitHub issue features. This prevents users from effectively tracking and managing work within PrismTrack.

## What Changes

- Enhance POST /api/github/issues endpoint to support labels, assignees, and milestone
- Add proper validation and error handling with user-friendly messages
- Add PATCH endpoint to update issue state (close/reopen)
- Add label management to the CreateIssueModal UI
- Improve repo selection to filter by linked repositories when in project context
- Add proper loading states and success/error feedback

## Capabilities

### New Capabilities

- `issue-create`: Full-featured issue creation with labels, assignees, and proper error handling
- `issue-update`: Close, reopen, and update existing issues

### Modified Capabilities

- (none - current issues fetch works adequately)

## Impact

- Backend: server.ts - enhance existing issue endpoints
- Frontend: CreateIssueModal.tsx - add labels and improve UX
- Frontend: IssuesList.tsx - add issue actions (close/reopen)
