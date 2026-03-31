# issue-detail-sidebar Specification

## Purpose
Right-side slide-in panel for viewing GitHub issue details without navigating away from the current view.

## ADDED Requirements

### Requirement: Panel opens when clicking an issue
The system SHALL display an issue detail panel when user clicks on an issue in IssuesList, Board, or Dashboard views.

#### Scenario: Open panel from IssuesList
- **WHEN** user clicks on an issue title or row in IssuesList
- **THEN** the system SHALL display a right-side panel with full issue details
- **AND** the system SHALL NOT navigate away from the IssuesList view

#### Scenario: Open panel from Board
- **WHEN** user clicks on an issue card in Board view
- **THEN** the system SHALL display a right-side panel with full issue details
- **AND** the system SHALL NOT navigate away from the Board view

#### Scenario: Open panel from Dashboard
- **WHEN** user clicks on an issue in My Issues section
- **THEN** the system SHALL display a right-side panel with full issue details

### Requirement: Panel displays complete issue information
The system SHALL display all relevant issue information in the detail panel.

#### Scenario: Show issue metadata
- **WHEN** the panel is open for an issue
- **THEN** the system SHALL display: title, body/description, state, author, labels, assignees, milestone, repository, created date, updated date

#### Scenario: Show issue labels with colors
- **WHEN** the panel displays labels for an issue
- **THEN** the system SHALL render each label with its configured color

### Requirement: Panel can be closed
The system SHALL allow users to close the detail panel.

#### Scenario: Close panel via X button
- **WHEN** user clicks the close (X) button in the panel header
- **THEN** the system SHALL hide the panel

#### Scenario: Close panel via Escape key
- **WHEN** user presses the Escape key while panel is open
- **THEN** the system SHALL hide the panel

#### Scenario: Close panel by clicking backdrop
- **WHEN** user clicks outside the panel (on the backdrop)
- **THEN** the system SHALL hide the panel

### Requirement: Panel supports quick state changes
The system SHALL allow users to close or reopen issues from the detail panel.

#### Scenario: Close issue from panel
- **WHEN** user clicks the "Close issue" button in the panel
- **THEN** the system SHALL send a PATCH request to update issue state to "closed"
- **AND** the panel SHALL update to reflect the new state

#### Scenario: Reopen issue from panel
- **WHEN** user clicks the "Reopen issue" button in the panel
- **THEN** the system SHALL send a PATCH request to update issue state to "open"
- **AND** the panel SHALL update to reflect the new state

### Requirement: Panel opens in external link mode
The system SHALL provide a way to open the issue in GitHub for full editing.

#### Scenario: Open in GitHub
- **WHEN** user clicks the "Open in GitHub" button in the panel
- **THEN** the system SHALL open the issue URL in a new browser tab
