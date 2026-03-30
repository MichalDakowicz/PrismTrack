## Why

The Kanban board view in PrismTrack currently displays issues organized into columns (Backlog, In Progress, Done) based on issue state and labels, but users cannot interact with these columns to move issues between them. This limits the board's utility as a task management tool. Adding drag and drop functionality will transform the board from a passive display into an interactive workflow tool.

## What Changes

- Implement drag and drop functionality allowing users to move issues between Backlog, In Progress, and Done columns
- Add visual feedback during drag operations (ghost element, drop zone highlighting)
- Persist column assignments by updating issue state/labels when moved between columns
- Automatically close issues when moved to the Done column

## Capabilities

### New Capabilities
- `board-drag-drop`: Enable drag and drop interaction on the Kanban board to move issues between columns with visual feedback and persisted state changes

### Modified Capabilities
- (none - no existing spec requirements change)

## Impact

- **Frontend**: Modify `src/views/Board.tsx` to add drag and drop behavior using `@dnd-kit/core`
- **Backend**: May need API endpoint to update issue labels/state when moved
- **Dependencies**: Add `@dnd-kit/core` and `@dnd-kit/sortable` packages for accessible drag and drop
