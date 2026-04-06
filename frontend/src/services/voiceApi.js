const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:3000" : "");

export function getApiBaseUrl() {
  return API_BASE_URL || "";
}

function buildUrl(pathname) {
  if (!API_BASE_URL) {
    throw new Error(
      "VITE_API_BASE_URL is not set. Add the Railway backend URL in frontend/.env or Vercel environment variables."
    );
  }

  return `${API_BASE_URL}${pathname}`;
}

export async function sendVoiceTurn({ audioFile, conversationId }) {
  const formData = new FormData();
  formData.append("audio", audioFile);

  if (conversationId) {
    formData.append("conversationId", conversationId);
  }

  let response;

  try {
    response = await fetch(buildUrl("/api/voice"), {
      method: "POST",
      body: formData
    });
  } catch {
    throw new Error(
      `Cannot reach backend at ${API_BASE_URL || "<missing>"}. Check VITE_API_BASE_URL, Railway deployment, and CORS.`
    );
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "Voice request failed");
  }

  return payload;
}

export async function sendLiveTurn({ transcript, conversationId }) {
  let response;

  try {
    response = await fetch(buildUrl("/api/live-turn"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transcript,
        conversationId
      })
    });
  } catch {
    throw new Error(
      `Cannot reach backend at ${API_BASE_URL || "<missing>"}. Check VITE_API_BASE_URL, Railway deployment, and CORS.`
    );
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "Live turn request failed");
  }

  return payload;
}

export async function fetchBookings(conversationId) {
  const response = await fetch(
    buildUrl(`/api/bookings?conversationId=${encodeURIComponent(conversationId)}`)
  );
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "Unable to fetch bookings");
  }

  return payload.bookings || [];
}

export { API_BASE_URL };
