## ADDED Requirements

### Requirement: Project Entity and Lifecycle
The system SHALL define Project as a first-class domain entity with a unique identifier, display name, optional description, and lifecycle status. The system SHALL support creating, updating, and selecting a project through application flows.

#### Scenario: Create a project with required attributes
- **WHEN** a user creates a new project with a valid name
- **THEN** the system stores a project record with a unique id and default lifecycle status

#### Scenario: Update project metadata
- **WHEN** a user edits a project's name or description
- **THEN** the system persists the updated metadata and reflects it in all project selectors

#### Scenario: Select active project context
- **WHEN** a user selects a project from navigation
- **THEN** the system sets that project as the active project context for project-aware views

### Requirement: Project Discovery and Navigation
The system SHALL expose a Projects entry in primary navigation and SHALL provide a project listing surface that enables users to discover and open project detail context.

#### Scenario: Projects entry is visible in sidebar
- **WHEN** an authenticated user opens the application shell
- **THEN** the sidebar includes a Projects navigation destination

#### Scenario: Open a project from list
- **WHEN** a user chooses a project from the Projects surface
- **THEN** the system navigates to that project's detail context and marks it active

### Requirement: Project Data Contract Stability
The system SHALL provide a stable typed contract for project data and operations so the client data source can be replaced by backend APIs without changing view-level behavior.

#### Scenario: Swap data provider implementation
- **WHEN** the project data provider implementation is replaced with an API-backed provider
- **THEN** project listing, selection, and metadata rendering behavior remains unchanged at the UI contract level
