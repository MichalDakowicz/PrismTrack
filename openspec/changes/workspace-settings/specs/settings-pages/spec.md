## ADDED Requirements

### Requirement: Workspace settings page provides identity and safety controls
The system SHALL provide a workspace settings page at /settings/workspace with editable workspace identity fields, workspace description management, and a protected workspace deletion action.

#### Scenario: Workspace identity is editable
- **WHEN** user opens the workspace settings page
- **THEN** the page displays editable fields for workspace name, slug, and avatar source

#### Scenario: Workspace description is managed
- **WHEN** user updates the workspace description and saves changes
- **THEN** the page applies the updated description in the current settings state

#### Scenario: Workspace deletion requires explicit confirmation
- **WHEN** user initiates workspace deletion from the danger zone
- **THEN** the system requires explicit confirmation before the deletion action can proceed

### Requirement: GitHub App settings page provides integration management controls
The system SHALL provide a GitHub App settings page at /settings/github-app with installation status visibility, repository permission management controls, and webhook configuration inputs.

#### Scenario: Installation status is visible
- **WHEN** user opens the GitHub App settings page
- **THEN** the page shows current GitHub App installation status

#### Scenario: Repository permissions are configurable
- **WHEN** user changes repository permission controls
- **THEN** the page updates permission selections in settings state

#### Scenario: Webhook settings are editable
- **WHEN** user edits webhook configuration fields and saves
- **THEN** the page applies webhook values in current settings state

### Requirement: Members settings page supports membership and invitation workflows
The system SHALL provide a members settings page at /settings/members with a member list, role management actions, invite workflow, and pending invitation visibility.

#### Scenario: Member list includes role data
- **WHEN** user opens the members settings page
- **THEN** the page displays members with their assigned roles

#### Scenario: Member role can be changed
- **WHEN** user updates a member role to admin, member, or viewer
- **THEN** the page applies the role change in member settings state

#### Scenario: New member invite is created
- **WHEN** user submits a valid invite on the members page
- **THEN** the invite appears in pending invitations

#### Scenario: Pending invitations are visible
- **WHEN** there are pending invitations
- **THEN** the members page displays each pending invitation with status information

### Requirement: Notifications settings page supports channel and event preferences
The system SHALL provide a notifications settings page at /settings/notifications with notification channel preferences, per-event toggle controls, and email digest settings.

#### Scenario: Channel preferences are configurable
- **WHEN** user enables or disables notification channels
- **THEN** the page applies channel preference changes in notification settings state

#### Scenario: Event notification toggles are configurable
- **WHEN** user updates per-event notification toggles
- **THEN** the page applies event-level preference changes in notification settings state

#### Scenario: Email digest settings are configurable
- **WHEN** user selects and saves an email digest option
- **THEN** the page applies the selected digest preference in notification settings state

### Requirement: Settings routes render functional pages instead of placeholders
The system SHALL render functional settings interfaces for workspace, GitHub App, members, and notifications routes instead of placeholder-only content.

#### Scenario: Workspace route renders functional controls
- **WHEN** user navigates to /settings/workspace
- **THEN** the route renders workspace settings controls and not placeholder text

#### Scenario: GitHub App route renders functional controls
- **WHEN** user navigates to /settings/github-app
- **THEN** the route renders GitHub App settings controls and not placeholder text

#### Scenario: Members route renders functional controls
- **WHEN** user navigates to /settings/members
- **THEN** the route renders members settings controls and not placeholder text

#### Scenario: Notifications route renders functional controls
- **WHEN** user navigates to /settings/notifications
- **THEN** the route renders notifications settings controls and not placeholder text
