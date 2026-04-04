## MODIFIED Requirements

### Requirement: Settings menu contains settings links
The user profile menu SHALL provide access to all application settings that were previously displayed as separate sidebar links, and each destination route SHALL render a functional settings page rather than placeholder-only content.

#### Scenario: Settings options are available in menu
- **WHEN** user opens the profile menu
- **THEN** the menu displays options for Workspace, GitHub App, Members, and Notifications settings

#### Scenario: User navigates to settings
- **WHEN** user clicks a settings option in the profile menu
- **THEN** the application navigates to the corresponding settings page

#### Scenario: Destination settings page is functional
- **WHEN** user navigates to any settings destination from the profile menu
- **THEN** the destination route renders interactive controls relevant to that settings area instead of placeholder-only content
