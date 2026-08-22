-- ============================================================================
-- Seed: tax_rule_documents (curated RAG corpus — TRD §7 setup step 1–2)
-- Inserts the plain-text rule chunks with a NULL embedding. Embeddings are
-- generated afterwards by the AI service:
--     POST /ai/embeddings/generate   (see AI/app/routers/embeddings.py)
-- or by running:  python -m app.scripts.load_embeddings   (from the AI/ dir)
-- The same corpus lives in AI/data/tax_rules.json as the single source of truth;
-- this SQL keeps the DB self-seedable without the AI service running.
-- ============================================================================
insert into public.tax_rule_documents (title, content, source) values
  ('What counts as a deductible business expense',
   'A business expense is deductible when it is incurred wholly and exclusively for the purpose of earning gig or freelance income. Typical deductible categories for gig workers include internet and phone bills used for work, software subscriptions, professional tools and equipment, home-office running costs proportionate to work use, business travel, and platform or commission fees. Personal or dual-use spending is only deductible to the extent it relates to work.',
   'G-TAX curated deduction guide'),
  ('Travel and vehicle expenses',
   'Travel undertaken to earn income — such as driving for delivery or ride-share, or travelling to a client — is generally deductible. This can include fuel, vehicle maintenance, tolls, parking, and public transport fares directly tied to work. Commuting between home and a single fixed workplace is usually treated as personal and is not deductible. Keep logs or receipts that separate work travel from personal travel.',
   'G-TAX curated deduction guide'),
  ('Equipment, tools and depreciation',
   'Equipment bought for gig work — laptops, cameras, phones, delivery bags, tools — is deductible. Lower-value items can often be claimed in full in the year of purchase, while higher-value assets are written off over their useful life through depreciation. The deductible portion is limited to the share of use that is for work rather than personal use.',
   'G-TAX curated deduction guide'),
  ('Software subscriptions and online services',
   'Recurring software subscriptions and online services used to run gig work — design tools, accounting apps, cloud storage, editing suites, and professional memberships — are typically deductible business expenses when used for earning income. Keep the invoices; if a subscription is part personal and part work, claim only the work-related proportion.',
   'G-TAX curated deduction guide'),
  ('Food and meal expenses',
   'Ordinary daily meals are personal and not deductible. Meals can become deductible in narrow cases — for example a genuine business meeting with a client, or an allowable per-diem while travelling away from home for work. Routine food bought during a normal work day is generally not claimable.',
   'G-TAX curated deduction guide'),
  ('Home office expenses',
   'If part of your home is used regularly for gig work, a proportion of rent, electricity, and internet can be deductible based on the share of floor area or time used for work. The claim must be reasonable and supported by bills. Purely personal living costs are not deductible.',
   'G-TAX curated deduction guide'),
  ('Standard deduction and taxable income',
   'Taxable income is calculated as total income minus allowable deductible expenses minus any standard deduction the taxpayer is entitled to. The standard deduction is a flat amount subtracted before tax slabs are applied, reducing the income that is actually taxed. G-TAX applies a single simplified standard deduction in its estimate.',
   'G-TAX simplified tax rules'),
  ('Presumptive taxation for small gig workers',
   'Some small self-employed and gig workers may opt into a presumptive taxation scheme, where taxable income is estimated as a fixed percentage of gross receipts instead of tracking every expense. This simplifies filing but means individual expenses are not separately deducted. Whether it is beneficial depends on actual expense levels versus the presumptive rate.',
   'G-TAX simplified tax rules'),
  ('Filing deadlines and advance tax',
   'Self-employed and gig workers whose annual tax liability crosses a threshold are generally required to pay advance tax in instalments across the year rather than a single payment at filing time. Missing advance-tax instalments or the annual return deadline can lead to interest and penalties. A belated return can usually still be filed by a later cut-off date.',
   'G-TAX simplified tax rules'),
  ('Record keeping for deductions',
   'To support any deduction, keep receipts, invoices, and bank or platform statements showing the expense, the vendor, the date, and the amount. Digital copies (such as scanned or photographed receipts) are acceptable. Good records make deductions defensible and speed up filing; undocumented claims are the ones most likely to be disallowed.',
   'G-TAX curated deduction guide')
on conflict do nothing;
