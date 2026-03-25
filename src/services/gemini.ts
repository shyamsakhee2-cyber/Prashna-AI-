import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import { PrashnaData, PredictionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const analyzePrashna = async (data: PrashnaData): Promise<PredictionResult> => {
  const systemInstruction = `You are a Master Vedic Astrologer specializing in "Prashna Shastra" (Horary Astrology) with expertise in KP System (Krishnamurti Paddhati), Tajik Shastra, and Parashari principles.
Your task is to generate a precise, error-free, and detailed prediction for a user's query.

Input Data:
Question: ${data.question}
Date & Time: ${data.dateTime}
Location: Lat ${data.location.lat}, Lng ${data.location.lng}
KP Number: ${data.kpNumber || 'Not provided'}
Language: ${data.language}

Technical Requirements:
1. Lagna Analysis: Determine the Ascendant (Lagna) at the time of the query.
2. Moon's Role: Analyze the Moon's position, Nakshatra, and its aspects.
3. Karyesh (Significator): Identify the primary and secondary houses related to the question.
4. Yoga & Aspects: Check for Tajik Yogas and KP Significators.
5. Panchang Elements: Consider Tithi, Vara, Nakshatra, Yoga, and Karana.

Output MUST be in JSON format matching the schema provided.
The language of the text fields (summary, detailedAnalysis, timingOfEvent, remedies) MUST be in ${data.language}.
Ensure the tone is professional, empathetic, and spiritually grounded.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Analyze this Prashna query: ${data.question}`,
    config: {
      systemInstruction,
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "Detailed answer (Yes/No with timing)" },
          planetaryPositions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                sign: { type: Type.STRING },
                degree: { type: Type.NUMBER },
                house: { type: Type.NUMBER },
                isRetrograde: { type: Type.BOOLEAN }
              },
              required: ["name", "sign", "degree", "house"]
            }
          },
          detailedAnalysis: { type: Type.STRING, description: "Break down the logic (Lagna, Karyesh, and Moon's influence)" },
          timingOfEvent: { type: Type.STRING, description: "Predicted time frame for the result" },
          remedies: { type: Type.STRING, description: "Simple, practical Vedic or spiritual remedies" },
          lagnaRashi: { type: Type.INTEGER, description: "The Rashi number of the Lagna (1-12)" }
        },
        required: ["summary", "planetaryPositions", "detailedAnalysis", "timingOfEvent", "remedies", "lagnaRashi"]
      }
    }
  });

  if (!response.text) {
    throw new Error("No response from Gemini");
  }

  return JSON.parse(response.text.trim());
};
