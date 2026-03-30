## 1. Remove Repository Section

- [x] 1.1 Remove repositories fetch logic from Sidebar.tsx
- [x] 1.2 Remove repositories state management (`repos` state and `useEffect`)
- [x] 1.3 Remove repositories section JSX from sidebar render
- [x] 1.4 Remove unused `Repository` type import

## 2. Create Project Switcher Component

- [x] 2.1 Create new ProjectSwitcher component in src/components/
- [x] 2.2 Extract project list rendering logic into ProjectSwitcher
- [x] 2.3 Implement current project display with visual distinction
- [x] 2.4 Add project selection/navigation functionality
- [x] 2.5 Apply consistent styling to match sidebar aesthetics

## 3. Refactor Sidebar Top Section

- [x] 3.1 Move ProjectSwitcher to appear below header in Sidebar
- [x] 3.2 Ensure project context is properly passed to ProjectSwitcher
- [x] 3.3 Test that active project state updates correctly
- [x] 3.4 Verify project navigation works from new top position

## 4. Create User Profile Menu Component

- [x] 4.1 Create new UserProfileMenu component in src/components/
- [x] 4.2 Convert static user profile footer to interactive button
- [x] 4.3 Implement dropdown menu state management (open/close)
- [x] 4.4 Add click-outside handler to close menu
- [x] 4.5 Add keyboard support (escape to close) if needed

## 5. Move Settings to Profile Menu

- [x] 5.1 Add settings links to UserProfileMenu (Workspace, GitHub App, Members, Notifications)
- [x] 5.2 Format settings options in dropdown with icons and labels
- [x] 5.3 Add navigate functionality for settings links
- [x] 5.4 Remove settings links from main sidebar navigation area
- [x] 5.5 Move logout action into UserProfileMenu

## 6. Update Sidebar Structure

- [x] 6.1 Replace old user profile footer with UserProfileMenu component
- [x] 6.2 Remove settingsLinks array from Sidebar.tsx
- [x] 6.3 Verify Projects section still displays correctly
- [x] 6.4 Verify Custom Filters section still displays correctly
- [x] 6.5 Verify main navigation items still functional

## 7. Test and Polish

- [x] 7.1 Test project switching from top position
- [x] 7.2 Test profile menu open/close interactions
- [x] 7.3 Test navigation to settings pages from menu
- [x] 7.4 Test logout functionality
- [x] 7.5 Test responsive behavior on smaller screens
- [x] 7.6 Test keyboard navigation and accessibility
- [x] 7.7 Verify no console errors or warnings
