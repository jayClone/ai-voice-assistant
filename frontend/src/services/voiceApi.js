const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export async function sendVoiceTurn({ audioFile, conversationId }) {
  const formData = new FormData();
  formData.append("audio", audioFile);

  if (conversationId) {
    formData.append("conversationId", conversationId);
  }

  const response = await fetch(`${API_BASE_URL}/api/voice`, {
    method: "POST",
    body: formData
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "Voice request failed");
  }

  return payload;
}

export async function sendLiveTurn({ transcript, conversationId }) {
  const response = await fetch(`${API_BASE_URL}/api/live-turn`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      transcript,
      conversationId
    })
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "Live turn request failed");
  }

  return payload;
}

export async function fetchBookings(conversationId) {
  const response = await fetch(
    `${API_BASE_URL}/api/bookings?conversationId=${encodeURIComponent(conversationId)}`
  );
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "Unable to fetch bookings");
  }

  return payload.bookings || [];
}

export { API_BASE_URL };
