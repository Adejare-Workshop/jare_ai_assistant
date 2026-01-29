import { GoogleGenerativeAI } from "@google/generative-ai";

export const processWithGemini = async (apiKey, userText) => {
  // VERSION CHECK: Look for "Version 5.0" in console
  console.log("JARVIS SYSTEM: Version 5.0 (Gemini 2.5 Flash Active)"); 

  if (!apiKey) throw new Error("No API Key");

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // *** CRITICAL FIX: Switched to Gemini 2.5 Flash ***
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const now = new Date();
  
  const prompt = `
    You are JARVIS. Current Time: ${now.toString()}.
    User Input: "${userText}"
    Return JSON:
    {
      "intent": "task" | "delete" | "query" | "chat",
      "text": "Clean task description or answer",
      "time": "Human readable time or null",
      "dateObj": "ISO string or null",
      "isUrgent": boolean,
      "isImportant": boolean,
      "response": "Robotic, witty response."
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Error:", error);
    // If 2.5 fails, fallback to 2.0
    if (error.message.includes("404")) {
        console.warn("Gemini 2.5 not found, please check API documentation for latest model.");
    }
    return null;
  }
};
