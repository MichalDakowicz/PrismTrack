## 1. Issue Detail Panel - Core Infrastructure

- [x] 1.1 Create `useSidebar` context hook for panel state management
- [x] 1.2 Create `SidebarContext` provider with open/close state and selected issue
- [x] 1.3 Create base `IssueDetailPanel.tsx` component with slide-in animation
- [x] 1.4 Add backdrop overlay that closes panel on click
- [x] 1.5 Implement keyboard handling (Escape to close)

## 2. Issue Detail Panel - Content Display

- [x] 2.1 Display issue title, state badge, and repository info
- [x] 2.2 Display issue body/description with markdown support
- [x] 2.3 Display labels with colored badges
- [x] 2.4 Display author avatar and username
- [ ] 2.5 Display assignees section
- [ ] 2.6 Display milestone if present
- [x] 2.7 Display created and updated dates
- [x] 2.8 Add "Open in GitHub" external link button

## 3. Issue Detail Panel - Actions

- [x] 3.1 Add Close Issue button with API integration
- [x] 3.2 Add Reopen Issue button with API integration
- [x] 3.3 Add loading and error states for actions
- [x] 3.4 Show success/error notifications

## 4. Integrate Panel with Views

- [x] 4.1 Update IssuesList to open panel instead of external link
- [x] 4.2 Update Board to open panel instead of external link
- [x] 4.3 Update Dashboard to open panel instead of external link
- [x] 4.4 Add panel to Layout or App component

## 5. Unified Sort/Filter Component

- [x] 5.1 Create `SortFilterPopover` reusable component
- [x] 5.2 Define sort options (Newest, Oldest, Recently Updated, Least Recently Updated)
- [x] 5.3 Implement sort state management
- [x] 5.4 Connect to IssuesList Sort button
- [x] 5.5 Connect to PullRequests Sort button

## 6. Custom Filter Presets

- [x] 6.1 Create `useFilterPresets` hook with localStorage persistence
- [x] 6.2 Update Sidebar filter buttons to use filter state
- [x] 6.3 Implement "My Bugs" filter (label: bug)
- [x] 6.4 Implement "Urgent" filter (label: urgent)
- [x] 6.5 Add visual active state to filter buttons
- [x] 6.6 Allow toggling off active filter

## 7. Board Enhancements

- [x] 7.1 Connect "ADD ISSUE" button to open CreateIssueModal
- [x] 7.2 Add column MoreHorizontal menu with placeholder options
