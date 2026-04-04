## 1. Route And State Foundation

- [x] 1.1 Audit current settings route components and replace placeholder entry points for workspace, GitHub App, members, and notifications pages.
- [x] 1.2 Define local state models for workspace identity, GitHub app controls, member roles and invites, and notification preferences.
- [x] 1.3 Add shared settings UI primitives only where they reduce repetition without coupling unrelated page logic.

## 2. Workspace Settings Implementation

- [x] 2.1 Implement workspace identity form fields for name, slug, and avatar source.
- [x] 2.2 Implement workspace description editing with save action and in-page state updates.
- [x] 2.3 Implement a danger zone section with explicit confirmation flow for workspace deletion.

## 3. GitHub App Settings Implementation

- [x] 3.1 Implement GitHub App installation status panel.
- [x] 3.2 Implement repository permission controls with editable state handling.
- [x] 3.3 Implement webhook configuration fields and save interaction messaging.

## 4. Members Settings Implementation

- [x] 4.1 Implement members table with role display and per-member role update controls.
- [x] 4.2 Implement invite member workflow with email validation and add-to-pending behavior.
- [x] 4.3 Implement pending invitations section with status display.

## 5. Notifications Settings Implementation

- [x] 5.1 Implement notification channel preference toggles.
- [x] 5.2 Implement per-event notification toggle matrix.
- [x] 5.3 Implement email digest preference selector and save interaction.

## 6. Navigation And Functional Readiness Alignment

- [x] 6.1 Ensure profile menu settings links navigate to the updated functional settings routes.
- [x] 6.2 Verify each settings route renders interactive controls rather than placeholder-only content.

## 7. Testing And Verification

- [x] 7.1 Add or update route-level tests for all four settings pages rendering functional interfaces.
- [x] 7.2 Add interaction tests for workspace danger confirmation, member invite and role changes, and notification preference updates.
- [x] 7.3 Add or update tests confirming profile menu settings navigation lands on functional destination pages.
