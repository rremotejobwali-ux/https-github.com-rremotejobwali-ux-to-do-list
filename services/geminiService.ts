import { GoogleGenAI, Type } from "@google/genai";

// Initialize the API client
// Note: In a real environment, you might want to handle the case where API_KEY is missing more gracefully in the UI.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Uses Gemini to break down a complex task into actionable subtasks.
 */
export const breakDownTask = async (taskTitle: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Break down the following task into 3 to 5 concise, actionable subtasks: "${taskTitle}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        },
        systemInstruction: "You are a helpful productivity assistant. Keep subtasks short and direct.",
      },
    });

    // Parse the JSON response directly
    const subtasks = JSON.parse(response.text || "[]");
    
    if (Array.isArray(subtasks)) {
        return subtasks;
    }
    return [];

  } catch (error) {
    console.error("Failed to generate subtasks:", error);
    // Rethrow or return empty array depending on desired error handling
    throw error;
  }
};