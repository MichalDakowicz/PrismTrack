## Why

Multiple settings routes currently render placeholders, which blocks core workspace administration workflows and makes the product feel incomplete. This should be implemented now to support identity management, member administration, GitHub integration setup, and notification preferences from within the app.

## What Changes

- Implement complete settings pages for workspace, GitHub App, members, and notifications under existing settings routes.
- Replace placeholder UI with structured forms, lists, and management actions tailored to each settings domain.
- Add client-side state handling and validation for settings interactions (for example invite emails, role changes, and notification toggles).
- Add tests covering route rendering and key settings interactions.

## Capabilities

### New Capabilities
- `settings-pages`: Provides functional settings pages for workspace identity and danger actions, GitHub App integration controls, member and invitation management, and notification preferences.

### Modified Capabilities
- `profile-menu-settings-access`: Expands settings route expectations so settings menu destinations must open functional pages rather than placeholders.

## Impact

- Affected UI/views: settings route views and related reusable form/list components in src.
- Affected state layer: settings page local state and any shared settings-related context/hooks.
- Affected tests: add or update view/component tests for settings route behavior and interactions.
- No backend or API contract changes required for this initial implementation scope.
