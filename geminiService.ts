import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // In a real app, this would be handled securely
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash';

// System instruction to guide Gemini to act as a Railway Operations Assistant
const SYSTEM_INSTRUCTION = `
You are the AI Copilot for the Quantum-AI Railway Scheduling System. 
Your role is to assist dispatchers by interpreting natural language commands into structured JSON actions or providing explanations.
The system has Stations (A, B, C, D, E), Tracks (e.g., AB, AC, BC), and Trains.

If the user asks to simulate an event (delay, accident, weather, new train), return a JSON object with the structure:
{
  "type": "SIMULATION_REQUEST",
  "action": "CREATE_INCIDENT" | "DELAY_TRAIN" | "BLOCK_SECTION" | "OPTIMIZE",
  "parameters": { ... }
}

If the user asks for analysis or general questions, return:
{
  "type": "ANALYSIS",
  "message": "Your helpful text response here."
}

Do not include markdown code blocks in your response, just the raw JSON.
`;

export const sendMessageToGemini = async (message: string, history: string[] = []): Promise<any> => {
  try {
    if (!apiKey) {
      console.warn("No API Key provided for Gemini.");
      return {
        type: "ANALYSIS",
        message: "API Key is missing. Simulation features are disabled in this demo."
      };
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: message,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            action: { type: Type.STRING },
            parameters: { type: Type.OBJECT },
            message: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return { type: "ERROR", message: "No response from AI." };
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      type: "ERROR",
      message: "I encountered an error processing your request."
    };
  }
};
