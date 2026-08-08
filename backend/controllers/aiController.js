import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

export async function aiSymptomCheck(req, res) {
  try {
    const { symptoms } = req.body;

    if (!symptoms) {
      return res.json({ success: false, message: "Symptoms description is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({ success: false, message: "Gemini API key is not configured on the server. Please add GEMINI_API_KEY to your env." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemInstruction = `
      You are an expert AI clinical assistant for a hospital system called HealthHub.
      Your task is to analyze the patient's symptoms and output a structured JSON response.
      
      Determine:
      1. An analysis summary explaining what their symptoms might suggest (keep it brief, simple, and add a standard medical disclaimer).
      2. The suggested medical specialization the patient should visit. This MUST be one of the following specializations exactly:
         - "General Physician"
         - "Cardiologist"
         - "Dermatologist"
         - "Gynecologist"
         - "Pediatrician"
         - "Ophthalmologist"
         - "Dentist"
         - "Gastroenterologist"
      3. An urgency assessment: "Low", "Medium", or "High".

      You MUST respond ONLY with a JSON object matching this schema:
      {
        "analysis": string,
        "suggestedSpecialty": string,
        "urgency": string
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Patient symptoms: "${symptoms}"`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            analysis: { type: "STRING" },
            suggestedSpecialty: { 
              type: "STRING", 
              enum: [
                "General Physician",
                "Cardiologist",
                "Dermatologist",
                "Gynecologist",
                "Pediatrician",
                "Ophthalmologist",
                "Dentist",
                "Gastroenterologist"
              ] 
            },
            urgency: { type: "STRING", enum: ["Low", "Medium", "High"] }
          },
          required: ["analysis", "suggestedSpecialty", "urgency"]
        }
      }
    });

    const resultText = response.text;
    const jsonResult = JSON.parse(resultText);

    res.json({ success: true, ...jsonResult });
  } catch (error) {
    console.error("AI Symptom check controller error:", error);
    res.json({ success: false, message: "Failed to perform AI symptom analysis: " + error.message });
  }
}
