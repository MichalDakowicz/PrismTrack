## ADDED Requirements

### Requirement: Project-Scoped Board/List/Timeline/Activity/Pulse Context
The system SHALL provide project detail context that hosts Board, List, Timeline, Activity Feed, and Pulse views scoped to the selected project.

#### Scenario: Enter project detail context
- **WHEN** a user opens a project from the Projects surface
- **THEN** the system presents project-scoped entry points for Board, List, Timeline, Activity Feed, and Pulse

#### Scenario: Keep selected project across view switching
- **WHEN** a user switches between Board and other project-scoped views
- **THEN** the active project context remains unchanged and is reused by each view

### Requirement: Consistent Empty and Loading States in Project Context
The system SHALL render consistent loading and empty-state behavior for project-scoped views when project data or linked work items are unavailable.

#### Scenario: No project work items available
- **WHEN** the selected project has no matching issues, pull requests, or events
- **THEN** each project-scoped view shows a contextual empty state instead of generic global content

#### Scenario: Project context loading
- **WHEN** project detail data is still being resolved
- **THEN** project-scoped views show loading feedback until project context is ready

### Requirement: Command and Filter Awareness of Active Project
The system SHALL apply the active project context to command and filtering flows that operate on issue and project navigation actions.

#### Scenario: Issue command uses active project
- **WHEN** a user triggers an issue-related command from within a project detail context
- **THEN** the command defaults to the active project scope

#### Scenario: Filter state reflects project scope
- **WHEN** a user applies view-level filters in a project-scoped view
- **THEN** the filter results are constrained to data associated with the active project
