# issue-create Specification

## Purpose
TBD - created by archiving change add-issues. Update Purpose after archive.
## Requirements
### Requirement: User can create issue with labels
The system SHALL allow users to create GitHub issues with optional labels directly from the CreateIssueModal UI.

#### Scenario: Successful issue creation with labels
- **WHEN** user fills in title, selects a repository, selects one or more labels, and clicks "Create Issue"
- **THEN** the issue is created in GitHub with the specified labels and appears in the issues list

#### Scenario: Successful issue creation without labels
- **WHEN** user fills in title, selects a repository, and clicks "Create Issue" without selecting labels
- **THEN** the issue is created in GitHub without labels and appears in the issues list

#### Scenario: Issue creation fails with invalid repo
- **WHEN** user submits the form with an invalid repository
- **THEN** the system SHALL display an error message "Failed to create issue: Repository not found"

#### Scenario: Issue creation fails due to rate limiting
- **WHEN** user submits the form but GitHub API rate limit is exceeded
- **THEN** the system SHALL display an error message "GitHub API rate limit exceeded. Please try again later."

### Requirement: User can fetch available labels for a repository
The system SHALL provide an endpoint to fetch all available labels for a given repository.

#### Scenario: Fetch labels for valid repository
- **WHEN** user opens CreateIssueModal and selects a repository
- **THEN** the system fetches and displays available labels for that repository

#### Scenario: No labels available
- **WHEN** user selects a repository that has no labels defined
- **THEN** the label picker shows an empty state with message "No labels defined"

### Requirement: Repository selection filters by project context
When a project is selected with linked repositories, the repository dropdown SHALL only show those linked repositories.

#### Scenario: Project context limits repo options
- **WHEN** user has a project selected with linked repositories "owner/repo1" and "owner/repo2"
- **THEN** the repository dropdown in CreateIssueModal only shows "owner/repo1" and "owner/repo2"

#### Scenario: No project selected shows all repos
- **WHEN** user has no project selected
- **THEN** the repository dropdown shows all accessible repositories

