## Context

Currently, clicking on issues in IssuesList, Board, and Dashboard opens the issue in GitHub (external). This disrupts the workflow and prevents users from performing quick actions without leaving the app. Additionally, several buttons (Sort, Add Issue, Custom Filters, column More) are non-functional placeholders.

The app uses React with TypeScript, Tailwind CSS for styling, Framer Motion for animations, and React Router for navigation.

## Goals / Non-Goals

**Goals:**
- Add a right-side slide-in panel for viewing issue details without navigation
- Connect all non-functional buttons to their intended behaviors
- Maintain consistent UI/UX patterns across views
- Ensure panel is accessible (keyboard nav, focus trap)

**Non-Goals:**
- Full issue editing capabilities (close/reopen is sufficient for v1)
- Real-time sync with GitHub (polling on panel open is acceptable)
- Mobile-optimized sidebar (desktop-first approach)

## Decisions

### 1. Sidebar Implementation
**Decision:** Create a reusable `IssueDetailPanel` component with a context-based open/close state.

**Rationale:** Multiple views (IssuesList, Board, Dashboard) need the same panel behavior. A context provider allows any component to trigger the panel with an issue object.

**Alternative considered:** Props drilling or Zustand store - Context is simpler for this scope without adding a new state library.

### 2. Panel Animation
**Decision:** Use Framer Motion's `AnimatePresence` for slide-in from right.

**Rationale:** App already uses Framer Motion. Consistent animation approach across modals, notifications, and panels.

### 3. Data Fetching
**Decision:** Fetch full issue details (including body, comments) when panel opens.

**Rationale:** Issue list only shows title, state, labels. Detail panel needs body markdown, assignee, milestone, etc.

### 4. Sort/Filter UI
**Decision:** Create a reusable `SortFilterPopover` component.

**Rationale:** Both IssuesList and PullRequests need similar Sort functionality. Shared component ensures consistency.

### 5. Custom Filters
**Decision:** Store filter presets in localStorage with useState.

**Rationale:** No backend API exists for filters. localStorage is sufficient for user-specific presets.

## Risks / Trade-offs

**[Risk]** Panel may cover important content on smaller screens  
→ **Mitigation:** Add responsive breakpoint at 1024px, below that show as modal instead

**[Risk]** Multiple API calls when rapidly switching between issues  
→ **Mitigation:** Debounce API calls or cache recently viewed issues in component state

**[Risk]** Sidebar state might conflict with other modals  
→ **Mitigation:** Ensure z-index stacking and backdrop behavior is consistent

## Open Questions

1. Should the panel support editing issue title/description inline?
2. Do we need to support viewing PR details with the same panel pattern?
3. Should filter presets sync across browser sessions (would need to move from localStorage)?
