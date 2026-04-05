const { GoogleGenerativeAI } = require("@google/generative-ai");
const { env } = require("../config/env");
const { safeJsonParse } = require("../utils/helpers");

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });

const SYSTEM_PROMPT = `You are a natural, human-like voice assistant helping users book appointments.

Rules:
1) Ask only one question at a time.
2) Never ask redundant questions if data already exists.
3) Guide the user toward appointment booking.
4) Keep replies conversational and concise.
5) Always return strict JSON only with this shape:
{
  "reply": "Natural conversational response",
  "intent": "collect_info | ask_question | booking | completed",
  "data": {
    "name": null,
    "budget": null,
    "location": null,
    "requirement": null
  },
  "booking_ready": false
}
6) name is optional, but budget, location, and requirement are required.
7) If required fields are complete, set booking_ready to true.
8) Do not include markdown, code fences, or extra text.`;

async function generateAssistantJson({ userText, memoryData, missingFields, recentMessages }) {
  const userPayload = {
    user_text: userText,
    known_data: memoryData,
    missing_fields: missingFields,
    recent_messages: recentMessages
  };

  const completion = await model.generateContent({
    generationConfig: {
      temperature: 0.3,
      responseMimeType: "application/json"
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${SYSTEM_PROMPT}\n\nInput:\n${JSON.stringify(userPayload)}`
          }
        ]
      }
    ]
  });

  const raw = completion.response?.text?.() || "{}";
  const parsed = safeJsonParse(raw, {});

  return {
    reply: parsed.reply || "Thanks. Could you share a bit more detail so I can help you book this?",
    intent: parsed.intent || "collect_info",
    data: {
      name: parsed?.data?.name ?? null,
      budget: parsed?.data?.budget ?? null,
      location: parsed?.data?.location ?? null,
      requirement: parsed?.data?.requirement ?? null
    },
    booking_ready: Boolean(parsed.booking_ready)
  };
}

module.exports = {
  generateAssistantJson
};
