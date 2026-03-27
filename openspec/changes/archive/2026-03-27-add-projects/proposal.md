## Why

PrismTrack's navigation and product model define Projects as a first-class concept, but the current implementation does not fully support project-scoped workflows. Adding Projects now is necessary to unlock board/list/timeline/activity organization and to align the product with the documented GitHub-native multi-repo model.

## What Changes

- Introduce a first-class Project domain model in the application state and UI navigation.
- Add a Projects surface where users can view and switch between projects.
- Add project detail context with project-scoped views (Board, List, Timeline, Activity, Pulse) and repository association metadata.
- Add project-aware filtering so issues and pull requests can be viewed in the context of the selected project.
- Add basic project management operations in the client layer (create/update/select) with integration points for future backend sync.

## Capabilities

### New Capabilities
- `projects-core`: First-class project entity and project selection/navigation flows.
- `project-scoped-views`: Project detail context powering Board, List, Timeline, Activity, and Pulse entry points.
- `multi-repo-project-linking`: Project-to-repository linking metadata and project-aware filtering behavior.

### Modified Capabilities
- None.

## Impact

- Affected code: app routing/view composition, sidebar/navigation components, project and issue/PR view models, shared types.
- APIs/systems: client-side data contracts for projects and repository linkage; future compatibility surface for GitHub-backed project sync.
- Dependencies: no mandatory new external dependencies for the initial iteration; existing React/TypeScript stack remains.
