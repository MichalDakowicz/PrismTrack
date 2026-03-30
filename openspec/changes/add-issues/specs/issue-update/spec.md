## ADDED Requirements

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
