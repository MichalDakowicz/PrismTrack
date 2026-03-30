## ADDED Requirements

### Requirement: Branch listing
The system SHALL display a list of branches from repositories linked to the active project.

#### Scenario: Display branches for single linked repository
- **WHEN** user navigates to the branches view
- **AND** the active project has one linked repository
- **THEN** the system fetches and displays all branches from that repository

#### Scenario: Display branches for multiple linked repositories
- **WHEN** user navigates to the branches view
- **AND** the active project has multiple linked repositories
- **THEN** the system fetches and displays all branches from all linked repositories

#### Scenario: Empty state when no repositories linked
- **WHEN** user navigates to the branches view
- **AND** the active project has no linked repositories
- **THEN** the system displays a message prompting the user to link repositories from the Projects page

### Requirement: Branch metadata display
The system SHALL display branch metadata including name, last commit author, last commit date, and protection status.

#### Scenario: Display branch name
- **WHEN** branches are displayed
- **THEN** each branch shows its name prominently

#### Scenario: Display last commit information
- **WHEN** branches are displayed
- **THEN** each branch shows the author and relative time since last commit

#### Scenario: Display protection status
- **WHEN** branches are displayed
- **THEN** protected branches show a visual indicator
- **AND** unprotected branches show no protection indicator

### Requirement: Stale branch identification
The system SHALL highlight branches that have not received commits in 14 or more days.

#### Scenario: Indicate stale branches
- **WHEN** a branch has not received a commit in 14 or more days
- **THEN** the system displays a stale indicator on that branch row

#### Scenario: Fresh branches not marked
- **WHEN** a branch has received a commit within the last 14 days
- **THEN** the system does not display a stale indicator

### Requirement: Branch-to-PR association
The system SHALL display the associated pull request number and state for branches with open or merged pull requests.

#### Scenario: Display linked PR for open branch
- **WHEN** a branch has an open pull request
- **THEN** the system displays the PR number with open status

#### Scenario: Display linked PR for merged branch
- **WHEN** a branch has a merged pull request
- **THEN** the system displays the PR number with merged status

#### Scenario: No PR indicator for branches without PRs
- **WHEN** a branch has no associated pull request
- **THEN** the system displays a dash or empty state in the PR column

### Requirement: Branch filtering
The system SHALL allow filtering branches by repository when multiple repositories are linked.

#### Scenario: Filter by repository
- **WHEN** user selects a repository filter
- **THEN** the system displays only branches from the selected repository

#### Scenario: Show all branches
- **WHEN** user selects "All repositories"
- **THEN** the system displays branches from all linked repositories

### Requirement: Sort branches by recency
The system SHALL sort branches by last commit date, most recent first.

#### Scenario: Default sort order
- **WHEN** branches are displayed
- **THEN** they are sorted by last commit date in descending order
