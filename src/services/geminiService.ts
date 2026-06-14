import { geminiApiKey, GEMINI_MODEL, isGeminiConfigured } from '../config/geminiEnv';

type GenerateOptions = {
  systemInstruction: string;
  userPrompt: string;
  maxOutputTokens?: number;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  error?: { message?: string };
};

const callGemini = async ({
  systemInstruction,
  userPrompt,
  maxOutputTokens = 1024,
}: GenerateOptions): Promise<string> => {
  if (!isGeminiConfigured()) {
    throw new Error(
      'Add EXPO_PUBLIC_GEMINI_API_KEY to .env (free key from aistudio.google.com) and restart Expo.'
    );
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens,
      },
    }),
  });

  const data = (await response.json()) as GeminiResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? `Gemini request failed (${response.status})`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    throw new Error('Gemini returned an empty response. Try again.');
  }

  return text;
};

export const generateLoveLetter = async (options: {
  tone: string;
  prompt: string;
  userName: string;
  partnerName: string;
}): Promise<string> => {
  const { tone, prompt, userName, partnerName } = options;

  return callGemini({
    systemInstruction: `You write intimate, heartfelt letters between partners in a couple's app called BETWEEN.
Write in first person as ${userName}, addressing ${partnerName}.
Tone: ${tone}. Warm, specific, never generic or cheesy. No subject line. No sign-off with placeholders.
Keep it 120–220 words. Plain text only — no markdown, bullets, or titles.`,
    userPrompt: prompt.trim() || `Write a ${tone.toLowerCase()} letter to ${partnerName}.`,
    maxOutputTokens: 512,
  });
};

export const generateStoryChapter = async (options: {
  topic: string;
  userName: string;
  partnerName: string;
}): Promise<string> => {
  const { topic, userName, partnerName } = options;

  return callGemini({
    systemInstruction: `You are a literary writer crafting a chapter of a couple's love story for the app BETWEEN.
Write about ${userName} and ${partnerName}. Poetic but grounded, sensory details, emotional honesty.
Format: start with "Chapter I" then two line breaks, then the prose. 200–350 words. Plain text only.`,
    userPrompt: `Write a chapter about: ${topic}`,
    maxOutputTokens: 1024,
  });
};
