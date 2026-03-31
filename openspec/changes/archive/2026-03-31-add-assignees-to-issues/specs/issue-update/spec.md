## MODIFIED Requirements

### Requirement: User can close an open issue
The system SHALL allow users to close (resolve) an open issue from the IssuesList UI.

#### Scenario: Close open issue
- **WHEN** user clicks the close button on an open issue
- **THEN** the issue state changes to "closed" in GitHub and the UI updates to reflect the closed state

#### Scenario: Close issue fails
- **WHEN** user clicks close button but GitHub API returns an error
- **THEN** the system SHALL display an error message and the issue remains in open state

### Requirement: User can reopen a closed issue
The system SHALL allow users to reopen a previously closed issue from the IssuesList UI.

#### Scenario: Reopen closed issue
- **WHEN** user clicks the reopen button on a closed issue
- **THEN** the issue state changes to "open" in GitHub and the UI updates to reflect the open state

#### Scenario: Reopen issue fails
- **WHEN** user clicks reopen button but GitHub API returns an error
- **THEN** the system SHALL display an error message and the issue remains in closed state

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
