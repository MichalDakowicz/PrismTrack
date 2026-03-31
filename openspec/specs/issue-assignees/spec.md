# issue-assignees Specification

## Purpose
Enables assigning GitHub users to issues during creation and allowing modification of assignees on existing issues.
## Requirements
### Requirement: User can assign users to a new issue during creation
The system SHALL allow users to select one or more assignees when creating a new GitHub issue from the CreateIssueModal UI.

#### Scenario: Successful issue creation with assignees
- **WHEN** user fills in title, selects a repository, selects one or more assignees, and clicks "Create Issue"
- **THEN** the issue is created in GitHub with the specified assignees and appears in the issues list with assignee avatars

#### Scenario: Issue creation with no assignees selected
- **WHEN** user fills in title, selects a repository, and clicks "Create Issue" without selecting assignees
- **THEN** the issue is created in GitHub without assignees and appears in the issues list

### Requirement: User can view assignees on existing issues
The system SHALL display assignee avatars on each issue in the IssuesList UI.

#### Scenario: Display assignees on issue card
- **WHEN** user views the issues list
- **THEN** each issue card displays avatar(s) for assigned users

#### Scenario: No assignees display
- **WHEN** user views an issue with no assignees
- **THEN** the issue card shows a placeholder indicating "No assignees"

### Requirement: User can modify assignees on existing issues
The system SHALL allow users to add or remove assignees on existing issues from the IssuesList UI.

#### Scenario: Add assignee to existing issue
- **WHEN** user clicks the assignee area on an issue card and selects a user to add
- **THEN** the user is added as assignee in GitHub and the UI updates to show the new assignee

#### Scenario: Remove assignee from existing issue
- **WHEN** user clicks to remove an assignee from an issue card
- **THEN** the user is removed as assignee in GitHub and the UI updates to reflect the removal

### Requirement: User can fetch available assignees for a repository
The system SHALL provide an endpoint to fetch all available assignees for a given repository.

#### Scenario: Fetch assignees for valid repository
- **WHEN** user opens the assignee selector for a repository
- **THEN** the system fetches and displays available assignees for that repository

#### Scenario: No assignees available
- **WHEN** user selects a repository that has no other collaborators
- **THEN** the assignee picker shows an empty state with message "No assignees available"
