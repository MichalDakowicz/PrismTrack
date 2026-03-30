## Context

The app currently displays branches via a placeholder at `/branches`. The GitHub API provides branch data, but no endpoint exists to fetch it. Branch visibility would complement existing Issue and PR views, giving developers a complete picture of repository activity.

**Current State:**
- `/branches` route uses `WorkspaceSectionPlaceholder`
- GitHub API endpoints for issues and PRs exist in `server.ts`
- No `/api/github/branches` endpoint
- Project context provides `activeProject` with `linkedRepositories`

## Goals / Non-Goals

**Goals:**
- Fetch and display branches from linked repositories via GitHub API
- Show stale branch indicators (14+ days since last commit)
- Display branch protection status where available
- Link branches to their associated pull requests
- Maintain consistent UI patterns with existing views (IssuesList, PullRequests)

**Non-Goals:**
- Full branch management (create, delete) - read-only view for now
- Real-time branch updates (polling or WebSocket)
- Branch diff/compare functionality

## Decisions

### 1. API Endpoint Structure

**Decision:** Create `/api/github/branches?repo={owner}/{name}` endpoint

**Rationale:** Follows existing API pattern in `server.ts`. Accepts optional `repo` query param to filter by specific repository. When project has linked repos, fetches branches for each.

**Alternative:** Fetch all branches via GitHub's `/user/repos` and filter client-side
- Rejected: Too much data, slower initial load

### 2. Data Model

```typescript
interface Branch {
  name: string;
  commit: { sha: string; url: string };
  protected: boolean;
  protection_url?: string;
  lastCommitDate: string;
  author: { login: string; avatar_url: string };
  pullRequest?: { number: number; state: string; url: string };
}
```

**Rationale:** Extends GitHub's branch data with computed `lastCommitDate` and fetched PR status. Keeps the model flat and suitable for table display.

### 3. View Layout

**Decision:** Table-based layout matching IssuesList style

**Rationale:** Consistent with existing patterns. Branch data (name, author, date, status) fits tabular format well. Enables sorting and filtering.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ BRANCHES                                        [Filter] [Sort] │
├─────────────────────────────────────────────────────────────────┤
│ ☐ │ BRANCH         │ LAST COMMIT  │ AUTHOR  │ STATUS  │ PR    │
├───┼────────────────┼──────────────┼─────────┼─────────┼───────┤
│ ☐ │ main           │ 2 hours ago  │ @owner  │ ●       │ #123  │
│ ☐ │ feature/new-ui │ 3 days ago   │ @dev    │ ○       │ —     │
│ ☐ │ stale/old-feat │ 21 days ago  │ @dev    │ ⚠ stale │ —     │
└───┴────────────────┴──────────────┴─────────┴─────────┴───────┘
```

### 4. Stale Detection

**Decision:** 14-day threshold for stale indicator

**Rationale:** Common GitHub default. Short enough to catch inactive work, long enough to avoid false positives on feature branches.

### 5. Project Scoping

**Decision:** Filter branches by project's linked repositories

**Rationale:** Consistent with how IssuesList and PullRequests scope data. Users expect filtered views within project context.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Large repos with 100s of branches | Add pagination or limit to 50 most recent |
| Rate limiting on GitHub API | Cache branch data briefly, handle 403 gracefully |
| Branch list differs from IssuesList patterns | Maintain consistent header/filter patterns |

## Open Questions

1. Should we fetch branch protection details? (Requires additional API call per branch)
2. Sort default: by last commit date (descending)?
3. Include default branch (`main`/`master`) prominently?
