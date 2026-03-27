## 1. Project Domain and State Foundations

- [x] 1.1 Add shared `Project` and repository-linking types in the client type model.
- [x] 1.2 Implement a project state layer (store/context/hooks) with create, update, list, and select operations.
- [x] 1.3 Add a project data service interface and in-memory/mock implementation compatible with future API replacement.

## 2. Projects Navigation and Discovery

- [x] 2.1 Add a Projects destination to primary sidebar navigation and command surface entries for project navigation.
- [x] 2.2 Build a Projects listing surface showing project metadata and linked repository summaries.
- [x] 2.3 Implement open/select project behavior that sets active project context globally.

## 3. Project Detail Context and View Scoping

- [x] 3.1 Add project detail shell/context that exposes Board, List, Timeline, Activity, and Pulse entry points.
- [x] 3.2 Ensure active project context persists while switching among project-scoped views.
- [x] 3.3 Implement standardized loading and empty states for project-scoped views when data is unavailable.

## 4. Multi-Repo Linking and Data Filtering

- [x] 4.1 Add UI/state support to link and unlink repositories on a project.
- [x] 4.2 Implement shared selectors/utilities that scope issues to repositories linked to the active project.
- [x] 4.3 Implement shared selectors/utilities that scope pull requests to repositories linked to the active project.
- [x] 4.4 Add deterministic handling for unlinked repositories and zero-linked-repository project states.

## 5. Integration, Validation, and Hardening

- [x] 5.1 Add tests for project lifecycle operations (create, update, select) and provider contract stability.
- [x] 5.2 Add integration tests for Projects navigation and active-project propagation across scoped views.
- [x] 5.3 Add tests for repository-linked issue/PR filtering and empty-state behavior.
- [x] 5.4 Run app verification and resolve regressions introduced by new routing/state wiring.

## 6. Sidebar Schema and Project Management Extensions

- [x] 6.1 Implement sidebar navigation schema sections for My Issues, Projects, Pull Requests, Branches, Repositories, and Settings groups.
- [x] 6.2 Add per-project quick navigation shortcuts in the sidebar for Board, List, Timeline, Activity, and Pulse.
- [x] 6.3 Add project delete support end-to-end (service, context, API route, repository implementations).
- [x] 6.4 Add additional project actions beyond create/view (archive/restore toggle and direct settings access).
- [x] 6.5 Add placeholder routes for schema-defined sections not yet fully implemented and validate via lint/tests.
