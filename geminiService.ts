
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDrinkSuggestions = async (brand: string, input: string): Promise<string[]> => {
  const prompt = `你是一位台灣飲品專家。請列出品牌「${brand}」中名稱包含關鍵字「${input}」的 5 個真實存在的熱門或經典品項。如果是連鎖咖啡廳（如星巴克、路易莎），請優先列出其代表性咖啡或輕食飲品。僅返回一個 JSON 字串陣列，例如 ["品項一", "品項二"]。`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } },
        temperature: 0.2
      }
    });
    return JSON.parse(response.text?.trim() || "[]");
  } catch (error) {
    console.error("Suggestion error:", error);
    return [];
  }
};
