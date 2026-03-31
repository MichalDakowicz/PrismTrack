# custom-filter-presets Specification

## Purpose
User-defined filter presets accessible from the sidebar for quick data scoping.

## ADDED Requirements

### Requirement: Sidebar displays custom filter buttons
The system SHALL display custom filter buttons in the sidebar under "Custom Filters" section.

#### Scenario: Display filter buttons
- **WHEN** user views the sidebar
- **THEN** the system SHALL display existing custom filter buttons (My Bugs, Urgent)

### Requirement: Clicking filter button scopes data
The system SHALL apply the corresponding filter when user clicks a custom filter button.

#### Scenario: Apply My Bugs filter
- **WHEN** user clicks "My Bugs" filter button
- **THEN** the system SHALL scope displayed issues to those with label "bug"
- **AND** the system SHALL indicate the filter is active (visual highlight)

#### Scenario: Apply Urgent filter
- **WHEN** user clicks "Urgent" filter button
- **THEN** the system SHALL scope displayed issues to those with label "urgent"
- **AND** the system SHALL indicate the filter is active (visual highlight)

### Requirement: Active filter can be cleared
The system SHALL allow users to clear the active filter.

#### Scenario: Clear active filter
- **WHEN** user clicks the active filter button again
- **THEN** the system SHALL remove the filter
- **AND** all issues SHALL be displayed again

### Requirement: Filter presets persist in localStorage
The system SHALL save custom filter presets to localStorage.

#### Scenario: Persist filter state
- **WHEN** user activates a custom filter
- **THEN** the system SHALL save the active filter ID to localStorage

#### Scenario: Restore filter state on reload
- **WHEN** user reloads the page
- **THEN** the system SHALL restore the previously active filter from localStorage
