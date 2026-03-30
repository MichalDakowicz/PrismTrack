## Why

The current sidebar layout contains multiple competing elements that reduce clarity and usability:
- Repository links clutter the sidebar without clear purpose in the context of project-scoped work
- Settings are difficult to discover and access
- Project switching is placed in the middle of the sidebar rather than prominently at the top

Consolidating and reorganizing these elements will create a clearer information hierarchy and improve navigation patterns.

## What Changes

- **Remove repository links** from the sidebar - repositories will no longer be displayed as a separate navigational element
- **Reposition project/workspace switcher** to the top of the sidebar (replace the select placeholder) for immediate visibility and access
- **Move settings access** to the user profile box at the bottom of the sidebar - clicking the user profile reveals settings options
- **Simplify sidebar structure** to focus on current project navigation and workspace-level actions

## Capabilities

### New Capabilities

- `top-positioned-project-switcher`: Project/workspace selector prominently placed at the top of the sidebar for quick switching between projects
- `profile-menu-settings-access`: Clickable user profile menu that provides access to application settings
- `simplified-sidebar-navigation`: Reorganized sidebar structure without repository links, focusing on project-scoped views

### Modified Capabilities

- `projects-core`: The project switcher component and its positioning/accessibility is changing to be top-positioned and more discoverable

## Impact

- **Frontend components affected**: `Sidebar.tsx`, `Layout.tsx`, potentially `ProjectContext.tsx`
- **User experience**: Navigation flows change - settings access moves to profile menu, project switching becomes more prominent
- **No API or backend changes** - this is purely UI/layout restructuring
- **Related to existing specs**: `projects-core` (project switching) and established sidebar navigation patterns
