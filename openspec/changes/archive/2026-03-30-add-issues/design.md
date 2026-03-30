## Context

The PrismTrack application currently has basic issue functionality but it's incomplete. The GET /api/github/issues endpoint works for fetching issues, but the POST endpoint for creating issues lacks proper validation, error handling, and essential GitHub API features like labels and assignees. The frontend CreateIssueModal only exposes title, body, and repo selection - missing labels which are critical for issue organization.

## Goals / Non-Goals

**Goals:**
- Enable users to create issues with labels directly from PrismTrack
- Add proper error handling with user-friendly messages
- Enable closing/reopening issues from the UI
- Filter repo dropdown to show only linked repositories when in project context

**Non-Goals:**
- Implementing issue comments
- Implementing issue assignees (may add later)
- Creating a local issue cache/database

## Decisions

1. **Enhanced POST /api/github/issues endpoint** - Extend existing endpoint to accept optional `labels` array. This keeps the API simple and avoids creating new endpoints.

2. **Labels fetching** - Add GET /api/github/repos/:owner/:repo/labels endpoint to fetch available labels for a repository, enabling the frontend to show a label picker.

3. **PATCH /api/github/issues/:owner/:repo/:issueNumber endpoint** - New endpoint to update issue state (close/reopen). Using PATCH follows REST conventions.

4. **Frontend state management** - Use local state in CreateIssueModal for labels - no need for global state since modal is self-contained.

## Risks / Trade-offs

- [GitHub API rate limits] → Add proper error handling and user feedback when rate limited
- [Missing labels in repo] → Show empty state in label picker with helpful message
- [Network failures] → Add retry logic and clear error messages in UI

## Migration Plan

1. Deploy backend changes first (new endpoints)
2. Deploy frontend changes (updated CreateIssueModal)
3. No database migration needed - all data stays in GitHub
