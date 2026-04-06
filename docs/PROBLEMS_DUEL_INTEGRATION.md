**Problems → Duel Multiplayer Integration Guide**

**Objective**
- Explain how `problems/questions` (the content managed in the Problems section) should be integrated into the Duel multiplayer onboarding/randomized flow.
- Provide guidance for a future developer who will merge an onboarding page that randomizes problems for new players.

**High-level mapping**
- Authoritative problem records are stored in the `problems` table and related mapping tables: `content_problems` and `content_items` per the approval flow.
- The Duel multiplayer system should draw from the `problems` table only content that is `status = 'active'` and has passed approvals (if your system uses `approvals` for publish gating).

**Recommended DB fields to rely on**
- `problems`:
  - `problem_id` – PK
  - `title` / `problem_name`
  - `difficulty` – e.g., `Easy`, `Medium`, `Hard`
  - `status` – only use `active` for playable problems
  - `topics` – optional, JSON/CSV list for tagging and filtering
  - `time_limit_seconds`, `memory_limit_mb`, `sample_solution` (if required)

**Approval integration**
- Only surface problems where either:
  - There is no `approvals` row required (internal content), or
  - The matching `approvals` row has `status = 'approved'`, and the content `status = 'active'`.

- If your onboarding flow must exclude newly submitted faculty drafts, ensure you only select from committed `problems` (no `faculty_pending_changes` rows).

**API suggestions**
- Add a read-only endpoint used by the Duel onboarding page, e.g.:

  GET /api/duel/onboarding/problems?count=5&difficulty=Easy

  Response shape:
  {
    success: true,
    problems: [ { problem_id, title, difficulty, time_limit_seconds, topics, preview } ]
  }

- Server-side implementation should:
  - Validate `count` is reasonable (e.g., 1..20).
  - Filter `status = 'active'` and `approvals.status = 'approved'` (if applicable).
  - Randomize results using `ORDER BY RAND()` (or a better server-side/seeded shuffle if you need reproducible randomness).
  - Optionally weight by `difficulty` or `popularity`.

**Onboarding page integration notes**
- The onboarding page should request a small batch (e.g., 3-5) of problems and choose one at random, or present a concise set for quick practice.
- Avoid returning full problem statements (including large sample solutions or tests) unless necessary; return a light preview and a problem token/id for subsequent fetch.
- To mitigate load and abuse, cache onboarding lists for short TTLs (30–120s) and rate-limit endpoints.

**Client-side behavior**
- On first sign-in, the onboarding component should call the new API and present a short list (or a single randomized problem).
- When user selects or accepts a problem, the Duel app should fetch the full problem details by problem_id via existing problems API.

**Security & fairness**
- Ensure problem selection is blind to user history unless intentionally personalized.
- If problems are used for ranking or reward allocation, avoid returning the canonical sample_solution in onboarding; keep solutions server-side.

**Example SQL (simple)**
```sql
SELECT p.problem_id, p.title, p.difficulty, p.time_limit_seconds, p.topics
FROM problems p
LEFT JOIN content_problems cp ON cp.problem_id = p.problem_id
LEFT JOIN approvals a ON a.content_item_id = cp.content_item_id
WHERE p.status = 'active'
  AND (a.approval_id IS NULL OR a.status = 'approved')
ORDER BY RAND()
LIMIT 5;
```

**Notes for merging other dev's onboarding page**
- If the onboarding page is a separate repo/component, ensure its fetch URL matches the project’s `apiBase` and authentication (JWT token) headers.
- Prefer returning a compact JSON shape from the server and let the onboarding UI request full problem data only when the player starts.

Generated on 2026-01-05.
