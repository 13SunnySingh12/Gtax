import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link to="/login" className="text-caption text-primary hover:underline">← Back</Link>
      <h1 className="mt-4 text-display text-ink">Terms of Service</h1>
      <p className="mt-2 text-caption text-text-muted">Last updated: 2026</p>
      <div className="mt-6 flex flex-col gap-4 text-body text-primary">
        <p>
          G-TAX is a tool that helps gig workers track income and expenses and see simple,
          estimated tax figures. By using G-TAX you agree to these terms.
        </p>
        <h2 className="text-heading">Informational only</h2>
        <p>
          All tax estimates, deduction suggestions, and chatbot answers are informational and are
          not professional tax, legal, or financial advice. Always confirm important decisions with a
          qualified professional.
        </p>
        <h2 className="text-heading">Your account</h2>
        <p>
          You are responsible for the accuracy of the data you enter and for keeping your login
          credentials secure. You may delete your data at any time.
        </p>
        <h2 className="text-heading">Availability</h2>
        <p>
          G-TAX is provided “as is” for an MVP. We don’t guarantee uninterrupted availability and are
          not liable for decisions made based on the estimates provided.
        </p>
      </div>
    </div>
  );
}
