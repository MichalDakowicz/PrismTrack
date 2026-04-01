## Why

The Branches view currently lacks an in-context way to inspect branch metadata and related status without leaving the page, which slows comparison and decision-making. Adding a detail sidebar now improves branch triage workflows and aligns the Branches experience with the rest of PrismTrack's detail-first UI patterns.

## What Changes

- Add a right-side branch detail sidebar in the Branches view that opens when a branch row/card is selected.
- Display branch-specific metadata in the sidebar (name, repository, default/protected indicators, updated time, and branch status signals).
- Support explicit open/close behavior for the sidebar, including close action and selection changes.
- Ensure responsive behavior so branch details remain accessible and usable on smaller viewports.
- Preserve existing branch list behavior while adding detail-sidebar interactions.

## Capabilities

### New Capabilities
- `branches-detail-sidebar`: Adds interactive branch selection and a detail sidebar for viewing branch metadata and status in context.

### Modified Capabilities
- None.

## Impact

- Affected frontend views/components: Branches view and related branch list/detail presentation components under src/views and src/components.
- Potential updates to shared layout/styling for sidebar spacing and responsive behavior.
- No backend API or database schema changes expected.
- Requires new/updated tests for sidebar visibility, selection state, and responsive interaction behavior.
