# PrismTrack — Product Specification

**A GitHub-native project tracker for small development teams**

---

## Overview

PrismTrack is a dark-first, minimalist project management tool built deeply around GitHub. It is designed for small teams of 2–10 developers who want the power of Linear or Jira without the bloat — with GitHub as the single source of truth for all code, issues, branches, and pull requests.

---

## Design Language

### Visual Style

- **Theme:** Dark mode by default (Linear-inspired). Optional light mode toggle stored per user.
- **Color palette:** Deep charcoal backgrounds (`#0D0D0F`, `#111114`), subtle elevated surfaces (`#18181C`, `#1F1F24`), muted borders (`#2A2A30`), and a single electric accent color (recommended: violet `#7C5CFF` or cyan `#00D4AA`) used sparingly for CTAs and highlights.
- **Typography:** Geist or Inter — clean, monospace-adjacent. Code snippets in JetBrains Mono or Fira Code.
- **Motion:** Micro-animations only. Subtle fade-ins, smooth sidebar transitions, skeleton loaders. No page flashes or heavy transitions.
- **Density:** Medium — enough breathing room to feel premium, tight enough to see a full sprint without scrolling.

### Component Principles

- Flat, borderless cards with very subtle shadow or inner highlight
- Icon-first navigation (sidebar collapses to icons on narrow screens)
- Command palette (`Cmd+K`) for every action
- No modal overload — use slide-over panels for detail views
- Consistent 4px / 8px spacing grid

---

## Authentication

- **Login with GitHub only.** No email/password. GitHub OAuth is the single identity provider.
- On first login, users install the **PrismTrack GitHub App** to their personal account or organization. This grants read/write access to repos, issues, PRs, branches, and webhooks.
- Each workspace in PrismTrack maps to a GitHub user or org.
- Permissions sync automatically from GitHub roles (admin, write, read).

---

## Core Concepts

| Term          | Description                                         |
| ------------- | --------------------------------------------------- |
| **Workspace** | Maps to a GitHub org or personal account            |
| **Project**   | Linked to one or more GitHub repositories           |
| **Issue**     | Synced bidirectionally with GitHub Issues           |
| **Cycle**     | A sprint or time-boxed work period                  |
| **Branch**    | Auto-created or tracked from GitHub                 |
| **PR**        | Pull requests surfaced and managed inside PrismTrack |

---

## Navigation Structure

```
Sidebar (collapsible)
├── Home / Dashboard
├── My Issues
├── Projects
│   └── [Per project]
│       ├── Board (Kanban)
│       ├── List
│       ├── Timeline
│       ├── Activity Feed
│       └── Pulse (Contribution Calendar)
├── Pull Requests
├── Branches
├── Repositories
└── Settings
    ├── Workspace
    ├── GitHub App
    ├── Members
    └── Notifications
```

---

## Views & Pages

### 1. Dashboard (Home)

The personal hub for each user.

- **My open issues** — flat list, grouped by project
- **Active PRs** — PRs assigned to or created by the user, with CI status indicators
- **Recent activity** — chronological feed of comments, status changes, merges
- **Quick actions bar** — "Create Issue", "New Branch", "Open PR"

---

### 2. Board View (Kanban)

Classic swimlane board scoped to a project.

- **Columns:** Backlog → Todo → In Progress → In Review → Done
- Column status maps to GitHub issue labels or a status field
- Drag-and-drop cards between columns; updates GitHub issue labels in real time
- Card shows: title, assignee avatar, label chips, PR status badge, priority indicator
- Filter bar: assignee, label, milestone, repo (for multi-repo projects)
- Quick-add card at top of each column with inline title entry

---

### 3. List View

Dense table-style view for power users.

- Columns: Status | Title | Assignee | Labels | Milestone | Repo | Updated
- Inline editing of status, assignee, and labels
- Sortable columns, multi-select for bulk actions (close, reassign, label)
- Group by: Status, Assignee, Repo, Label, Milestone

---

### 4. Timeline View (Gantt)

For sprint planning and deadline tracking.

- Horizontal swimlanes per issue or per assignee
- Date range bars showing estimated start → due date
- Milestone markers shown as vertical lines
- Drag to adjust duration or shift dates
- Milestone from GitHub shown as fixed pins

---

### 5. Activity Feed

GitHub-style event stream for the project.

- All events: issue opened/closed, PR opened/merged, commits pushed, comments added, branch created
- Each event links to the relevant GitHub resource
- Filter by: event type, repo, author, date range
- Real-time updates via GitHub webhooks

---

### 6. Pulse — Contribution Calendar

A GitHub contribution-calendar-style heatmap, adapted for project health.

- **X-axis:** Days (rolling 12 months or custom range)
- **Y-axis:** Rows per contributor, or a single row for the whole team
- **Cell intensity:** Based on commits, issues closed, PRs merged, or a composite score — user can switch the metric
- Hover tooltip: exact count + breakdown by type
- Color scale follows the app accent color (dark → bright)
- Click a cell to drill into that day's activity in the Feed

---

## GitHub Integration (Full Sync)

### Bidirectional Issue Sync

- All GitHub Issues appear in PrismTrack automatically
- Creating an issue in PrismTrack creates it on GitHub
- Editing title, body, labels, assignee, milestone, or state syncs in both directions within seconds (webhook-driven)
- Comments sync bidirectionally with author attribution

### Multi-Repo Projects

