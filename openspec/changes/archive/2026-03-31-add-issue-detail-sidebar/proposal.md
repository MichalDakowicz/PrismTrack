## Why

Users need to view and interact with issue details without leaving the app. Currently, clicking issues opens them externally in GitHub, breaking the workflow. Additionally, several UI buttons are non-functional, creating a fragmented user experience.

## What Changes

1. **Add right-side issue detail panel** - A slide-in panel showing full issue details without leaving the current view
2. **Connect Sort buttons** - Link Sort buttons in IssuesList and PullRequests views to appropriate filter/sort modals
3. **Connect Board "ADD ISSUE" button** - Open the CreateIssueModal when clicked
4. **Connect Sidebar Custom Filters** - Make filter buttons functional by scoping data
5. **Connect column MoreHorizontal button** - Add column actions menu (rename, delete, etc.)

## Capabilities

### New Capabilities
- `issue-detail-sidebar`: Right-side panel component for viewing and interacting with issue details inline
- `unified-sort-filter`: Consistent sorting and filtering UI across list views
- `custom-filter-presets`: Save and apply custom filter configurations from sidebar

### Modified Capabilities
- (none)

## Impact

- New component: `IssueDetailPanel.tsx` in src/components/
- Modified views: `IssuesList.tsx`, `PullRequests.tsx`, `Board.tsx`, `Dashboard.tsx`, `Sidebar.tsx`
- New hook: `useSidebar.ts` for sidebar state management
