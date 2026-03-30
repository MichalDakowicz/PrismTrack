# How to Add Suggestions

When in **Explore Mode**, ideas for future features can be captured as suggestions. These are lightweight notes that don't require full OpenSpec change proposals.

## When to Add a Suggestion

- User mentions something they "might want to do later"
- An idea emerges during exploration but isn't ready to implement
- An interesting tangent that could be valuable but is out of scope
- User explicitly asks to "save this for later"

## How to Add

Simply say **"save this to suggestions"** or describe what you'd like to save, and I'll create a `.md` file in the `suggestions/` folder.

## File Format

```markdown
# Feature Name

## Overview
Brief description of what this feature would do.

## Motivation
Why is this valuable? What problem does it solve?

## Implementation Notes
- Key considerations
- Potential approaches
- Relevant code paths

## Priority
LOW / MEDIUM / HIGH - Brief justification

## Technical Considerations
Dependencies, libraries, or technical notes.
```

## Suggestion Lifecycle

```
EXPLORE → SUGGESTION (lightweight capture)
    ↓
DECIDE → PROPOSAL (full OpenSpec change)
    ↓
IMPLEMENT → COMPLETE
```

## Tips

- **Be brief** — Suggestions are notes, not specs
- **Capture context** — Why did this seem valuable?
- **Note constraints** — Any known limitations or dependencies?
- **Set priority** — Helps prioritize later

## Quick Commands

- `"save this to suggestions"` — Capture current idea
- `"show me suggestions"` — List all saved suggestions
- `"make this a proposal"` — Convert suggestion to OpenSpec change
