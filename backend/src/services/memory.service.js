const { env } = require("../config/env");

class MemoryService {
  constructor() {
    this.store = new Map();
  }

  getState(conversationId) {
    if (!this.store.has(conversationId)) {
      this.store.set(conversationId, {
        messages: [],
        data: {
          name: null,
          budget: null,
          location: null,
          requirement: null
        },
        booking: null,
        completed: false,
        updatedAt: new Date().toISOString()
      });
    }

    return this.store.get(conversationId);
  }

  updateState(conversationId, updater) {
    const current = this.getState(conversationId);
    const updated = updater({ ...current, messages: [...current.messages] });

    if (Array.isArray(updated.messages) && updated.messages.length > env.MAX_CONTEXT_MESSAGES) {
      updated.messages = updated.messages.slice(-env.MAX_CONTEXT_MESSAGES);
    }

    updated.updatedAt = new Date().toISOString();
    this.store.set(conversationId, updated);

    return updated;
  }
}

module.exports = new MemoryService();
