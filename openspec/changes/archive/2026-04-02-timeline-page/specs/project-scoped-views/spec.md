## ADDED Requirements

### Requirement: Timeline appears as a first-class project view
The system SHALL include Timeline in the set of project-scoped views, consistent with existing navigation and view switching behavior.

#### Scenario: Project view switch includes timeline
- **WHEN** a user opens project-scoped navigation options
- **THEN** Timeline is available alongside existing project views and can be selected directly

### Requirement: Project context is preserved when entering timeline
The system MUST preserve active project selection and shared view context when navigating from another project-scoped view into Timeline.

#### Scenario: Navigate from issues to timeline
- **WHEN** a user switches from Issues to Timeline within the same project
- **THEN** the active project context remains unchanged and timeline data is loaded for that project