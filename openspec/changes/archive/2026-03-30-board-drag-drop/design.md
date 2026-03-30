## Context

The current Board view in `src/views/Board.tsx` displays issues in three columns (Backlog, In Progress, Done) based on GitHub issue state and labels. The columns are computed client-side:
- Backlog: open issues with no labels
- In Progress: open issues with labels
- Done: closed issues

There is currently no interactivity - users can only view issues and click to open them on GitHub.

## Goals / Non-Goals

**Goals:**
- Enable drag and drop of issues between columns
- Provide visual feedback during drag operations
- Persist column assignments to GitHub (via labels)
- Automatically close issues when moved to Done column

**Non-Goals:**
- Reordering issues within a column (future enhancement)
- WIP limits on columns (future enhancement)
- Moving multiple issues at once (bulk operations)

## Decisions

### 1. Use @dnd-kit/core for drag and drop
**Chosen:** @dnd-kit/core with @dnd-kit/sortable

**Alternatives considered:**
- react-beautiful-dnd: No longer maintained
- react-dnd: Steeper learning curve, more boilerplate
- Native HTML5 drag and drop: Less accessible, more code to write

**Rationale:** @dnd-kit provides better accessibility, modular architecture, and is actively maintained. The sortable preset makes column reordering straightforward.

### 2. Persist column assignments via labels
**Chosen:** Use a special label to track column assignment

**Alternatives considered:**
- Store in local storage only: Doesn't persist across devices
- Use GitHub Projects API: More complex, requires additional auth
- Create custom backend storage: Overkill for this feature

**Rationale:** Using labels is simple, persists to GitHub, and aligns with current column logic which already uses labels to determine "In Progress" state. A label like "status:backlog", "status:in-progress", "status:done" can track explicit column assignments while preserving backward compatibility.

### 3. Use optimistic UI updates
**Chosen:** Update UI immediately, revert on API failure

**Rationale:** Provides instant feedback. The drag operation completes visually, then the API call happens in background. If it fails, show error and revert.

## Risks / Trade-offs

**[Risk]** GitHub API rate limiting during bulk moves
→ **Mitigation:** Implement debounce for rapid drags, show loading state during API calls

**[Risk]** Conflicts between explicit label-based column and computed column logic
→ **Mitigation:** Explicit labels take precedence; when dragging, add/remove appropriate label

**[Risk]** Drag feedback may be janky with many issues
→ **Mitigation:** Use virtualization if >100 issues per column; otherwise should be fine

## Migration Plan

1. Add @dnd-kit packages to package.json
2. Wrap Board.tsx with DndContext
3. Create Column components with Droppable
4. Create IssueCard components with Draggable
5. Add API endpoint to update issue labels
6. Test drag operations with real GitHub API

## Open Questions

- Should we support reordering within columns? (Deferred to future)
- Should moving to Done close the issue or just add a "done" label? (Proposal says close, but may want to ask user preference)
