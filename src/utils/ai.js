import { GoogleGenerativeAI } from "@google/generative-ai";

export const processWithGemini = async (apiKey, userText) => {
  // VERSION CHECK: If you don't see this in the console, you have old code.
  console.log("JARVIS AI SYSTEM: Version 2.0 (Gemini 1.5 Flash)"); 

  if (!apiKey) throw new Error("No API Key");

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // USING THE NEW MODEL
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const now = new Date();
  
  const prompt = `
    You are JARVIS, a personal assistant.
    Current Date/Time: ${now.toString()}
    
    User Input: "${userText}"
    
    Analyze the input and return a STRICT JSON object (no markdown) with this format:
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
    return null;
  }
};
