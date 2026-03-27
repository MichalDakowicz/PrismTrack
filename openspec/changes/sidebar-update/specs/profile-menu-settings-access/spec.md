## ADDED Requirements

### Requirement: User profile menu on sidebar footer
The user profile section at the bottom of the sidebar SHALL be interactive, opening a dropdown menu on click to access user-related actions and settings.

#### Scenario: User profile is clickable
- **WHEN** user clicks on the user profile at the bottom of the sidebar
- **THEN** a dropdown menu appears with available options

#### Scenario: Menu closes on click outside
- **WHEN** user clicks outside the open profile menu
- **THEN** the menu closes and user profile button returns to default state

### Requirement: Settings menu contains settings links
The user profile menu SHALL provide access to all application settings that were previously displayed as separate sidebar links.

#### Scenario: Settings options are available in menu
- **WHEN** user opens the profile menu
- **THEN** the menu displays options for Workspace, GitHub App, Members, and Notifications settings

#### Scenario: User navigates to settings
- **WHEN** user clicks a settings option in the profile menu
- **THEN** the application navigates to the corresponding settings page

### Requirement: Logout functionality in profile menu
The logout action SHALL be accessible from the user profile menu, combining user-related actions in a single location.

#### Scenario: Logout option is in menu
- **WHEN** user opens the profile menu
- **THEN** a logout action is displayed (either as a menu item or button)

#### Scenario: User logs out
- **WHEN** user clicks the logout action in the profile menu
- **THEN** user is logged out and redirected to the login page
