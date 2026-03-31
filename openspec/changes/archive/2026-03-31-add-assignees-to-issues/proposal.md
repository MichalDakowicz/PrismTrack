## Why

Users need to assign team members to GitHub issues directly from the PrismTrack UI. Currently, issues can be created with labels but there's no way to assign people to issues, which limits team coordination and task management.

## What Changes

- Add assignee selection to CreateIssueModal when creating new issues
- Add ability to view and modify assignees on existing issues via the IssuesList UI
- Integrate with GitHub API to fetch available assignees for a repository
- Store and display assignee information in the issues list

## Capabilities

### New Capabilities
- `issue-assignees`: Enables assigning GitHub users to issues during creation and allowing modification of assignees on existing issues

### Modified Capabilities
- `issue-create`: Add assignee selection to the issue creation form
- `issue-update`: Extend to support updating assignees on existing issues

## Impact

- New API endpoint to fetch available assignees for a repository
- UI updates to CreateIssueModal and IssuesList components
- GitHub API integration for assignee operations
