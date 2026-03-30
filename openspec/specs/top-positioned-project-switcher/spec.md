## ADDED Requirements

### Requirement: Project switcher displayed at top of sidebar
The project switcher SHALL be positioned immediately below the sidebar header, providing quick access to switch between projects and workspaces.

#### Scenario: User sees current project
- **WHEN** user opens the sidebar
- **THEN** the current active project is displayed prominently at the top with clear visual distinction

#### Scenario: User switches to different project
- **WHEN** user clicks on a different project in the project switcher
- **THEN** the active project updates and the sidebar shows the new project's context

### Requirement: Project list in switcher
The project switcher SHALL display a list of available projects for quick selection without requiring navigation to a separate Projects page.

#### Scenario: Project list is visible
- **WHEN** the sidebar is displayed
- **THEN** a list of up to 8 projects is shown in the switcher (consistent with existing sidebar behavior)

#### Scenario: User searches for project (optional)
- **WHEN** the project list exceeds 8 items
- **THEN** a search/filter input MAY be provided to narrow the project list

### Requirement: Visual prominence of project switcher
The project switcher SHALL be visually distinct from other sidebar sections to indicate its importance as a primary navigation element.

#### Scenario: Styling indicates primary importance
- **WHEN** user views the sidebar
- **THEN** the project switcher uses enhanced contrast, larger text, or icon treatment compared to secondary sections
