## Context

The current Sidebar component (src/components/Sidebar.tsx) organizes navigation in the following order:
1. User info header with login
2. Main navigation items (Dashboard, Issues, Projects, PRs, etc.)
3. Projects list (with project views when a project is active)
4. Repositories section (GitHub repos list)
5. Custom Filters
6. Settings links (Workspace, GitHub App, Members, Notifications)
7. User profile footer (with logout)

The component uses React Router for navigation, Lucide React icons, and the ProjectContext for project data.

**Related components:**
- `Layout.tsx`: Contains overall page structure
- `ProjectContext.tsx`: Manages active project state and project list
- `AuthContext.tsx`: Manages user authentication

Current limitations:
- Settings links are visually mixed with other navigation items
- Repositories section uses space without providing context-specific value
- Project switching requires scrolling to find the Projects section
- User profile at the bottom is non-interactive beyond logout

## Goals / Non-Goals

**Goals:**
- Move project switcher to the top of the sidebar for immediate visibility
- Create an interactive user profile menu to house settings access
- Remove the repositories section to reduce sidebar clutter
- Maintain existing navigation items and project views functionality
- Keep the same visual styling and theming system

**Non-Goals:**
- Redesigning the overall color scheme or typography
- Adding new navigation items beyond repositioning existing ones
- Implementing repository filtering or search (repositories will be removed entirely)
- Changing authentication or project context logic
- Modifying any backend APIs

## Decisions

### 1. Project Switcher Positioning
**Decision**: Move project switcher to a new dedicated section at the top of the sidebar, immediately below the header.

**Rationale**: Project switching is a frequent action. Placing it at the top reduces cognitive load and interaction time. This follows the principle of "frequently used items first."

**Alternatives Considered**:
- Keep in middle with enhanced styling: Doesn't address prominence issue or reduce scroll-to-find friction
- Replace header with project switcher: Would lose user context, breaking the user-focused header design
- Use a dropdown in the header: Space-constrained and less discoverable than a full section

**Implementation approach**:
- Create a new `ProjectSwitcher` component or section in sidebar
- Display current project prominently with a list of available projects below
- Use same styling as current project links but enhance visual hierarchy
- Position between header and main navigation

### 2. Settings Access via User Profile Menu
**Decision**: Convert the bottom user profile bar into an interactive dropdown menu containing settings links.

**Rationale**: User profile is a natural location for settings (common pattern in many applications). This completes a related task cluster and frees up vertical sidebar space.

**Alternatives Considered**:
- Keep settings in navigation but hide under a collapsible section: Adds complexity without clarity benefit
- Move to a top menu: Inconsistent with standard app patterns
- Create a separate settings icon in the header: Duplicates user profile menu pattern

**Implementation approach**:
- Convert user profile div to a button with hover/active states
- Add a dropdown menu (similar to project or navigation items) that appears on click
- Move existing settings links (Workspace, GitHub App, Members, Notifications) into the menu
- Include logout action in the menu as well
- Use a small icon indicator (e.g., ChevronUp) to show menu state

### 3. Repository Section Removal
**Decision**: Remove the entire "Repositories" section from the sidebar.

**Rationale**: According to project-scoped navigation model, repositories are not a primary navigation target. The "Repositories" nav item already exists in main navigation for anyone needing to browse repos. The sidebar list becomes redundant and takes valuable vertical space.

**Allocation**: The freed space will improve scrollability for project list and other sections.

**Impact**: Users will still access repositories via the main "Repositories" nav link in the main navigation area.

## Risks / Trade-offs

**[Risk]** Users who relied on quick repository access in sidebar → **Mitigation**: Repositories are still accessible via main navigation; can add tooltip or help docs noting the change

**[Risk]** Complex interaction state management when toggling settings menu → **Mitigation**: Use simple boolean state or React hooks; keep interaction to single click

**[Risk]** Settings menu width/overflow on small screens → **Mitigation**: Test at various screen sizes; use ellipsis and tooltips for long labels if needed

**[Trade-off]** Reduced vertical space by removing repositories section vs. simpler UI. **Accept**: Benefit of clarity and focus outweighs the lost space.

## Migration Plan

1. **Create new components/sections**:
   - Refactor header to be smaller or accommodate project switcher  
   - Create ProjectSwitcher component or section
   - Create UserProfileMenu component with dropdown

2. **Update Sidebar.tsx**:
   - Remove repositories fetch and render section
   - Add project switcher section below header
   - Replace bottom user profile with interactive menu

3. **Testing**:
   - Verify project switching works correctly with ProjectContext
   - Test menu open/close with click handling
   - Check responsive behavior on smaller screens

4. **Deployment**:
   - No database or backend changes needed
   - Frontend-only update - can deploy directly
   - No rollback complications

## Open Questions

1. Should the project switcher show a search/filter if project list is long (10+ projects)?
2. Should the dropdown menu have keyboard accessibility (arrow keys, escape)?
3. Do we want to keep the logout button in the profile menu or offer a separate logout action?
4. Should the user profile menu close automatically when clicking a settings link, or stay open?
