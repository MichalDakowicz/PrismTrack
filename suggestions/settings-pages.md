# Settings Pages

## Overview
Implement the placeholder settings pages in the app.

## Motivation
Multiple settings routes currently show placeholders. These are core functionality for any workspace application.

## Components

### Workspace Settings (`/settings/workspace`)
- Workspace identity (name, slug, avatar)
- Workspace description
- Danger zone (delete workspace)

### GitHub App Settings (`/settings/github-app`)
- Installation status
- Repository permissions management
- Webhook configuration

### Members (`/settings/members`)
- Member list with roles
- Invite new members
- Role management (admin, member, viewer)
- Pending invitations

### Notifications (`/settings/notifications`)
- Notification channel preferences
- Per-event notification toggles
- Email digest settings

## Priority
HIGH - Clean scope, useful functionality
