-- ============================================================================
-- Seed: tax_deadlines (static, predefined list for MVP — TRD §4, PRD §7)
-- A simplified single-region (India FY, Apr–Mar) set of common filing dates.
-- Dates are illustrative anchors for the calendar view (view-only per PRD §7).
-- ============================================================================
insert into public.tax_deadlines (title, description, due_date, applicable_to) values
  ('Advance Tax — Q1 Instalment',
   'First instalment (15%) of advance tax for the financial year, if total tax liability exceeds the threshold.',
   '2025-06-15', 'self-employed / gig workers'),
  ('Advance Tax — Q2 Instalment',
   'Second instalment (cumulative 45%) of advance tax due for the financial year.',
   '2025-09-15', 'self-employed / gig workers'),
  ('Advance Tax — Q3 Instalment',
   'Third instalment (cumulative 75%) of advance tax due for the financial year.',
   '2025-12-15', 'self-employed / gig workers'),
  ('Advance Tax — Q4 Instalment',
   'Final instalment (cumulative 100%) of advance tax due for the financial year.',
   '2026-03-15', 'self-employed / gig workers'),
  ('Income Tax Return (Non-Audit) Filing',
   'Due date to file the annual income tax return for individuals not requiring an audit.',
   '2026-07-31', 'individuals / freelancers'),
  ('Belated / Revised Return Deadline',
   'Last date to file a belated or revised return for the financial year.',
   '2026-12-31', 'all taxpayers'),
  ('GST Return — Monthly (GSTR-3B) Sample',
   'Illustrative monthly GST summary return date for registered gig workers who cross the GST threshold.',
   '2025-09-20', 'GST-registered gig workers')
on conflict do nothing;
