function safeJsonParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return fallback;
  }
}

function normalizeValue(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const cleaned = String(value).trim();
  return cleaned.length ? cleaned : null;
}

function mergeData(previous, next) {
  return {
    name: normalizeValue(next.name) || normalizeValue(previous.name),
    budget: normalizeValue(next.budget) || normalizeValue(previous.budget),
    location: normalizeValue(next.location) || normalizeValue(previous.location),
    requirement: normalizeValue(next.requirement) || normalizeValue(previous.requirement)
  };
}

function getMissingFields(data) {
  const requiredFields = ["budget", "location", "requirement"];
  return requiredFields.filter((field) => !normalizeValue(data[field]));
}

function isBookingReady(data) {
  return getMissingFields(data).length === 0;
}

function extractDataFromText(text) {
  const input = String(text || "");

  const nameMatch = input.match(/(?:my name is|i am|this is)\s+([a-zA-Z][a-zA-Z\s'-]{1,40})/i);
  const budgetMatch = input.match(/(?:budget\s*(?:is|:)?\s*|under\s*)(₹|rs\.?|inr|\$)?\s*([\d,]+\s*(?:k|lakh|lakhs|million|m)?)/i);
  const locationMatch = input.match(/(?:in|at|near|location\s*(?:is|:)?\s*)([a-zA-Z][a-zA-Z\s'-]{1,50})/i);
  const requirementMatch = input.match(/((?:\d\s*)?bhk|consultation|apartment|villa|plot|office)/i);

  return {
    name: nameMatch ? nameMatch[1].trim() : null,
    budget: budgetMatch ? `${budgetMatch[1] || ""} ${budgetMatch[2]}`.trim() : null,
    location: locationMatch ? locationMatch[1].trim() : null,
    requirement: requirementMatch ? requirementMatch[1].trim() : null
  };
}

module.exports = {
  safeJsonParse,
  mergeData,
  getMissingFields,
  isBookingReady,
  extractDataFromText
};
