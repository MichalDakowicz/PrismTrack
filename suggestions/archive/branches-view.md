# Branches View

## Overview
Create a branches view to display GitHub repository branches, with support for tracking and stale branch indicators.

## Motivation
The `/branches` route currently shows a placeholder. A branches view would make the app feel more complete and provide useful information about repository state.

## Notes
- Display list of branches from linked repositories
- Show stale branches (branches older than X days without activity)
- Show branch protection status
- Quick actions: create branch, delete branch, view PR for branch
- Filter by repository if multiple repos linked

## Priority
HIGH - Low effort, fills a gap
