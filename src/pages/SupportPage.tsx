export default function SupportPage() {
  return (
    <main className="max-w-2xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-semibold text-ink mb-2">Support</h1>
      <p className="text-sm text-ink-muted mb-6">
        Need help? We've got you.
      </p>

      <div className="bg-surface border border-line rounded-xl p-6 space-y-6">
        <div>
          <h2 className="text-ink font-medium mb-2">Frequently asked</h2>
          <ul className="space-y-3 text-sm text-ink-muted">
            <li>
              <strong className="text-ink">How do I add a job?</strong>
              <br />Click "Add Job" on the tracker to enter details manually, or "Fetch Job" to pull from a URL.
            </li>
            <li>
              <strong className="text-ink">Can I export my CV?</strong>
              <br />Yes — open the CV builder and use the export menu to download as PDF or DOCX.
            </li>
            <li>
              <strong className="text-ink">Is my data private?</strong>
              <br />Your data is stored securely and only you can access it.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-ink font-medium mb-2">Contact</h2>
          <p className="text-sm text-ink-muted">
            Email <a className="text-ink underline" href="mailto:support@tracka.app">support@tracka.app</a>
          </p>
        </div>
      </div>
    </main>
  );
}
