## 1. Setup

- [x] 1.1 Install @dnd-kit/core and @dnd-kit/sortable packages
- [x] 1.2 Review current Board.tsx implementation

## 2. Backend API

- [x] 2.1 Create API endpoint to update issue labels (PATCH /api/github/issues/:number/labels)
- [x] 2.2 Create API endpoint to close/reopen issues (PATCH /api/github/issues/:number)

## 3. Frontend - Core Drag and Drop

- [x] 3.1 Wrap Board component with DndContext
- [x] 3.2 Create Column components with Droppable sensors
- [x] 3.3 Convert IssueCard to Draggable component
- [x] 3.4 Implement onDragEnd handler to detect column changes

## 4. Frontend - Visual Feedback

- [x] 4.1 Add column highlight during drag over
- [x] 4.2 Add placeholder styling for dragged item position
- [x] 4.3 Update cursor to grabbing during drag

## 5. Frontend - State Persistence

- [x] 5.1 Implement optimistic UI update on drop
- [x] 5.2 Call API to persist label changes
- [x] 5.3 Handle API errors with rollback and notification
- [x] 5.4 Update column logic to check for explicit status labels

## 6. Testing

- [ ] 6.1 Test drag from Backlog to In Progress
- [ ] 6.2 Test drag from In Progress to Done (should close issue)
- [ ] 6.3 Test drag from Done to Backlog (should reopen issue)
- [ ] 6.4 Test page refresh preserves column assignment
- [ ] 6.5 Test error handling when GitHub API fails
