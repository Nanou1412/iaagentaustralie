export { sendMessage, formatConversationHistory } from "./ai";
export { industries, getIndustryBySlug, getAvailableIndustries } from "./industry-config";
export {
  checkSpeechSupport,
  getSpeechRecognition,
  speak,
  stopSpeaking,
  isSpeaking,
} from "./speech";
export { validateAIRequest, validateAIResponse, generateId } from "./validation";
export * from "./constants";
