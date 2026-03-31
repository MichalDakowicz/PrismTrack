## 1. Backend API

- [x] 1.1 Add `GET /api/repos/:owner/:repo/assignees` endpoint to fetch available assignees
- [x] 1.2 Add `POST /api/repos/:owner/:repo/issues/:number/assignees` endpoint to add assignees
- [x] 1.3 Add `DELETE /api/repos/:owner/:repo/issues/:number/assignees` endpoint to remove assignees
- [x] 1.4 Update issue creation API to accept assignees array

## 2. Frontend - CreateIssueModal Updates

- [x] 2.1 Add assignee selector component (multi-select dropdown)
- [x] 2.2 Fetch assignees when repository is selected
- [x] 2.3 Pass assignees to issue creation API
- [x] 2.4 Handle empty assignees state

## 3. Frontend - IssuesList Updates

- [x] 3.1 Update issue card to display assignee avatars
- [x] 3.2 Add assignee management UI on issue cards
- [x] 3.3 Implement add assignee functionality
- [x] 3.4 Implement remove assignee functionality
- [x] 3.5 Handle no assignees placeholder state

## 4. Integration & Testing

- [ ] 4.1 Test end-to-end assignee creation during issue creation
- [ ] 4.2 Test viewing assignees on existing issues
- [ ] 4.3 Test adding assignees to existing issues
- [ ] 4.4 Test removing assignees from issues
- [ ] 4.5 Test error handling for API failures
