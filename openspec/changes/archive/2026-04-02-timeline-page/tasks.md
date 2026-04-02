## 1. Routing And Navigation

- [x] 1.1 Add Timeline route registration in the project-scoped routing configuration.
- [x] 1.2 Add Timeline entry in project-scoped navigation components with consistent ordering and labels.
- [x] 1.3 Ensure project context is preserved when switching from existing views to Timeline.

## 2. Timeline View UI

- [x] 2.1 Create Timeline page component with base layout and chronological bucket rendering.
- [x] 2.2 Implement date-range control and granularity selector (day/week/month).
- [x] 2.3 Implement loading, empty, and error states including retry behavior.

## 3. Data Composition And Filtering

- [x] 3.1 Add selectors/adapters to transform project items into timeline buckets.
- [x] 3.2 Integrate shared project filters so timeline results match existing filter semantics.
- [x] 3.3 Add safeguards for dense datasets (range defaults, bucketing, and render efficiency).

## 4. Verification And Quality

- [x] 4.1 Add unit tests for timeline grouping logic and filter application.
- [x] 4.2 Add integration tests for navigation to Timeline and project-context preservation.
- [x] 4.3 Add UI tests for date-range/granularity interactions and state handling (loading/empty/error).