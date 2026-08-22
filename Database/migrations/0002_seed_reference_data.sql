-- ============================================================================
-- Migration 0002 — seed static reference data
-- Seeds tax_deadlines and tax_rule_documents (text only; embeddings are filled
-- afterwards by the AI service). Safe to re-run (ON CONFLICT DO NOTHING).
--     psql "$SUPABASE_DB_DSN" -f Database/migrations/0002_seed_reference_data.sql
-- ============================================================================
\i seeds/01_tax_deadlines.sql
\i seeds/02_tax_rule_documents.sql
