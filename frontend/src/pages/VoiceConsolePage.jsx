import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchBookings, sendLiveTurn, sendVoiceTurn } from "../services/voiceApi";

function toAudioUrl(audio) {
  if (!audio?.base64 || !audio?.mimeType) {
    return null;
  }

  return `data:${audio.mimeType};base64,${audio.base64}`;
}

export default function VoiceConsolePage() {
  const [conversationId, setConversationId] = useState("demo-user-1");
  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState("");
  const [turns, setTurns] = useState([]);
  const [bookings, setBookings] = useState([]);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  const latest = turns[0] || null;

  const fields = useMemo(() => {
    const data = latest?.data || {};
    return [
      { label: "Name", value: data.name || "-" },
      { label: "Budget", value: data.budget || "-" },
      { label: "Location", value: data.location || "-" },
      { label: "Requirement", value: data.requirement || "-" }
    ];
  }, [latest]);

  const bookingBadge = latest?.booking_ready ? "ready" : "collecting";

  useEffect(() => {
    let active = true;

    async function loadBookings() {
      try {
        const nextBookings = await fetchBookings(conversationId);
        if (active) {
          setBookings(nextBookings);
        }
      } catch {
        if (active) {
          setBookings([]);
        }
      }
    }

    loadBookings();

    return () => {
      active = false;
    };
  }, [conversationId]);

  const handleLiveTurn = useCallback(async (transcript) => {
    setLoading(true);
    setError("");

    try {
      const result = await sendLiveTurn({ transcript, conversationId });
      const withAudioUrl = {
        ...result,
        audioUrl: toAudioUrl(result.audio),
        createdAt: new Date().toISOString()
      };

      setTurns((current) => [withAudioUrl, ...current]);
      if (withAudioUrl.booking) {
        setBookings((current) => [withAudioUrl.booking, ...current.filter((item) => item.bookingId !== withAudioUrl.booking.bookingId)]);
      }

      if (withAudioUrl.audioUrl && audioRef.current) {
        audioRef.current.src = withAudioUrl.audioUrl;
        await audioRef.current.play().catch(() => null);
      }
    } catch (submitError) {
      setError(submitError.message || "Unable to process live turn.");
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition || null;

    if (!SpeechRecognition) {
      setMicSupported(false);
      return undefined;
    }

    setMicSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = async (event) => {
      let interim = "";
      let finalized = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const text = event.results[index][0]?.transcript?.trim() || "";
        if (!text) {
          continue;
        }

        if (event.results[index].isFinal) {
          finalized = text;
        } else {
          interim = text;
        }
      }

      setInterimTranscript(interim);

      if (finalized) {
        setInterimTranscript("");
        await handleLiveTurn(finalized);
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== "no-speech") {
        setError(`Microphone error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [handleLiveTurn]);

  function startListening() {
    if (!recognitionRef.current) {
      setError("Live microphone recognition is not supported in this browser.");
      return;
    }

    setError("");
    setInterimTranscript("");
    recognitionRef.current.start();
    setListening(true);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");

    if (!audioFile) {
      setError("Please choose an audio file first.");
      return;
    }

    setLoading(true);

    try {
      const result = await sendVoiceTurn({ audioFile, conversationId });
      const withAudioUrl = {
        ...result,
        audioUrl: toAudioUrl(result.audio),
        createdAt: new Date().toISOString()
      };

      setTurns((current) => [withAudioUrl, ...current]);
      if (withAudioUrl.booking) {
        setBookings((current) => [withAudioUrl.booking, ...current.filter((item) => item.bookingId !== withAudioUrl.booking.bookingId)]);
      }
      setAudioFile(null);
    } catch (submitError) {
      setError(submitError.message || "Unable to process voice request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-card compact">
        <p className="eyebrow">Voice Console</p>
        <h1>Talk live with the assistant or fall back to voice note upload</h1>
        <p className="hero-copy">The same conversation ID keeps memory across turns and booking state.</p>
      </section>

      <section className="console-grid">
        <article className="info-card">
          <h2>Voice Session</h2>
          <div className="hero-actions">
            <button
              className={`btn ${liveMode ? "btn-primary" : "btn-ghost"}`}
              type="button"
              onClick={() => setLiveMode(true)}
            >
              Live Mic
            </button>
            <button
              className={`btn ${liveMode ? "btn-ghost" : "btn-primary"}`}
              type="button"
              onClick={() => setLiveMode(false)}
            >
              Voice Note
            </button>
          </div>

          <form className="stack" onSubmit={onSubmit}>
            <label className="field">
              <span>Conversation ID</span>
              <input
                value={conversationId}
                onChange={(event) => setConversationId(event.target.value)}
                placeholder="user-123"
                required
              />
            </label>

            {liveMode ? (
              <>
                <div className="field">
                  <span>Live Microphone</span>
                  <div className="hero-actions">
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={startListening}
                      disabled={loading || listening || !micSupported}
                    >
                      {listening ? "Listening..." : "Start Talking"}
                    </button>
                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={stopListening}
                      disabled={!listening}
                    >
                      Stop
                    </button>
                  </div>
                  <p className="booking-text">
                    {micSupported
                      ? "Speak naturally. Each final spoken phrase is sent to the backend automatically."
                      : "This browser does not support live speech recognition. Try Chrome or Edge."}
                  </p>
                  {interimTranscript ? (
                    <p className="booking-text">
                      <strong>Hearing:</strong> {interimTranscript}
                    </p>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <label className="field">
                  <span>Audio File</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(event) => setAudioFile(event.target.files?.[0] || null)}
                    required={!liveMode}
                  />
                </label>

                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? "Processing..." : "Send to AI Agent"}
                </button>
              </>
            )}
          </form>

          {error ? <p className="error-text">{error}</p> : null}
          <audio ref={audioRef} controls />
        </article>

        <article className="info-card status-card">
          <h2>Current State</h2>
          <div className={`badge badge-${bookingBadge}`}>{bookingBadge.toUpperCase()}</div>
          <div className="field-grid">
            {fields.map((item) => (
              <div className="field-item" key={item.label}>
                <p>{item.label}</p>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
          {latest?.booking ? (
            <p className="booking-text">{latest.booking.summary}</p>
          ) : (
            <p className="booking-text">Booking will trigger automatically once required fields are complete.</p>
          )}

          <div className="saved-bookings">
            <h2>Saved Meetings</h2>
            {bookings.length === 0 ? (
              <p className="booking-text">No meetings stored for this conversation yet.</p>
            ) : (
              bookings.map((booking) => (
                <article className="booking-card" key={booking.bookingId}>
                  <p className="turn-meta">{booking.bookingId}</p>
                  <p>{booking.summary}</p>
                  <p className="booking-meta">
                    <strong>Status:</strong> {booking.status}
                  </p>
                  <p className="booking-meta">
                    <strong>Slot:</strong> {booking.scheduledWindow}
                  </p>
                  <p className="booking-meta">
                    <strong>Created:</strong> {new Date(booking.createdAt).toLocaleString()}
                  </p>
                </article>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="timeline">
        <h2>Conversation Turns</h2>

        {turns.length === 0 ? (
          <article className="turn-card empty">
            <p>No turns yet. Start a live mic session or upload your first audio message.</p>
          </article>
        ) : (
          turns.map((turn, index) => (
            <article className="turn-card" key={`${turn.createdAt}-${index}`}>
              <p className="turn-meta">Intent: {turn.intent || "collect_info"}</p>
              <p>
                <strong>User (transcript):</strong> {turn.transcript}
              </p>
              <p>
                <strong>Assistant:</strong> {turn.reply}
              </p>
              {turn.audioUrl ? <audio controls src={turn.audioUrl} /> : null}
            </article>
          ))
        )}
      </section>
    </main>
  );
}
