import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">Live Voice AI Assistant</p>
        <h1>Talk naturally and let the assistant respond out loud in real time.</h1>
        <p className="hero-copy">
          This app now supports live microphone turns for back-and-forth conversation, while
          still keeping the voice note flow as a fallback.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/voice-console">
            Open Voice Console
          </Link>
          <Link className="btn btn-ghost" to="/setup">
            Setup Checklist
          </Link>
        </div>
      </section>

      <section className="grid-two">
        <article className="info-card">
          <h2>Pipeline</h2>
          <ol>
            <li>Live microphone capture in the browser</li>
            <li>Speech recognition turns speech into text</li>
            <li>Backend reasons with Gemini and booking memory</li>
            <li>Assistant replies with generated voice</li>
            <li>Booking triggers automatically when details are complete</li>
          </ol>
        </article>

        <article className="info-card">
          <h2>Structured Output</h2>
          <p>Each turn tracks:</p>
          <ul>
            <li>Name (optional)</li>
            <li>Budget</li>
            <li>Location</li>
            <li>Requirement</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
