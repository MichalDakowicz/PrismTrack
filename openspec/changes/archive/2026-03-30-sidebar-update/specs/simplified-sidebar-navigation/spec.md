## ADDED Requirements

### Requirement: Repositories section removed from sidebar
The repositories section that previously displayed GitHub repositories as a sidebar list SHALL be removed to simplify the navigation structure.

#### Scenario: Repositories section is not displayed
- **WHEN** user opens the sidebar
- **THEN** the repositories section is not visible in the navigation

#### Scenario: Repository access via main navigation
- **WHEN** user needs to browse repositories
- **THEN** user can access repositories through the main "Repositories" navigation link (maintained in main navigation area)

### Requirement: Sidebar focus on project-scoped navigation
The sidebar SHALL prioritize navigation elements that provide context-specific value for the current project.

#### Scenario: Navigation items are project-relevant
- **WHEN** user views the sidebar
- **THEN** visible navigation items are: main nav (Dashboard, Issues, Projects, etc.), active project with project views, custom filters, and user profile menu

#### Scenario: No repository-specific UI
- **WHEN** user interacts with the sidebar
- **THEN** no repository fetch requests are made (existing repository API calls removed)

### Requirement: Improved vertical space utilization
The removal of the repositories section SHALL provide more vertical space for projects list and other navigation elements.

#### Scenario: More project list visibility
- **WHEN** user scrolls through sidebar projects
- **THEN** projects list takes up previously allocated space, improving usability for users with many projects

#### Scenario: Reduced scrolling needed
- **WHEN** sidebar has limited content
- **THEN** users with few projects do not need to scroll to see all navigation options
