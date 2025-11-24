import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Edits an image using Gemini 2.5 Flash Image (Nano Banana).
 * 
 * @param base64Image Full data URL or base64 string of the source image.
 * @param mimeType The MIME type of the image (e.g., image/jpeg).
 * @param prompt The text instruction for editing.
 * @returns The base64 data URL of the generated image.
 */
export const editImageWithGemini = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string | null> => {
  try {
    const ai = getAiClient();
    
    // Ensure we strip the data URL prefix if present to get raw base64
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    // Gemini 2.5 Flash Image (Nano Banana)
    const modelId = 'gemini-2.5-flash-image';

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      // Constraints for Nano Banana models:
      // - Do NOT set responseMimeType
      // - Do NOT set responseSchema
    });

    // Iterate through parts to find the image
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          // Construct the data URL
          const resultMimeType = part.inlineData.mimeType || 'image/png';
          return `data:${resultMimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