- A single PrismTrack Project can span multiple GitHub repositories
- Issues, PRs, and branches are tagged with their source repo
- Filter and group by repo throughout all views
- Repo selector in project settings — add or remove repos at any time

### PR Tracking

- All open PRs in linked repos surface in PrismTrack
- PR card shows: title, author, target branch, CI status (pass/fail/pending), review status, merge status
- Link an issue to a PR — when PR merges, issue auto-closes (configurable)
- Review requests and approvals shown inline

### Branch Tracking

- All branches from linked repos listed under Branches view
- Branch linked to its originating issue automatically (if naming convention followed)
- Stale branch detection — flag branches with no commits in N days

### Webhook Events

- PrismTrack registers a GitHub App webhook for each linked repo
- Events processed: push, pull_request, issues, issue_comment, create (branch/tag), status, check_run

---

## Developer Helper Tools

All tools live in a persistent **"Dev Tools" panel** accessible via sidebar icon or `Cmd+Shift+D`.

### Branch Name Generator

- Input: issue title or select from open issues
- Output: clean, formatted branch name following convention (e.g. `feat/42-user-auth-flow`)
- Prefix options: `feat/`, `fix/`, `chore/`, `docs/` — auto-suggested from issue labels
- One-click copy of full `git checkout -b` command
- Optional: copy push command with upstream tracking (`git push -u origin <branch>`)

### Auto Issue Creation

- Quick-create form with smart defaults
- Assign to repo, add labels, milestone, and assignee in one flow
- Option to immediately generate a branch name and copy the checkout command
- Bulk import from a plain-text or CSV list (each line becomes an issue)
- GitHub issue templates surfaced from the repo's `.github/ISSUE_TEMPLATE/` folder

### PR Description Generator

- Triggered from a PR card or the "New PR" flow
- Input: select commits from a branch (auto-populated from GitHub)
- Output: structured PR description with What / Why / Testing sections, pre-filled from commit messages
- Editable before submitting — PrismTrack opens or creates the PR on GitHub via API
- Links the PR to the parent issue automatically

### Commit Message Helper

- Available as a copyable snippet on any issue card
- Suggests a conventional commit message based on issue title and type
- Format: `feat(scope): short description (#issue-number)`
- One-click copy

### First Issue / Onboarding Flow

- When a new member joins the workspace, they see an onboarding checklist:
    1. Connect GitHub account
    2. Install PrismTrack GitHub App to at least one repo
    3. View your first assigned issue
    4. Generate a branch name and run the checkout command
    5. Make a commit and push
    6. Open a PR and link it to the issue
- Each step shows real-time completion status
- Issues labeled `good-first-issue` on GitHub are surfaced in a dedicated "Start Here" section for new members

---

## Issue Detail Panel

Slide-over panel (not a full page) showing:

- Title (editable inline)
- Status selector (maps to GitHub state + label)
- Priority badge (P0–P3 or custom)
- Assignee(s) with avatar picker
- Labels (GitHub labels, multi-select)
- Milestone
- Linked repo
- Linked PR(s) with status
- **Branch name** — auto-generated or entered, with copy button
- Description (Markdown editor with preview toggle)
- Activity log — comments + events in chronological order
- Comment box at bottom (syncs to GitHub)

---

## Members & Permissions

- Members pulled from GitHub org or repo collaborators
- PrismTrack roles mirror GitHub roles: Admin, Member, Viewer
- Admins can manage project settings, linked repos, and member access
- Invite link generates a GitHub App install flow for new members

---

## Notifications

- In-app notification bell with unread count
- Notification types: assigned to issue, mentioned in comment, PR review requested, CI failed, issue closed
- Per-user settings: email digest (daily/weekly), browser push, or in-app only
- Mute individual projects or repos

---

## Settings

### Workspace Settings

- Workspace name, slug, avatar
- Linked GitHub org or account
- GitHub App installation status and repo list

### Project Settings

- Project name and description
- Linked repositories (multi-select from available repos)
- Default status labels mapping (e.g. map "In Progress" label to the In Progress column)
- Cycle settings (sprint length, start day)
- Issue auto-close rules (e.g. close on PR merge)

### Member Settings

- Invite members (via GitHub username)
- Role assignment
- Remove member

---

## Command Palette (`Cmd+K`)

Global, always-accessible. Supports:

- Create issue
- Open issue by number or title search
- Create branch (opens branch name generator)
- Navigate to any view
- Filter current view
- Switch project
- Open PR
- Copy branch checkout command for selected issue

---

## Technical Notes (for implementation reference)

- **Frontend:** React + TypeScript, Tailwind CSS, Framer Motion for micro-animations
- **Backend:** Node.js / Next.js API routes or separate Express/Fastify server
- **Database:** PostgreSQL for workspace/project/member data; GitHub as source of truth for issues, PRs, commits
- **Realtime:** GitHub webhooks → server → WebSocket or SSE to client
- **GitHub API:** REST for most operations, GraphQL for batch queries (e.g. PR + review status in one call)
- **Auth:** GitHub OAuth App or GitHub App with user authorization flow
- **Hosting:** Vercel (frontend), Railway or Render (backend + DB)

---

## Out of Scope (v1)

- Time tracking
- Billing / paid tiers
- CI/CD pipeline management (surface status only, don't run pipelines)
- Git blame / diff viewer
- Code review inside PrismTrack (link to GitHub PR instead)
- Mobile app (responsive web only)
