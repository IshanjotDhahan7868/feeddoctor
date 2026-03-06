# FeedDoctor Task Board (Issue-Sized Tickets)

This board translates the current production-readiness priorities into implementation tickets with clear scope, estimates, and definitions of done.

## Epic A — Runtime Reliability

### FD-101: Centralize Runtime Mode (`MOCK_MODE`) and Remove Hardcoded Business Data in Prod Paths
- **Priority:** P0
- **Estimate:** 1 day
- **Owner:** Backend
- **Scope:**
  - Introduce a single runtime-mode helper (`isMockMode`) in `lib/`.
  - Use it consistently in feed/outreach/inbox/fulfillment routes.
  - Replace hardcoded outreach/analyze/drafts arrays with either real logic or explicit `501 Not Implemented` in non-mock mode.
- **Out of scope:** Full real discovery/scraping implementation.
- **Acceptance criteria:**
  - No production route returns static demo store/message data when `MOCK_MODE=false`.
  - API responses explicitly indicate mock vs non-mock behavior.
- **Definition of done:**
  - Unit tests (or route-level tests) cover mode switching for impacted endpoints.
  - README/runtime docs updated with behavior matrix.

### FD-102: Error Contract Standardization for API Routes
- **Priority:** P1
- **Estimate:** 0.5 day
- **Owner:** Backend
- **Scope:**
  - Standardize JSON error shape: `{ success: false, error: string, code?: string }`.
  - Align status codes for validation (`400`), unauthorized (`401/403`), not found (`404`), rate limit (`429`), and server errors (`500`).
- **Out of scope:** Frontend redesign.
- **Acceptance criteria:**
  - All modified routes return consistent error envelopes.
- **Definition of done:**
  - Smoke test script verifies representative failure modes.

## Epic B — Payments & Fulfillment Hardening

### FD-201: Make Stripe Checkout + Fulfillment Idempotent End-to-End
- **Priority:** P0
- **Estimate:** 1.5 days
- **Owner:** Backend
- **Scope:**
  - Ensure duplicate webhook events do not duplicate order updates.
  - Make `/api/feed/fulfill` safe for retries.
  - Persist and check terminal order states before regeneration/re-email.
- **Out of scope:** UI changes to checkout page.
- **Acceptance criteria:**
  - Replaying same `sessionId` or webhook event does not create duplicate side effects.
- **Definition of done:**
  - Add integration checks for webhook replay and fulfill replay.

### FD-202: Fulfillment Artifact Source of Truth
- **Priority:** P1
- **Estimate:** 1 day
- **Owner:** Backend
- **Scope:**
  - Replace ad hoc file lookup with deterministic artifact generation/storage path.
  - Store artifact metadata (`version`, `checksum`, `createdAt`) with order.
- **Out of scope:** New file formats beyond CSV.
- **Acceptance criteria:**
  - Every fulfilled order maps to one auditable artifact record.
- **Definition of done:**
  - Download link remains valid and recoverable by order/session.

## Epic C — Data/Setup Consistency

### FD-301: Resolve Prisma Provider + README Setup Mismatch
- **Priority:** P0
- **Estimate:** 0.5 day
- **Owner:** Platform
- **Scope:**
  - Decide and document default local DB provider strategy.
  - Align `schema.prisma`, migration docs, and setup instructions.
- **Out of scope:** Full migration to managed cloud DB.
- **Acceptance criteria:**
  - Clean clone setup works exactly as documented.
- **Definition of done:**
  - Verified from fresh environment with documented commands.

### FD-302: Add Environment Variable Validation at Boot
- **Priority:** P1
- **Estimate:** 0.5 day
- **Owner:** Platform
- **Scope:**
  - Add typed env validation (`zod`) for required/optional vars.
  - Fail fast in prod for missing critical credentials.
- **Out of scope:** Secrets management tooling.
- **Acceptance criteria:**
  - Startup logs clearly show missing required vars in non-mock prod mode.
- **Definition of done:**
  - Validation module used by all server routes/utilities.

## Epic D — Persistence for Core User Workflows

### FD-401: Persist Pipeline Board State in Prisma
- **Priority:** P1
- **Estimate:** 1.5 days
- **Owner:** Full-stack
- **Scope:**
  - Add API endpoints for read/update pipeline stage.
  - Bind drag/drop UI updates to backend persistence.
- **Out of scope:** Multi-user conflict resolution.
- **Acceptance criteria:**
  - Board state survives refresh and restart.
- **Definition of done:**
  - CRUD checks cover stage transitions and invalid stage handling.

### FD-402: Persist Inbox Messages and Reply Suggestions
- **Priority:** P2
- **Estimate:** 1 day
- **Owner:** Full-stack
- **Scope:**
  - Add Prisma model for inbound message + classification + suggested replies.
  - Add API endpoints to fetch recent interactions.
- **Out of scope:** Gmail sync.
- **Acceptance criteria:**
  - Recent inbox analyses are available after refresh.
- **Definition of done:**
  - Retention limit and pagination documented.

## Epic E — Real Outreach Intelligence

### FD-501: Replace Demo Discover Endpoint with Real Discovery Pipeline
- **Priority:** P1
- **Estimate:** 2 days
- **Owner:** Backend
- **Scope:**
  - Implement niche/country-based discovery adapter(s).
  - Normalize store objects and dedupe by canonical URL.
- **Out of scope:** Paid data provider integration (phase 2).
- **Acceptance criteria:**
  - Endpoint returns real discovered stores with provenance metadata.
- **Definition of done:**
  - Rate limit and robots constraints documented and enforced.

### FD-502: Implement Product Analysis with Robots-Aware Scraping
- **Priority:** P1
- **Estimate:** 2 days
- **Owner:** Backend
- **Scope:**
  - Crawl/select up to configured number of product pages.
  - Extract feed-relevant fields and surface issue severity.
  - Mark skipped URLs with explicit reason (`robots_blocked`, `timeout`, etc.).
- **Out of scope:** Advanced anti-bot bypass.
- **Acceptance criteria:**
  - Analysis output includes both findings and skip reasons.
- **Definition of done:**
  - Tests include robots-disallow and timeout behavior.

### FD-503: Generate Compliant Outreach Drafts from Analysis Results
- **Priority:** P2
- **Estimate:** 1.5 days
- **Owner:** Backend
- **Scope:**
  - Build draft generator that references discovered issues and store context.
  - Enforce unsubscribe sentence and no auto-send guarantee.
- **Out of scope:** Automated send sequencing.
- **Acceptance criteria:**
  - Drafts are personalized, compliant, and traceable to analysis inputs.
- **Definition of done:**
  - Snapshot tests validate output schema and required compliance text.

---

## Suggested Sprint Plan

### Sprint 1 (Reliability First)
- FD-101, FD-201, FD-301, FD-102

### Sprint 2 (Persistence + Real Data)
- FD-401, FD-501, FD-502

### Sprint 3 (Polish + Expansion)
- FD-202, FD-302, FD-402, FD-503

## Risk Register (Top 3)
- **R1:** Upstream scraping variability and blocks.
  - **Mitigation:** robots-aware skips + retry budget + provider abstraction.
- **R2:** Payment webhook replay creating inconsistent state.
  - **Mitigation:** idempotency keys and persisted processed-event IDs.
- **R3:** Environment drift between local/dev/prod.
  - **Mitigation:** strict env validation and one canonical setup path.
