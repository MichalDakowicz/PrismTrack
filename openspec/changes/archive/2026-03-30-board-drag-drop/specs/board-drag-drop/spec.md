## ADDED Requirements

### Requirement: User can drag issues between columns
The system SHALL allow users to drag any issue card from one column and drop it into another column on the Kanban board.

#### Scenario: Drag issue from Backlog to In Progress
- **WHEN** user clicks and holds an issue card in the Backlog column
- **THEN** system displays a draggable ghost element following the cursor
- **AND** the source column highlights the drop zone
- **WHEN** user releases the issue over the In Progress column
- **THEN** the issue moves to the In Progress column
- **AND** the issue receives a label to persist the column assignment

#### Scenario: Drag issue from In Progress to Done
- **WHEN** user drags an issue from In Progress to Done column
- **THEN** the issue appears in the Done column
- **AND** the issue state is changed to "closed" on GitHub

#### Scenario: Drag issue from Done back to Backlog
- **WHEN** user drags an issue from Done to Backlog column
- **THEN** the issue appears in the Backlog column
- **AND** the issue state is changed to "open" on GitHub

### Requirement: Visual feedback during drag operations
The system SHALL provide clear visual feedback during drag operations to indicate valid drop targets.

#### Scenario: Dragging over a valid column
- **WHEN** user drags an issue over a column
- **THEN** the column background highlights to indicate it is a valid drop target

#### Scenario: Dragging an issue
- **WHEN** user initiates a drag on an issue card
- **THEN** the cursor changes to "grabbing"
- **AND** the original position shows a placeholder or reduced opacity

### Requirement: Column assignment persists across sessions
The system SHALL persist the column assignment for each issue so that it is preserved when the user refreshes or returns to the board.

#### Scenario: Refresh page after moving issue
- **WHEN** user moves an issue to a different column
- **AND** refreshes the browser
- **THEN** the issue appears in the new column based on its persisted state

### Requirement: Optimistic UI updates
The system SHALL update the UI immediately when an issue is dropped, then persist to GitHub in the background.

#### Scenario: Move succeeds
- **WHEN** user drops an issue in a new column
- **THEN** the UI updates immediately to show the issue in the new column
- **AND** the system sends the update to GitHub in the background

#### Scenario: Move fails
- **WHEN** user drops an issue in a new column
- **AND** the GitHub API call fails
- **THEN** the UI reverts to show the issue in the original column
- **AND** an error notification is displayed to the user
