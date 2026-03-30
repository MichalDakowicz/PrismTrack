## 1. API Endpoint

- [x] 1.1 Add `Branch` type to `src/types.ts`
- [x] 1.2 Add `BranchUser` type for commit author
- [x] 1.3 Create `/api/github/branches` endpoint in `server.ts`
- [x] 1.4 Handle GitHub API authentication and error responses
- [x] 1.5 Implement branch protection status check
- [x] 1.6 Fetch associated PR for each branch

## 2. Frontend View

- [x] 2.1 Create `src/views/Branches.tsx` component
- [x] 2.2 Implement branch table layout matching design
- [x] 2.3 Add branch metadata display (name, author, date, status)
- [x] 2.4 Add stale branch indicator styling
- [x] 2.5 Display PR association column

## 3. Project Scoping

- [x] 3.1 Import `useProjects` hook in Branches view
- [x] 3.2 Fetch branches for linked repositories only
- [x] 3.3 Add repository filter dropdown
- [x] 3.4 Handle empty state when no repos linked

## 4. Integration

- [x] 4.1 Update `src/App.tsx` to use Branches component for `/branches` route
- [x] 4.2 Add consistent header/footer patterns matching IssuesList
- [ ] 4.3 Test in browser with linked project
