const memoryService = require("./memory.service");
const {
  createAppointment,
  findLatestAppointmentByConversation
} = require("./booking.service");
const { generateAssistantJson } = require("./llm.service");
const {
  mergeData,
  getMissingFields,
  isBookingReady,
  extractDataFromText
} = require("../utils/helpers");

function defaultResponse(data) {
  const missing = getMissingFields(data);
  const nextField = missing[0];

  const fieldPrompts = {
    budget: "Could you share your budget range?",
    location: "Which location are you looking at?",
    requirement: "What exactly are you looking for, for example 2BHK or consultation?"
  };

  return {
    reply: fieldPrompts[nextField] || "Could you share one more detail so I can proceed?",
    intent: "ask_question",
    data,
    booking_ready: false
  };
}

async function handleConversationTurn({ conversationId, userText }) {
  const state = memoryService.getState(conversationId);
  const persistedBooking = state.booking || await findLatestAppointmentByConversation(conversationId);

  if (persistedBooking) {
    memoryService.updateState(conversationId, (current) => ({
      ...current,
      data: {
        ...current.data,
        ...(persistedBooking.data || {})
      },
      booking: persistedBooking,
      completed: true
    }));

    return {
      reply: "Your appointment is already confirmed. If you want, I can help you create another one.",
      intent: "completed",
      data: {
        ...state.data,
        ...(persistedBooking.data || {})
      },
      booking_ready: true,
      booking: persistedBooking
    };
  }

  const heuristicsData = extractDataFromText(userText);
  const mergedPreLlm = mergeData(state.data, heuristicsData);
  const missingPreLlm = getMissingFields(mergedPreLlm);

  let assistantJson;

  if (missingPreLlm.length === 0) {
    assistantJson = {
      reply: "Perfect, I have everything I need. I am booking your appointment now.",
      intent: "booking",
      data: mergedPreLlm,
      booking_ready: true
    };
  } else {
    const llmJson = await generateAssistantJson({
      userText,
      memoryData: mergedPreLlm,
      missingFields: missingPreLlm,
      recentMessages: state.messages.slice(-6)
    });

    const mergedPostLlm = mergeData(mergedPreLlm, llmJson.data || {});
    assistantJson = {
      ...defaultResponse(mergedPostLlm),
      ...llmJson,
      data: mergedPostLlm,
      booking_ready: isBookingReady(mergedPostLlm) || Boolean(llmJson.booking_ready)
    };
  }

  let booking = persistedBooking;
  let finalReply = assistantJson.reply;

  if (assistantJson.booking_ready && !booking) {
    booking = await createAppointment({
      conversationId,
      data: assistantJson.data
    });
    finalReply = `${assistantJson.reply} ${booking.summary} Your booking ID is ${booking.bookingId}.`;
  }

  const updated = memoryService.updateState(conversationId, (current) => ({
    ...current,
    data: assistantJson.data,
    booking,
    completed: Boolean(booking),
    messages: [
      ...current.messages,
      { role: "user", content: userText },
      { role: "assistant", content: finalReply }
    ]
  }));

  return {
    reply: finalReply,
    intent: booking ? "completed" : assistantJson.intent,
    data: updated.data,
    booking_ready: Boolean(booking),
    booking
  };
}

module.exports = {
  handleConversationTurn
};
