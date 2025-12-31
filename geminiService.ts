
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

export const estimateCalories = async (brand: string, itemName: string, size: string, sugar: string, toppings: string[]): Promise<number> => {
  const prompt = `估算以下台灣飲品的熱量（kcal）：\n品牌：${brand}\n品項：${itemName}\n容量：${size}\n糖度：${sugar}\n配料：${toppings.join(', ') || '無'}\n請根據台灣營養成分標準提供一個合理的整數數值。僅返回數字本身，不需要單位或文字解釋。`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { temperature: 0.1 }
    });
    const result = parseInt(response.text?.trim() || "0");
    return isNaN(result) ? 0 : result;
  } catch (error) {
    console.error("Calorie estimation error:", error);
    return 0;
  }
};
