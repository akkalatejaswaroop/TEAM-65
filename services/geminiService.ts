import { GoogleGenAI } from '@google/genai';

// Initialize the client safely.
// In a real production app, API keys should be proxied via backend to avoid exposure.
// For this MVP demo running client-side, we assume process.env.API_KEY is injected.
const apiKey = process.env.API_KEY || 'mock-key'; 
const ai = new GoogleGenAI({ apiKey });

export const translateText = async (text: string, targetLang: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("Using mock translation due to missing API Key");
    return `[Mock Translated to ${targetLang}]: ${text}`;
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Translate the following text into ${targetLang}. Only return the translated text, nothing else.\n\nText: "${text}"`;
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    
    return response.text || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Fallback to original
  }
};

export const getCareerAdvice = async (resumeText: string, language: string): Promise<string> => {
  if (!process.env.API_KEY) {
     return `[Mock Career Advice] 
     1. Update your skills section to include more React projects.
     2. Network with senior developers on LinkedIn.
     3. Focus on system design fundamentals.
     
     (Summary in ${language} would appear here)`;
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `You are an expert AI Career Coach for the Indian job market. 
    Analyze the following resume/skills text and provide:
    1. 3 specific actionable improvements.
    2. 2 potential job roles suitable for this profile.
    3. A brief summary of advice in the ${language} language.
    
    Resume Text: "${resumeText}"`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Could not generate advice.";
  } catch (error) {
    console.error("Career coach error:", error);
    return "Error connecting to AI Coach. Please try again.";
  }
};