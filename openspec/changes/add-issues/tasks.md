## 1. Backend - Enhanced Issue Endpoints

- [ ] 1.1 Add labels support to POST /api/github/issues endpoint in server.ts
- [ ] 1.2 Add GET /api/github/repos/:owner/:repo/labels endpoint to fetch repository labels
- [ ] 1.3 Add PATCH /api/github/issues/:owner/:repo/:issueNumber endpoint for closing/reopening issues
- [ ] 1.4 Add proper error handling for rate limiting and validation errors

## 2. Frontend - CreateIssueModal Enhancements

- [ ] 2.1 Add label picker UI component to CreateIssueModal.tsx
- [ ] 2.2 Fetch available labels when repository is selected
- [ ] 2.3 Pass labels array to POST /api/github/issues request
- [ ] 2.4 Filter repository dropdown by linked repositories when in project context
- [ ] 2.5 Add loading state for label fetching

## 3. Frontend - IssuesList Updates

- [ ] 3.1 Add close/reopen buttons to issue rows in IssuesList.tsx
- [ ] 3.2 Connect buttons to PATCH endpoint for state updates
- [ ] 3.3 Add success/error feedback for state changes

## 4. Testing

- [ ] 4.1 Test creating issue without labels
- [ ] 4.2 Test creating issue with labels
- [ ] 4.3 Test closing an open issue
- [ ] 4.4 Test reopening a closed issue
- [ ] 4.5 Test error handling for rate limiting
