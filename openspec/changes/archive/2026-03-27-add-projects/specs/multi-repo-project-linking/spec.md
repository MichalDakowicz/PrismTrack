## ADDED Requirements

### Requirement: Repository Linking per Project
The system SHALL allow each project to link one or more repositories and SHALL persist repository associations as part of project metadata.

#### Scenario: Link repositories during project setup
- **WHEN** a user configures a project and selects repositories
- **THEN** the system stores the selected repository identifiers in that project's linkage metadata

#### Scenario: Update linked repositories
- **WHEN** a user adds or removes a repository from a project
- **THEN** the system updates the project linkage metadata and uses the new repository set for scoping

### Requirement: Project-Aware Issue and PR Filtering by Linked Repositories
The system SHALL scope issues and pull requests to the active project using linked repository associations.

#### Scenario: Show only linked repository issues
- **WHEN** a user views issues in a selected project context
- **THEN** the system includes only issues from repositories linked to that project

#### Scenario: Show only linked repository pull requests
- **WHEN** a user views pull requests in a selected project context
- **THEN** the system includes only pull requests from repositories linked to that project

### Requirement: Handling Unlinked or Ambiguous Repository Data
The system SHALL define deterministic behavior for records that cannot be mapped to linked repositories for the active project.

#### Scenario: Record belongs to unlinked repository
- **WHEN** an issue or pull request is associated with a repository not linked to the active project
- **THEN** the system excludes the record from project-scoped results

#### Scenario: Active project has no linked repositories
- **WHEN** a user selects a project with zero linked repositories
- **THEN** the system shows a setup-oriented empty state explaining that repository linkage is required for scoped results
