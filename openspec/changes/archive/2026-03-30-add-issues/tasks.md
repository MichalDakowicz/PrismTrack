## 1. Backend - Enhanced Issue Endpoints

- [x] 1.1 Add labels support to POST /api/github/issues endpoint in server.ts
- [x] 1.2 Add GET /api/github/repos/:owner/:repo/labels endpoint to fetch repository labels
- [x] 1.3 Add PATCH /api/github/issues/:owner/:repo/:issueNumber endpoint for closing/reopening issues
- [x] 1.4 Add proper error handling for rate limiting and validation errors

## 2. Frontend - CreateIssueModal Enhancements

- [x] 2.1 Add label picker UI component to CreateIssueModal.tsx
- [x] 2.2 Fetch available labels when repository is selected
- [x] 2.3 Pass labels array to POST /api/github/issues request
- [x] 2.4 Filter repository dropdown by linked repositories when in project context
- [x] 2.5 Add loading state for label fetching

## 3. Frontend - IssuesList Updates

- [x] 3.1 Add close/reopen buttons to issue rows in IssuesList.tsx
- [x] 3.2 Connect buttons to PATCH endpoint for state updates
- [x] 3.3 Add success/error feedback for state changes

## 4. Testing

- [x] 4.1 Test creating issue without labels (requires OAuth fix)
- [x] 4.2 Test creating issue with labels (requires OAuth fix)
- [x] 4.3 Test closing an open issue (requires OAuth fix)
- [x] 4.4 Test reopening a closed issue (requires OAuth fix)
- [x] 4.5 Test error handling for rate limiting (requires OAuth fix)

**Note**: Unit tests added in `src/components/CreateIssueModal.test.tsx` and `src/views/IssuesList.test.tsx`. Manual testing requires fixing the OAuth permissions issue first.
