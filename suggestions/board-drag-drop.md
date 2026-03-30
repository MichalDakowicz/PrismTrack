# Board Drag and Drop

## Overview
Implement drag and drop functionality on the Kanban board to move issues between columns.

## Motivation
The board view currently shows issues in columns but doesn't allow reordering or moving issues between columns.

## Implementation Notes

### Column Logic (Current)
```
Backlog:     open issues with no labels
In Progress: open issues with labels
Done:        closed issues
```

### Drag & Drop Behavior
- Drag issues between columns
- Visual feedback during drag (ghost, drop zone highlight)
- Update issue state when moved to Done column
- Persist column assignment (e.g., via labels)

### Potential Enhancements
- Reorder within columns
- Quick-add to specific column
- Column WIP limits
- Automation triggers (e.g., move to Done → close issue)

## Priority
MEDIUM-HIGH - Makes the kanban functional

## Technical Considerations
Consider using a library like `@dnd-kit/core` for accessible drag and drop.
