export const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';

/** Free-tier model — Google AI Studio */
export const GEMINI_MODEL = 'gemini-2.0-flash';

export const isGeminiConfigured = (): boolean => Boolean(geminiApiKey.trim());
