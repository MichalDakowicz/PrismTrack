## Context

PrismTrack currently supports creating GitHub issues with labels but lacks assignee functionality. Users need to assign team members to issues for better task tracking and team coordination.

## Goals / Non-Goals

**Goals:**
- Allow users to select assignees when creating new issues via CreateIssueModal
- Allow users to view and modify assignees on existing issues via IssuesList
- Integrate with GitHub API to fetch available assignees for a repository

**Non-Goals:**
- Bulk assignment (assigning multiple issues at once)
- Assignment notifications
- Team workload visualization

## Decisions

- **Assignee Selection UI**: Use a multi-select dropdown component similar to the existing label picker for consistency
- **API Integration**: Add new endpoint `/api/repos/:owner/:repo/assignees` to fetch available assignees (GitHub API: `GET /repos/{owner}/{repo}/assignees`)
- **State Management**: Use existing issue state management patterns, add assignees to issue data structure
- **API Mutation**: Use GitHub API `POST /repos/{owner}/{repo}/issues/{issue_number}/assignees` for adding assignees, `DELETE` for removing

## Risks / Trade-offs

- [Risk] GitHub API rate limiting for fetching assignees → Mitigation: Cache assignee list per repository session
- [Risk] Large teams with many members → Mitigation: Add search/filter to assignee dropdown
