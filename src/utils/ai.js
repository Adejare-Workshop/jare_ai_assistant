import { GoogleGenerativeAI } from "@google/generative-ai";

export const processWithGemini = async (apiKey, userText) => {
  if (!apiKey) throw new Error("No API Key");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const now = new Date();
  
  const prompt = `
    You are JARVIS, a personal assistant.
    Current Date/Time: ${now.toString()}
    
    User Input: "${userText}"
    
    Analyze the input and return a STRICT JSON object (no markdown, no extra text) with this format:
    {
      "intent": "task" | "delete" | "query" | "chat",
      "text": "The clean version of the task description",
      "time": "A human readable time string if mentioned (e.g. 5:00 PM), or null",
      "dateObj": "ISO string of the calculated date if mentioned, or null",
      "isUrgent": boolean,
      "isImportant": boolean,
      "response": "A short, robotic, witty response to speak back to the user"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown if Gemini adds it
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Error:", error);
    return null; // Fallback to regex if AI fails
  }
};
