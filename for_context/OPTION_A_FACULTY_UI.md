# Option A: Faculty UI Refactor Summary

Date: 2025-12-19

This document tracks the Option A refactor applied to Faculty dashboard sections to align with AdminDashboard patterns and improve discoverability.

## Goals
- Wrap Users/Problems/Events/Blogs with `Window` + `SplitMainWindow` where appropriate.
- Add `SearchPanel` components in right sidebars for filtering.
- Ensure multi-navigation works and populates correct data (Global/My/Pending).
- Align labels with AdminDashboard.vue for familiarity.

## Changes

### Users
- File: `src/components/dashboard/faculty/content_users.vue`
- Added `Window` wrapper and right sidebar `SearchPanel`.
- Kept single table view; filters map to username/email/role.

### Problems
- File: `src/components/dashboard/faculty/content_problems.vue`
- Converted to `Window` + `SplitMainWindow` with sections:
  - `Global Problem`, `My Problem`, `Pending Problem`.
- Right sidebar `SearchPanel` hooked to `searchText` and `filterDifficulty`.
- Multi-nav now uses `activeSection` and filtered computed arrays.

### Events
- File: `src/components/dashboard/faculty/content_events.vue`
- Added `Window` wrapper and right sidebar `SearchPanel`.
- Kept existing tab navigation (All/My/Pending) for familiarity.
- Filters map to name and status.

### Blogs
- File: `src/components/dashboard/faculty/content_blogs.vue`
- Converted to `Window` + `SplitMainWindow` with sections:
  - `Global Blog`, `My Blog`, `Pending Blog`.
- Right sidebar `SearchPanel` hooked to `searchText` and `filterStatus`.

## Labels Alignment
- Match Admin labels where practical:
  - Events: `Global Event`, `My Event`, `Pending Event` (faculty UI shows All/My/Pending; underlying mapping consistent).
  - Blogs: `Global Blog`, `My Blog`, `Pending Blog`.
  - Problems: `Global Problem`, `My Problem`, `Pending Problem`.

## Notes
- `SearchPanel` emits `filters-updated`; basic fields mapped to text/difficulty/status in faculty sections.
- No backend changes required for these UI filters; they are client-side.
- Future: Move Events to `SplitMainWindow` if desired for full consistency.

## Smoke Test Checklist
- Switch Problems tabs: Global/My/Pending → Lists update correctly.
- Use right SearchPanel inputs → Lists filter accordingly.
- Switch Events tabs: All/My/Pending → Lists update correctly; Search filters applied.
- Switch Blogs tabs: Global/My/Pending → Lists update correctly; Search filters applied.
