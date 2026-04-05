import { API_BASE_URL } from "../services/voiceApi";

export default function SetupPage() {
  return (
    <main className="page-shell">
      <section className="hero-card compact">
        <p className="eyebrow">Setup</p>
        <h1>Run backend + frontend together</h1>
        <p className="hero-copy">Use this checklist to start testing voice turns quickly.</p>
      </section>

      <section className="grid-two">
        <article className="info-card">
          <h2>Backend</h2>
          <ol>
            <li>Go to backend folder and run npm.cmd install</li>
            <li>Fill .env with OPENAI, GEMINI, and ELEVENLABS keys</li>
            <li>Start backend with npm.cmd run dev</li>
            <li>Health URL: {API_BASE_URL}/health</li>
            <li>Live text turn URL: {API_BASE_URL}/api/live-turn</li>
          </ol>
        </article>

        <article className="info-card">
          <h2>Frontend</h2>
          <ol>
            <li>Go to frontend folder and run npm.cmd install</li>
            <li>Optional .env file: VITE_API_BASE_URL=http://localhost:3000</li>
            <li>Start frontend with npm.cmd run dev</li>
            <li>Open Voice Console and use Live Mic in Chrome or Edge</li>
          </ol>
        </article>
      </section>
    </main>
  );
}
