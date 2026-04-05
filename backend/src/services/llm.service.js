const { GoogleGenerativeAI } = require("@google/generative-ai");
const { env } = require("../config/env");
const { safeJsonParse } = require("../utils/helpers");
const logger = require("../utils/logger");

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

function buildFallbackReply({ userText, memoryData, missingFields }) {
  const normalizedText = String(userText || "").toLowerCase();
  const nextField = missingFields[0];

  if (normalizedText.includes("hello") || normalizedText.includes("hi") || normalizedText.includes("hey")) {
    return "Hello! I can help you book a real estate meeting. Could you share your budget range?";
  }

  if (normalizedText.includes("price") || normalizedText.includes("budget")) {
    return "Please share your expected budget range so I can narrow suitable options.";
  }

  if (normalizedText.includes("location") || normalizedText.includes("area")) {
    return "Tell me the location or area you are interested in.";
  }

  if (normalizedText.includes("2bhk") || normalizedText.includes("3bhk") || normalizedText.includes("villa")) {
    return "That helps. Could you also share your budget and preferred location?";
  }

  const prompts = {
    budget: "Could you share your budget range for the property?",
    location: "Which city or area are you looking at?",
    requirement: "What type of property do you need, for example 2BHK, villa, plot, or office?"
  };

  if (nextField) {
    return prompts[nextField];
  }

  if (memoryData?.budget && memoryData?.location && memoryData?.requirement) {
    return "Perfect, I have everything I need. I am booking your real estate consultation now.";
  }

  return "I can help you book a real estate meeting. Please share your budget, preferred location, and property requirement.";
}

function buildFallbackAssistantJson({ userText, memoryData, missingFields }) {
  const mergedData = {
    name: memoryData?.name ?? null,
    budget: memoryData?.budget ?? null,
    location: memoryData?.location ?? null,
    requirement: memoryData?.requirement ?? null
  };

  return {
    reply: buildFallbackReply({ userText, memoryData: mergedData, missingFields }),
    intent: missingFields.length === 0 ? "booking" : "ask_question",
    data: mergedData,
    booking_ready: missingFields.length === 0
  };
}

async function generateAssistantJson({ userText, memoryData, missingFields, recentMessages }) {
  const userPayload = {
    user_text: userText,
    known_data: memoryData,
    missing_fields: missingFields,
    recent_messages: recentMessages
  };

  try {
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
  } catch (error) {
    logger.warn("llm.service", "Gemini request failed. Using fallback assistant logic.", {
      message: error.message,
      status: error.status,
      code: error.code
    });

    return buildFallbackAssistantJson({
      userText,
      memoryData,
      missingFields
    });
  }
}

module.exports = {
  generateAssistantJson
};
