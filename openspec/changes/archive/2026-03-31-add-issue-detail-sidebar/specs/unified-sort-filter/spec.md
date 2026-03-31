# unified-sort-filter Specification

## Purpose
Consistent sorting and filtering UI across IssuesList and PullRequests views.

## ADDED Requirements

### Requirement: Sort button opens sort options popover
The system SHALL display a popover with sorting options when user clicks the Sort button.

#### Scenario: Open sort popover in IssuesList
- **WHEN** user clicks the Sort button in IssuesList header
- **THEN** the system SHALL display a popover below the button
- **AND** the popover SHALL contain sort options: Newest, Oldest, Recently Updated, Least Recently Updated

#### Scenario: Open sort popover in PullRequests
- **WHEN** user clicks the Sort button in PullRequests header
- **THEN** the system SHALL display a popover below the button
- **AND** the popover SHALL contain sort options: Newest, Oldest, Recently Updated, Least Recently Updated

### Requirement: Sort option applies to list
The system SHALL reorder the displayed list when user selects a sort option.

#### Scenario: Apply sort by Newest
- **WHEN** user selects "Newest" from sort options
- **THEN** the system SHALL reorder items by created_at descending
- **AND** the first item SHALL be the most recently created

#### Scenario: Apply sort by Oldest
- **WHEN** user selects "Oldest" from sort options
- **THEN** the system SHALL reorder items by created_at ascending
- **AND** the first item SHALL be the oldest

### Requirement: Sort preference persists during session
The system SHALL remember the selected sort option during the current page session.

#### Scenario: Sort preference maintained on re-render
- **WHEN** user selects a sort option
- **AND** the component re-renders
- **THEN** the system SHALL maintain the selected sort option

### Requirement: Popover closes on selection
The system SHALL close the sort popover after user selects an option.

#### Scenario: Popover closes after selection
- **WHEN** user clicks a sort option
- **THEN** the system SHALL close the popover
- **AND** the system SHALL apply the selected sort
