import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link to="/login" className="text-caption text-primary hover:underline">← Back</Link>
      <h1 className="mt-4 text-display text-ink">Privacy Policy</h1>
      <p className="mt-2 text-caption text-text-muted">Last updated: 2026</p>
      <div className="mt-6 flex flex-col gap-4 text-body text-primary">
        <p>
          We collect only what G-TAX needs to work: your email (for authentication), the income and
          expense data you enter, and any receipts you upload.
        </p>
        <h2 className="text-heading">How your data is used</h2>
        <p>
          Your financial data is used to show your dashboard, calculate estimates, and generate AI
          suggestions. Receipts are sent to an AI service only to read their contents for you.
        </p>
        <h2 className="text-heading">Storage &amp; security</h2>
        <p>
          Data is stored in Supabase (Postgres + Storage) with row-level security so each user can
          only access their own records. Traffic is encrypted in transit.
        </p>
        <h2 className="text-heading">Your control</h2>
        <p>
          Your data is scoped to your account and is never shared with other users. You can delete
          any income, expense, or receipt at any time.
        </p>
      </div>
    </div>
  );
}
