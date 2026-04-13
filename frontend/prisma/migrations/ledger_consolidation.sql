-- ═══════════════════════════════════════════════════════════════════════════
-- TOKEN LEDGER: PRODUCTION MIGRATION
-- Run in this exact order. Each step is idempotent.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── STEP 1: Backfill legacy credit_transactions into token_ledger_entries ─
-- Migrates ALL historical credit transactions into the unified ledger.
-- Uses deterministic idempotencyKey → safe to re-run.

INSERT IGNORE INTO token_ledger_entries
  (id, userId, entryType, amount, referenceId, idempotencyKey, reasonCode, createdAt)
SELECT
  CONCAT('migrated-', id),
  userId,
  CASE type
    WHEN 'purchase' THEN 'PURCHASE'
    WHEN 'spend'    THEN 'CONSUME'
    WHEN 'refund'   THEN 'REFUND'
    ELSE 'ADJUSTMENT'
  END,
  amount,
  relatedId,
  COALESCE(idempotencyKey, CONCAT('legacy-migration:', id)),
  reason,
  createdAt
FROM credit_transactions;

-- ─── STEP 2: Seed users who have balance > 0 but no ledger entries ────────
-- These are users created before the ledger existed.
-- They get an ADJUSTMENT entry matching their current cached balance.

INSERT IGNORE INTO token_ledger_entries
  (id, userId, entryType, amount, referenceId, idempotencyKey, reasonCode, createdAt)
SELECT
  CONCAT('seed-', u.id),
  u.id,
  'ADJUSTMENT',
  u.availableBalance,
  NULL,
  CONCAT('ledger-seed:', u.id),
  'INITIAL_BALANCE',
  NOW()
FROM users u
WHERE u.availableBalance > 0
  AND NOT EXISTS (
    SELECT 1 FROM token_ledger_entries t WHERE t.userId = u.id
  );

-- ─── STEP 3: Seed users who have balance = 0 and no ledger entries ────────
-- Even 0-balance users MUST have a seed entry (invariant rule #5).

INSERT IGNORE INTO token_ledger_entries
  (id, userId, entryType, amount, referenceId, idempotencyKey, reasonCode, createdAt)
SELECT
  CONCAT('seed-', u.id),
  u.id,
  'ADJUSTMENT',
  0,
  NULL,
  CONCAT('ledger-seed:', u.id),
  'INITIAL_BALANCE',
  NOW()
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM token_ledger_entries t WHERE t.userId = u.id
  );

-- ─── STEP 4: Reconcile cached balance to match ledger SUM ────────────────
-- This is the CRITICAL safety step. After this, the invariant holds:
--   users.availableBalance == SUM(token_ledger_entries.amount)

UPDATE users u
SET u.availableBalance = (
  SELECT COALESCE(SUM(t.amount), 0)
  FROM token_ledger_entries t
  WHERE t.userId = u.id
);

-- ─── STEP 5: VERIFY — invariant must hold ────────────────────────────────
-- This query MUST return 0 rows. If it returns any rows, DO NOT PROCEED.

SELECT
  u.id,
  u.email,
  u.availableBalance AS cached,
  COALESCE(s.total, 0) AS ledger,
  u.availableBalance - COALESCE(s.total, 0) AS drift
FROM users u
LEFT JOIN (
  SELECT userId, SUM(amount) AS total
  FROM token_ledger_entries
  GROUP BY userId
) s ON s.userId = u.id
HAVING cached != ledger;

-- Expected: 0 rows
-- If any rows: STOP. Investigate before proceeding.

-- ─── STEP 6: VERIFY — no user without ledger entry ──────────────────────

SELECT u.id, u.email
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM token_ledger_entries t WHERE t.userId = u.id
);

-- Expected: 0 rows
-- If any rows: re-run Step 3.

-- ─── STEP 7 (OPTIONAL): Add CHECK constraint ────────────────────────────
-- Only run AFTER 1 week of monitoring.
-- Prevents application bugs from creating negative balance at DB level.

-- ALTER TABLE users ADD CONSTRAINT chk_balance_nonneg
--   CHECK (availableBalance >= 0);
