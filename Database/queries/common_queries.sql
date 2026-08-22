-- ============================================================================
-- G-TAX — reference queries (documentation / manual inspection helpers).
-- These mirror the reads Spring Boot performs via JPA; kept here so the data
-- layer is inspectable without the app. Replace :user_id with a real uuid.
-- ============================================================================

-- Total income for a user in a financial year (Apr 1 – Mar 31).
select coalesce(sum(amount), 0) as total_income
from public.incomes
where user_id = :user_id
  and income_date >= :fy_start and income_date <= :fy_end;

-- Deductible expenses total for a user in a financial year.
select coalesce(sum(amount), 0) as deductible_expenses
from public.expenses
where user_id = :user_id
  and is_deductible = true
  and expense_date >= :fy_start and expense_date <= :fy_end;

-- Recent transactions (income + expenses) for the dashboard, newest first.
(select 'income' as kind, id, source as label, amount, income_date as dt, created_at
 from public.incomes where user_id = :user_id)
union all
(select 'expense' as kind, id, coalesce(vendor, category) as label, amount, expense_date as dt, created_at
 from public.expenses where user_id = :user_id)
order by dt desc, created_at desc
limit 5;

-- Upcoming deadlines (used by /api/tax/deadlines), soonest first.
select id, title, description, due_date, applicable_to
from public.tax_deadlines
where due_date >= current_date
order by due_date asc;

-- Expense with its (optional) receipt — powers the Expenses list + detail sheet.
select e.*, r.id as receipt_id, r.file_url, r.ocr_status, r.ocr_raw_text
from public.expenses e
left join public.receipts r on r.expense_id = e.id
where e.user_id = :user_id
order by e.expense_date desc;

-- RAG similarity search (executed by the AI service via the RPC).
-- select * from public.match_tax_rule_documents(:query_embedding, 4);
